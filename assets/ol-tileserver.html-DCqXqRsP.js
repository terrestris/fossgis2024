import{Q as t,R as s,V as o,S as r}from"./Tile-CNT6xDI4.js";/* empty css              */import{X as n}from"./XYZ-DYJ4F8ul.js";const a="https://www.arcgis.com/sharing/rest/content/items/659e7c1b1e374f6c8a89eefe17b23380/resources/styles/root.json";function m(e){document.getElementById("map").classList.remove("show-dialog"),new t({target:"map",layers:[new s({source:new n({url:`${e}tiles/{z}/{x}/{y}.png?style=${a}`,tileSize:512})})],view:new o({center:r([10.01,53.55]),zoom:11.5})})}document.getElementById("key-form").addEventListener("submit",e=>{m(e.target.elements.key.value)});document.getElementById("baseurl").focus();
