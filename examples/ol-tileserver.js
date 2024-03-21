import "ol/ol.css";
import "./style.css";
import { Map, View } from "ol";
import { fromLonLat } from "ol/proj";
import TileLayer from "ol/layer/Tile";
import { XYZ } from "ol/source";

const styleUrl =
	"https://www.arcgis.com/sharing/rest/content/items/659e7c1b1e374f6c8a89eefe17b23380/resources/styles/root.json"

function showMap(baseUrl) {
	document.getElementById('map').classList.remove('show-dialog');
	const map = new Map({
		target: "map",
		layers: [
			new TileLayer({
				source: new XYZ({
					url: `${baseUrl}tiles/{z}/{x}/{y}.png?style=${styleUrl}`,
					tileSize: 512,
				})
			})
		],
		view: new View({
			center: fromLonLat([10.01, 53.55]),
			zoom: 11.5,
		}),
	});
}

document.getElementById('key-form').addEventListener('submit', (event) => {
  showMap(event.target.elements['key'].value);
});
document.getElementById('baseurl').focus()