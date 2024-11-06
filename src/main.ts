// todo
import leaflet from "leaflet";
import luck from "./luck.ts";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./leafletWorkaround.ts";

const app = document.querySelector<HTMLDivElement>("#app")!;

const appName = "Technically (not) NFTs";
document.title = appName;

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;

const header = document.createElement("h1");
header.innerHTML = appName;
statusPanel.append(header);

const playerTokens = 0;
const tokenMessage = document.createElement("p");
tokenMessage.innerHTML = `Tokens: ${playerTokens}`;
statusPanel.append(tokenMessage);

const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);

const NEIGHBORHOOD_SIZE = 8;
const SPAWN_CHANCE = 0.1;
const TILE_DEGREES = 1e-4;
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

function spawnCache(i: number, j: number) {
  const origin = OAKES_CLASSROOM;
  const bounds = leaflet.latLngBounds([
    [origin.lat + i * TILE_DEGREES, origin.lng + j * TILE_DEGREES],
    [origin.lat + (i + 1) * TILE_DEGREES, origin.lng + (j + 1) * TILE_DEGREES],
  ]);

  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);
}

for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
  for (let j = -NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
    if (luck([i, j].toString()) < SPAWN_CHANCE) {
      spawnCache(i, j);
    }
  }
}

const uselessButton = document.createElement("button");
uselessButton.innerHTML = "Click me";
uselessButton.addEventListener("click", () => {
  alert("You clicked the button");
});
app.append(uselessButton);
