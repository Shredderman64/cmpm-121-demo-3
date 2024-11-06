// todo
import leaflet from "leaflet";
// import luck from "./luck.ts";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./leafletWorkaround.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;

const appName = "Technically (not) NFTs";
document.title = appName;

const header = document.createElement("h1");
header.innerHTML = appName;
app.prepend(header);

const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);

const ZOOM_LEVEL = 19;

const map = leaflet.map(document.getElementById("map")!, {
  center: OAKES_CLASSROOM,
  zoom: ZOOM_LEVEL,
  scrollWheelZoom: false,
});

leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: ZOOM_LEVEL,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

const playerMarker = leaflet.marker(OAKES_CLASSROOM);
playerMarker.bindTooltip("Hi");
playerMarker.addTo(map);

const uselessButton = document.createElement("button");
uselessButton.innerHTML = "Click me";
uselessButton.addEventListener("click", () => {
  alert("You clicked the button");
});
app.append(uselessButton);
