// todo
import { Board } from "./board.ts";
import leaflet from "leaflet";
import luck from "./luck.ts";

import "leaflet/dist/leaflet.css";
import "./style.css";

import "./leafletWorkaround.ts";

interface Token {
  i: number;
  j: number;
  serial: number;
}

// interface Momento<T> {
//   toMomento() : T;
//   fromMomento(momento: T): void;
// }

const appName = "Technically (not) NFTs";
document.title = appName;

const statusPanel = document.getElementById("statusPanel")!;

const header = document.createElement("h1");
header.innerHTML = appName;
statusPanel.append(header);

const playerTokens: Token[] = [];
const tokenMessage = document.createElement("p");
tokenMessage.innerHTML = `Inventory: <div id=tokens></div>`;
statusPanel.append(tokenMessage);

const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);

const ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4;
const NEIGHBORHOOD_SIZE = 8;
const DROP_CHANCE = 0.1;

const neighborhood = new Board(TILE_DEGREES, NEIGHBORHOOD_SIZE);

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

function moveTo(direction: string) {
  switch (direction) {
    case "north":
      playerLocation.lat += TILE_DEGREES;
      break;
    case "east":
      playerLocation.lng += TILE_DEGREES;
      break;
    case "south":
      playerLocation.lat -= TILE_DEGREES;
      break;
    case "west":
      playerLocation.lng -= TILE_DEGREES;
      break;
    default:
      throw new Error("Invalid direction");
  }
  playerMarker.setLatLng(playerLocation);
}

const controlPanel = document.getElementById("controlPanel")!;
const moveButtons = controlPanel.querySelectorAll(".move");

moveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moveTo(button.id);
  });
});

function spawnCache(i: number, j: number, bounds: leaflet.LatLngBounds) {
  const rect = leaflet.rectangle(bounds);
  rect.addTo(map);
  createCachePopup(i, j, rect);
}

function createCachePopup(i: number, j: number, rect: leaflet.Rectangle) {
  const tokenCount = Math.floor(luck([i, j, "initial"].toString()) * 100);
  const tokenCache: Token[] = [];

  for (let serial = 0; serial < tokenCount; serial++) {
    tokenCache.push({ i, j, serial });
  }

  rect.bindPopup(() => {
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `<div>Cache at ${i}, ${j}</div>
      <button id=take>Take</button>
      <button id=leave>Leave</button>
      <div id=tokens></div>`;

    updateCounters(tokenCache, popupDiv);

    popupDiv.querySelector<HTMLButtonElement>("#take")!
      .addEventListener("click", () => {
        collectToken(tokenCache);
        updateCounters(tokenCache, popupDiv);
      });
    popupDiv.querySelector<HTMLButtonElement>("#leave")!
      .addEventListener("click", () => {
        leaveToken(tokenCache);
        updateCounters(tokenCache, popupDiv);
      });

    return popupDiv;
  });
}

function collectToken(tokenCache: Token[]) {
  if (tokenCache.length > 0) {
    const token = tokenCache.shift();
    playerTokens.push(token!);
  }
}

function leaveToken(tokenCache: Token[]) {
  if (playerTokens.length > 0) {
    const token = playerTokens.pop();
    tokenCache.unshift(token!);
  }
}

function updateCounters(tokenCache: Token[], popupDiv: HTMLDivElement) {
  const availableTokens = popupDiv.querySelector<HTMLDivElement>("#tokens")!;
  availableTokens.innerHTML = "";
  tokenCache.slice(0, 5).forEach((token) => {
    availableTokens.innerHTML += `${token.i}:${token.j}#${token.serial}</br>`;
  });

  const playerInventory = statusPanel.querySelector<HTMLDivElement>("#tokens")!;
  playerInventory.innerHTML = "";
  playerTokens.forEach((token) => {
    playerInventory.innerHTML += `${token.i}:${token.j}#${token.serial}</br>`;
  });
}

const cells = neighborhood.getCellsNearPoint(playerLocation);
for (const cell of cells) {
  if (luck([cell.i, cell.j].toString()) < DROP_CHANCE) {
    spawnCache(cell.i, cell.j, neighborhood.getCellBounds(cell));
  }
}
