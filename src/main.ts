// todo
import leaflet from "leaflet";
import luck from "./luck.ts";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./leafletWorkaround.ts";

const appName = "Technically (not) NFTs";
document.title = appName;

const statusPanel = document.querySelector<HTMLDivElement>("#statusPanel")!;

const header = document.createElement("h1");
header.innerHTML = appName;
statusPanel.append(header);

// interface Token {
//   i: number,
//   j: number
// }

let playerTokens = 0;
const tokenMessage = document.createElement("p");
tokenMessage.innerHTML = `Tokens: <span id=value>${playerTokens}</span>`;
statusPanel.append(tokenMessage);

const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);

const ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4;
const NEIGHBORHOOD_SIZE = 8;
const DROP_CHANCE = 0.1;

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

const playerLocation = OAKES_CLASSROOM;
const playerMarker = leaflet.marker(playerLocation);
playerMarker.bindTooltip("Hi");
playerMarker.addTo(map);

function createCachePopup(i: number, j: number, rect: leaflet.Rectangle) {
  let tokenCount = Math.floor(luck([i, j, "initial"].toString()) * 100);

  rect.bindPopup(() => {
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML =
      `<div>Cache at ${i}, ${j}. There are <span id=value>${tokenCount}</span> tokens</div>.
      <button id=take>Take</button>
      <button id=leave>Leave</button>`;

    popupDiv.querySelector<HTMLButtonElement>("#take")!
      .addEventListener("click", () => {
        tokenCount = collectToken(tokenCount, popupDiv);
      });
    popupDiv.querySelector<HTMLButtonElement>("#leave")!
      .addEventListener("click", () => {
        tokenCount = leaveToken(tokenCount, popupDiv);
      });

    return popupDiv;
  });
}

function collectToken(tokenCount: number, popupDiv: HTMLDivElement) {
  if (tokenCount > 0) {
    tokenCount--;
    playerTokens++;
    updateCounters(tokenCount, popupDiv);
  }
  return tokenCount;
}

function leaveToken(tokenCount: number, popupDiv: HTMLDivElement) {
  if (playerTokens > 0) {
    tokenCount++;
    playerTokens--;
    updateCounters(tokenCount, popupDiv);
  }
  return tokenCount;
}

function updateCounters(tokenCount: number, popupDiv: HTMLDivElement) {
  popupDiv.querySelector<HTMLSpanElement>("#value")!.innerHTML = tokenCount
    .toString();
  statusPanel.querySelector<HTMLSpanElement>("#value")!.innerHTML = playerTokens
    .toString();
}

function spawnCache(i: number, j: number) {
  const origin = OAKES_CLASSROOM;
  const bounds = leaflet.latLngBounds([
    [origin.lat + i * TILE_DEGREES, origin.lng + j * TILE_DEGREES],
    [origin.lat + (i + 1) * TILE_DEGREES, origin.lng + (j + 1) * TILE_DEGREES],
  ]);

  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);
  createCachePopup(i, j, rect);
}

for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
  for (let j = -NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
    if (luck([i, j].toString()) < DROP_CHANCE) {
      spawnCache(i, j);
    }
  }
}
