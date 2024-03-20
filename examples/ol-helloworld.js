import 'ol/ol.css';
import './style.css';

import {Feature, Map, View} from 'ol';
import {Vector as VectorLayer, Group} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source';
import {GeoJSON} from 'ol/format';
import { useGeographic } from 'ol/proj';
import { Point } from 'ol/geom';
import { Draw } from 'ol/interaction';
import apply from 'ol-mapbox-style';
import { containsCoordinate } from 'ol/extent';

import Uppy from "@uppy/core";
import Dashboard from "@uppy/dashboard";
import Webcam from "@uppy/webcam";
import BasePlugin from '@uppy/core/lib/BasePlugin.js';

import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import "@uppy/webcam/dist/style.min.css";

class UploadToDataURI extends BasePlugin {
	constructor(uppy) {
		super(uppy, {});
    this.id = 'UploadToDataURI';
    this.type = 'uploader';
		this.upload = this.upload.bind(this);
	}

	upload(fileIDs) {
    const files = fileIDs.map(fileID => this.uppy.getFile(fileID));
    this.uppy.emit('upload-start', files);
    return Promise.all(files.map(file => {
      const reader = new FileReader();
      return new Promise(resolve => {
        reader.addEventListener('load', () => {
          this.uppy.emit('upload-success', file, { status: 200, body: file.data, uploadURL: reader.result});
          resolve(file);
        });
        reader.readAsDataURL(file.data);
      });
    }));
	}

	install() {
		this.uppy.addUploader(this.upload);
	}

	uninstall() {
		this.uppy.removeUploader(this.upload);
	}
}

const uppy = new Uppy({ restrictions: { maxNumberOfFiles: 1, allowedFileTypes: ["image/*"]}})
  .use(Dashboard)
  .use(Webcam, { target: Dashboard, modes: ["picture"]})
  .use(UploadToDataURI);

useGeographic();

const basemap = new Group();
apply(
  basemap,
  "https://www.arcgis.com/sharing/rest/content/items/659e7c1b1e374f6c8a89eefe17b23380/resources/styles/root.json",
  {
    transformRequest: (url) =>
      url.replace(/\/VectorTileServer$/, "/VectorTileServer/"),
  },
);

const markers = new VectorSource();
if (localStorage.getItem('markers')) {
  markers.addFeatures(new GeoJSON().readFeatures(localStorage.getItem('markers')));
}

const view = new View({
  center: [0, 0],
  zoom: 2
});

const map = new Map({
  target: 'map',
  layers: [
    basemap,
    new VectorLayer({
      source: markers,
      style: [{
        filter: ["==", ["get", "type"], "geo-location"],
        style: {
          "icon-src": '../img/location-crosshairs.svg',
          "icon-opacity": 0.4
        },
      }, {
        else: true,
        style: {
          "circle-radius": 13,
          "circle-stroke-color": "rgba(0, 0, 0, 0.7)",
          "circle-stroke-width": 10,
          "circle-fill-color": "rgba(0, 0, 0, 0.01)"
        }
      }]
    })
  ],
  view
});

const positionFeature = new Feature({
  type: 'geo-location',
});
markers.addFeature(positionFeature);
navigator.geolocation.watchPosition(({coords: {latitude, longitude}}) => {
  const position = [longitude, latitude];
  positionFeature.setGeometry(new Point(position));
  if (view.getZoom() < 14 || containsCoordinate(view.calculateExtent(), position)) {
    map.getView().animate({
      center: position,
      zoom: view.getZoom() < 14 ? 14 : undefined,
      duration: 500
    });
  }
});

const draw = new Draw({
  style: {"circle-radius": 13, "circle-stroke-color": "rgba(0, 0, 0, 0.2)", "circle-stroke-width": 10},
  source: markers,
  type: 'Point'
});
let drawnFeature;
uppy.on('dashboard:modal-closed', () => {
  if (!drawnFeature) { return };
  markers.removeFeature(drawnFeature);
});
uppy.on('complete', ({successful: [file]}) => {
  drawnFeature.set('picture', file.uploadURL);
  drawnFeature = undefined;
  uppy.cancelAll();
  uppy.getPlugin('Dashboard').closeModal();
});
draw.on(['drawend', 'drawabort'], ({feature}) => {
  drawnFeature = feature;
  map.removeInteraction(draw);
  uppy.getPlugin('Dashboard').openModal();
});
document.querySelector('#picture button').addEventListener('click', () => {
  map.addInteraction(draw);
});

const pictureContainer = document.querySelector('#picture-container');
document.querySelector('#picture-container button').addEventListener('click', () => {
  pictureContainer.style.display = 'none';
});
document.addEventListener('keydown', ({key}) => {
  if (key === 'Escape') {
    pictureContainer.style.display = 'none';
  }
});

map.on('click', ({pixel}) => {
  const feature = map.forEachFeatureAtPixel(pixel, feature => feature.get('picture') && feature);
  if (feature) {
    pictureContainer.style.display = 'block';
    pictureContainer.querySelector('img').src = feature.get('picture');
  }
});
map.on('pointermove', ({pixel}) => {
  const feature = map.forEachFeatureAtPixel(pixel, feature => feature.get('picture') && feature);
  map.getTargetElement().style.cursor = feature ? 'pointer' : '';
});

markers.on('change', () => {
  const features = markers.getFeatures().filter(feature => feature.get('picture'));
  localStorage.setItem('markers', new GeoJSON().writeFeatures(features));
});