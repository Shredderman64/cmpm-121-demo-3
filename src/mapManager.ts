import leaflet from "leaflet";

export class MapManager {
  public map: leaflet.Map;
  public playerMarker: leaflet.Marker;
  public trail: leaflet.Polyline;
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

    this.trail = leaflet.polyline([])
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

  centerPlayer(i: number, j: number) {
    this.location = leaflet.latLng(i, j);
    this.playerMarker.setLatLng(this.location);
    this.map.panTo(this.location);
  }

  redrawTrail() {
    this.locationTrail.push(this.location);
    this.trail.setLatLngs(this.locationTrail);
  }
}
