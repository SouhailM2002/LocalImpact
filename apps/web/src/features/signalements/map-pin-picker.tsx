"use client";

import { useState } from "react";
import { Button } from "@localimpact/ui";

import { InteractiveMap } from "./interactive-map";
import type { MapCoordinates } from "./map-types";

const defaultMapCenter: MapCoordinates = {
  latitude: 36.8665,
  longitude: 10.1647,
};

export function MapPinPicker({
  selectedPosition,
  onSelect,
}: {
  readonly selectedPosition: MapCoordinates | null;
  readonly onSelect: (position: MapCoordinates) => void;
}) {
  const [mapCenter, setMapCenter] = useState(defaultMapCenter);
  const [locationError, setLocationError] = useState<string>();
  const [locating, setLocating] = useState(false);

  function locateDevice() {
    if (!("geolocation" in navigator)) {
      setLocationError("La géolocalisation n’est pas disponible sur cet appareil.");
      return;
    }

    setLocationError(undefined);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const position = {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        onSelect(position);
        setMapCenter(position);
        setLocating(false);
      },
      (error) => {
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Autorisez la géolocalisation ou choisissez un point manuellement."
            : "Votre position n’a pas pu être déterminée. Choisissez un point manuellement.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Cliquez sur la carte pour placer le repère.
        </p>
        <Button
          disabled={locating}
          onClick={locateDevice}
          type="button"
          variant="secondary"
        >
          {locating ? "Localisation…" : "Utiliser ma position"}
        </Button>
      </div>
      <InteractiveMap
        center={selectedPosition ?? mapCenter}
        onPick={onSelect}
        selectedPosition={selectedPosition}
        zoom={selectedPosition ? 15 : 13}
      />
      {locationError && (
        <p aria-live="polite" className="text-sm text-rose-700" role="alert">
          {locationError}
        </p>
      )}
      {selectedPosition ? (
        <p aria-live="polite" className="text-sm text-emerald-800" role="status">
          Position sélectionnée : {selectedPosition.latitude.toFixed(5)}, {selectedPosition.longitude.toFixed(5)}.
        </p>
      ) : (
        <p className="text-sm text-amber-800" role="status">
          Sélectionnez un point ou utilisez vos coordonnées avant de créer le signalement.
        </p>
      )}
    </div>
  );
}
