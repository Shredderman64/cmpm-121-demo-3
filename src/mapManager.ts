import leaflet from "leaflet";

export class MapManager {
  public map: leaflet.Map;
  public playerMarker: leaflet.Marker;
  public polyline: leaflet.Polyline;
  public location: leaflet.LatLng;
  public locationTrail: leaflet.LatLng[] = [];

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

  getLat() {
    return this.location.lat;
  }

  getLng() {
    return this.location.lng;
  }

  getTrail() {
    return this.locationTrail;
  }

  centerPlayer(i: number, j: number) {
    this.location = leaflet.latLng(i, j);
    this.playerMarker.setLatLng(this.location);
    this.map.panTo(this.location);
  }

  redrawTrail() {
    this.getTrail().push(this.location);
    this.polyline.setLatLngs(this.getTrail());
  }

  resetTrail() {
    this.getTrail().splice(0, this.getTrail().length, this.location);
    this.polyline.setLatLngs(this.getTrail());
  }
}
