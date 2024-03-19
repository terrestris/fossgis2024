import "ol/ol.css";
import "./style.css";
import { apply } from "ol-mapbox-style";
import { fromLonLat } from "ol/proj";

const basemap =
	"https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/" +
	"styles/bm_web_col.json";

apply("map", basemap).then((map) =>
	map.getView().animate({
		center: fromLonLat([10.01, 53.55]),
		zoom: 9.5,
	}),
);