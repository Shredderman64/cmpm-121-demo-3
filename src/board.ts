import leaflet from "leaflet";

interface Cell {
  readonly i: number;
  readonly j: number;
}

export class Board {
  private readonly knownCells: Map<string, Cell>;

  constructor(readonly tileWidth: number, readonly neighborhoodRadius: number) {
    this.knownCells = new Map<string, Cell>();
  }

  private getCanonicalCell(cell: Cell): Cell {
    const { i, j } = cell;
    const key = [i, j].toString();
    if (!this.knownCells.has(key)) {
      this.knownCells.set([i, j].toString(), { i, j });
    }
    return this.knownCells.get(key)!;
  }

  getCellForPoint(point: leaflet.LatLng): Cell {
    return this.getCanonicalCell({
      i: Math.trunc(point.lat / this.tileWidth),
      j: Math.trunc(point.lng / this.tileWidth),
    });
  }

  getCellBounds(cell: Cell): leaflet.LatLngBounds {
    return leaflet.latLngBounds([
      [cell.i * this.tileWidth, cell.j * this.tileWidth],
      [(cell.i + 1) * this.tileWidth, (cell.j + 1) * this.tileWidth],
    ]);
  }

  getCellsNearPoint(point: leaflet.LatLng) {
    const resultCells: Cell[] = [];
    const radius = this.neighborhoodRadius * this.tileWidth;

    for (let i = -radius; i < radius; i += this.tileWidth) {
      for (let j = -radius; j < radius; j += this.tileWidth) {
        resultCells.push(this.getCellForPoint(
          leaflet.latLng(point.lat + i, point.lng + j),
        ));
      }
    }
    return resultCells;
  }
}
