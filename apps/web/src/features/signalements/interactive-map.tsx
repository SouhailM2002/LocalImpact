"use client";

import dynamic from "next/dynamic";
import type { MapCoordinates, ReportMapMarker } from "./map-types";

const LeafletMapCanvas = dynamic(
  () => import("./leaflet-map-canvas").then((module) => module.LeafletMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        aria-label="Chargement de la carte"
        aria-busy="true"
        className="h-80 animate-pulse bg-slate-100"
      />
    ),
  },
);

export function InteractiveMap({
  center,
  zoom = 2,
  selectedPosition,
  markers = [],
  onPick,
}: {
  readonly center: MapCoordinates;
  readonly zoom?: number;
  readonly selectedPosition?: MapCoordinates | null;
  readonly markers?: readonly ReportMapMarker[];
  readonly onPick?: (position: MapCoordinates) => void;
}) {
  return (
    <div
      aria-label={onPick ? "Carte, choisissez la position du signalement" : "Carte des signalements"}
      className="h-80 overflow-hidden border-2 border-slate-900"
      role="region"
    >
      <LeafletMapCanvas
        center={center}
        markers={markers}
        onPick={onPick}
        selectedPosition={selectedPosition}
        zoom={zoom}
      />
    </div>
  );
}
