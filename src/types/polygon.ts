export interface PolygonData {
  id: string;
  coordinates: number[][];
  area: number;
  estimatedPrice: number;
  createdAt: string;
  name: string;
  intersectingNoFlyZones?: string[];
}