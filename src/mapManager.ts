import leaflet from "leaflet";

export class MapManager {
  public map: leaflet.Map;
  public playerMarker: leaflet.Marker;
  private trail: leaflet.Polyline;

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

    this.playerMarker = leaflet
      .marker(initLoc)
      .bindTooltip("Hi")
      .addTo(this.map);
  }
}
