
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import GeoJSON from 'ol/format/GeoJSON.js'
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import { useGeographic } from 'ol/proj.js';
import { register } from 'ol/proj/proj4.js';
import {Draw, Modify, Snap} from 'ol/interaction.js';


import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

import { apply } from "ol-mapbox-style";
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import proj4 from 'proj4';
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
        zoom: 16,
        center: [9.9696, 53.4620]
      }); 
      updateCodePart(`let view = map.getView();
view.animate({
  zoom: 16,
  center: [9.9696, 53.4620]
});`
      );
      break;
    case 'basemap':
      let reorder = () => {
        if (window.geb) {
          map.removeLayer(window.geb);
          map.addLayer(window.geb);
        }
      };
      // https://basemap.de/data/produkte/web_vektor/styles/bm_web_bin.json
      let url = "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor" +
        "/styles/bm_web_col.json"
      apply(map, url).then(reorder).catch(reorder);
      
      updateCodePart(`import { apply } from "ol-mapbox-style";
apply(
  map,
  "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json"
);`
      );
      break;
    case 'fossgis-geb':
      let source = new VectorSource({
        url: 'https://gisdemo.dp.dsecurecloud.de/FOSSGIS_2024/resources/fossgis_gebaeudeumrisse_25832.geojson',
        format: new GeoJSON()
      });
      let geb = new VectorLayer({
        source: source,
        style: {
          'stroke-color': 'black',
          'stroke-width': 1.5,
          'fill-color': '#ee8000'
        }
      });
      map.addLayer(geb);
      window.source = source;
      window.geb = geb;
      updateCodePart(`let source = new VectorSource({
  url: 'https://example.com/fossgis_gebaeudeumrisse_25832.geojson',
  format: new GeoJSON()
});
let umring = new VectorLayer({
  source: source,
  style: {
    'stroke-color': 'black',
    'stroke-width': 1.5,
    'fill-color': '#ee8000'
  }
});`);
      break;
    case 'draw':
      const vecSource = window.source;
      if(!vecSource) {
        return;
      }
      const modify = new Modify({ source: vecSource });
      map.addInteraction(modify);
      const draw = new Draw({
        source: vecSource,
        type: 'Polygon'
      });
      map.addInteraction(draw);
      const snap = new Snap({source: vecSource});
      map.addInteraction(snap);
      updateCodePart(`let modify = new Modify({source: source});
let draw = new Draw({
  source: source,
  type: 'Polygon'
});
let snap = new Snap({source: vecSource});`)
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


