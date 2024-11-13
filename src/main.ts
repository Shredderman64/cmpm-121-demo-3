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

interface Memento<T> {
  toMemento(): T;
  fromMemento(memento: T): void;
}

interface Cache {
  i: number;
  j: number;
  memento: Memento<string>;
  tokens: Token[];
}

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

let playerLocation = OAKES_CLASSROOM;
const playerMarker = leaflet.marker(playerLocation);
playerMarker.bindTooltip("Hi");
playerMarker.addTo(map);

let autoLocation = false;
let watchId: number;

function geoSuccess(pos: GeolocationPosition) {
  centerPlayer(pos.coords.latitude, pos.coords.longitude);
  watchId = navigator.geolocation.watchPosition((pos) => {
    centerPlayer(pos.coords.latitude, pos.coords.longitude);
  });
}

const controlPanel = document.getElementById("controlPanel")!;
const sensorButton = controlPanel.querySelector<HTMLButtonElement>("#sensor")!;
sensorButton.addEventListener("click", () => {
  if (!autoLocation) {
    autoLocation = true;
    navigator.geolocation.getCurrentPosition(geoSuccess);
  } else if (autoLocation) {
    autoLocation = false;
    navigator.geolocation.clearWatch(watchId);
  }
});

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
  centerPlayer(playerLocation.lat, playerLocation.lng);
}

const moveButtons = controlPanel.querySelectorAll(".move");

moveButtons.forEach((button) => {
  button.addEventListener("click", () => {
    moveTo(button.id);
  });
});

const mementos = new Map<string, string>();
const cacheDrops: leaflet.Rectangle[] = [];

function createCache(i: number, j: number): Cache {
  const tokenCount = Math.floor(luck([i, j, "initial"].toString()) * 100);
  const tokenCache: Token[] = [];
  for (let serial = 0; serial < tokenCount; serial++) {
    tokenCache.push({ i, j, serial });
  }

  return {
    i,
    j,
    memento: {
      toMemento() {
        return JSON.stringify(tokenCache);
      },
      fromMemento(memento: string) {
        tokenCache.splice(0, tokenCache.length);
        for (const token of JSON.parse(memento)) {
          tokenCache.push(token);
        }
      },
    },
    tokens: tokenCache,
  };
}

function spawnDrop(i: number, j: number, bounds: leaflet.LatLngBounds) {
  const drop = leaflet.rectangle(bounds);
  drop.addTo(map);

  const cache = createCache(i, j);
  const cacheKey = [i, j].toString();
  if (mementos.has(cacheKey)) {
    cache.memento.fromMemento(mementos.get(cacheKey)!);
  }

  drop.bindPopup(createCachePopup(cache));
  cacheDrops.push(drop);
}

function createCachePopup(cache: Cache) {
  return () => {
    const popupDiv = document.createElement("div");
    popupDiv.innerHTML = `<div>Cache at ${cache.i}, ${cache.j}</div>
      <button id=take>Take</button>
      <button id=leave>Leave</button>
      <div id=tokens></div>`;

    updateCounters(cache, popupDiv);

    popupDiv.querySelector<HTMLButtonElement>("#take")!
      .addEventListener("click", () => {
        collectToken(cache);
        updateCounters(cache, popupDiv);
      });
    popupDiv.querySelector<HTMLButtonElement>("#leave")!
      .addEventListener("click", () => {
        leaveToken(cache);
        updateCounters(cache, popupDiv);
      });

    return popupDiv;
  };
}

function collectToken(cache: Cache) {
  if (cache.tokens.length > 0) {
    const token = cache.tokens.shift();
    playerTokens.push(token!);
  }
}

function leaveToken(cache: Cache) {
  if (playerTokens.length > 0) {
    const token = playerTokens.pop();
    cache.tokens.unshift(token!);
  }
}

function updateCounters(cache: Cache, popupDiv: HTMLDivElement) {
  const cacheKey = [cache.i, cache.j].toString();
  mementos.set(cacheKey, cache.memento.toMemento());

  const availableTokens = popupDiv.querySelector<HTMLDivElement>("#tokens")!;
  availableTokens.innerHTML = "";
  cache.tokens.slice(0, 5).forEach((token) => {
    availableTokens.innerHTML += `${token.i}:${token.j}#${token.serial}</br>`;
  });

  const playerInventory = statusPanel.querySelector<HTMLDivElement>("#tokens")!;
  playerInventory.innerHTML = "";
  playerTokens.forEach((token) => {
    playerInventory.innerHTML += `${token.i}:${token.j}#${token.serial}</br>`;
  });
}

function centerPlayer(i: number, j: number) {
  playerLocation = leaflet.latLng(i, j);
  playerMarker.setLatLng(playerLocation);
  map.panTo(playerLocation);
  respawnDrops();
}

function spawnDrops() {
  const cells = neighborhood.getCellsNearPoint(playerLocation);
  for (const cell of cells) {
    if (luck([cell.i, cell.j].toString()) < DROP_CHANCE) {
      spawnDrop(cell.i, cell.j, neighborhood.getCellBounds(cell));
    }
  }
}

function respawnDrops() {
  for (let i = 0; i < cacheDrops.length; i++) {
    const drop = cacheDrops[i];
    drop.remove();
  }
  cacheDrops.splice(0, cacheDrops.length);
  spawnDrops();
}

spawnDrops();
