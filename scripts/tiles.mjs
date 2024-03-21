import { XYZ } from 'ol/source.js';
import { fromLonLat as ll } from 'ol/proj.js';

const source = new XYZ({
	url: 'https://server/path/to/tiles/{z}/{x}/{y}.png',
});
const extent = [...ll([15.5, 47.5]), ...ll([16.0, 48.0])];
const tileGrid = source.getTileGrid();
const getUrl = source.getTileUrlFunction();
const offlineTiles = [];
for (let z = 0; z <= 15; ++z) {
	tileGrid.forEachTileCoord(extent, z, (tileCoord) => {
		offlineTiles.push(getUrl(tileCoord));
	});
};
console.log(offlineTiles);
