
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js'
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';

import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

import { apply as applyMapboxStyle } from "ol-mapbox-style";
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import proj4 from 'proj4';
import { Fill, Stroke, Style } from 'ol/style';
proj4.defs("EPSG:25832","+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs");
register(proj4);

const updateCodePart = (snippet, lang = 'javascript') => {
  const highlightedCode = hljs.highlight(
    snippet.trim(),
    { language: lang }
  ).value
  
  document.getElementById('innercode').innerHTML = highlightedCode;
};


const onDragstart = (evt) => {
  evt.dataTransfer.setData("MJMJ", evt.target.id);
  evt.dataTransfer.dropEffect = "copy";
};
const onDragover = (evt) => {
  evt.preventDefault();
};
const onDrop = (evt) => {
  evt.preventDefault();
  const data = evt.dataTransfer.getData("MJMJ"); 
  handleMapAction(data);
};

const items = document.querySelectorAll('.item');
items.forEach(item => {
  item.addEventListener("dragstart", onDragstart);
});

const mapDiv = document.getElementById('map');

mapDiv.addEventListener('drop', onDrop)
mapDiv.addEventListener('dragover', onDragover);
const handleMapAction = (action) => {
  switch(action) {
    case 'osm':
      let layer = new TileLayer({
        source: new OSM(),
      });
      map.addLayer(layer);
      updateCodePart(`let layer = new TileLayer({
  source: new OSM(),
});
map.addLayer(layer);`
      );
      break;
    case 'recenterAndZoom':
      let view = map.getView();
      view.animate({
        zoom: 17,
        center: [9.969576624771204, 53.461975762614486]
      }); 
      updateCodePart(`let view = map.getView();
view.animate({
  zoom: 9,
  center: [9.993682, 53.551086]
});`
      );
        break;
    case 'basemap':
      applyMapboxStyle(
        map,
        "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json"
      );
      break;
    case 'fossgis-geb':
      let source = new VectorSource({
        url: 'https://gisdemo.dp.dsecurecloud.de/FOSSGIS_2024/resources/fossgis_gebaeudeumrisse_25832.geojson',
        format: new GeoJSON()
      });
      let umring = new VectorLayer({
        source: source,
        style: new Style({
          fill: new Fill({
            color: '#ee8000'
          }),
          stroke: new Stroke({
            color: 'black',
            width: 1.3
          })
        })
      });
      map.addLayer(umring);
      break;
    default:
      console.log('Undefined map action');
  }
}

useGeographic();
const map = new Map({
  layers: [],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
window.map = map;

updateCodePart(`
const map = new Map({
  layers: [],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});`);


