import leaflet from "leaflet";

export class MapManager {
  private map: leaflet.Map;
  private playerMarker: leaflet.Marker;
  private polyline: leaflet.Polyline;
  private location: leaflet.LatLng;
  private locationTrail: leaflet.LatLng[] = [];
  private cacheDrops: leaflet.Rectangle[] = [];

  constructor(containerId: string, zoomLevel: number) {
    const initLoc = leaflet.latLng(36.98949379578401, -122.06277128548504);
    this.map = leaflet.map(document.getElementById(containerId)!, {
      center: initLoc,
      zoom: zoomLevel,
      scrollWheelZoom: false,
    });

    leaflet.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: zoomLevel,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.playerMarker = leaflet.marker(initLoc)
      .bindTooltip("Hi")
      .addTo(this.map);

    this.polyline = leaflet.polyline([])
      .addLatLng(initLoc)
      .addTo(this.map);

    this.location = initLoc;
  }

  panView(i: number, j: number) {
    this.map.panTo(leaflet.latLng(i, j));
  }

  centerPlayer(i: number, j: number) {
    this.location = leaflet.latLng(i, j);
    this.playerMarker.setLatLng(this.location);
    this.panView(i, j);
  }

  initTrail() {
    this.locationTrail.push(this.location);
  }

  setTrail(pointList: leaflet.LatLng[]) {
    this.locationTrail.splice(0, 0, ...pointList);
    this.polyline.setLatLngs(this.locationTrail);
  }

  redrawTrail() {
    this.locationTrail.push(this.location);
    this.polyline.setLatLngs(this.locationTrail);
  }

  resetTrail() {
    this.locationTrail.splice(0, this.locationTrail.length, this.location);
    this.polyline.setLatLngs(this.locationTrail);
  }

  drawCache(bounds: leaflet.LatLngBounds, popup: () => HTMLDivElement) {
    const drop = leaflet.rectangle(bounds);
    drop.bindPopup(popup).addTo(this.map);
    this.cacheDrops.push(drop);
  }

  clearCaches() {
    this.cacheDrops.forEach((cache) => cache.remove());
    this.cacheDrops = [];
  }

  getLoc() {
    return this.location;
  }

  getLat() {
    return this.location.lat;
  }

  getLng() {
    return this.location.lng;
  }

  getTrail() {
    return this.locationTrail;
  }
}
