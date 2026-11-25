export interface MapCoordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface ReportMapMarker extends MapCoordinates {
  readonly id: string;
  readonly title: string;
  readonly status: string;
}
