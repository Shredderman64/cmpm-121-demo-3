import leaflet from "leaflet";

export class MapManager {
  public map: leaflet.Map;
  public playerMarker: leaflet.Marker;
  public polyline: leaflet.Polyline;
  public location: leaflet.LatLng;
  public locationTrail: leaflet.LatLng[] = [];
  public cacheDrops: leaflet.Rectangle[] = [];

  constructor(containerId: string, initLoc: leaflet.LatLng, zoomLevel: number) {
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

  panView(i: number, j: number) {
    this.map.panTo(leaflet.latLng(i, j));
  }

  centerPlayer(i: number, j: number) {
    this.location = leaflet.latLng(i, j);
    this.playerMarker.setLatLng(this.location);
    this.panView(i, j);
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
}
