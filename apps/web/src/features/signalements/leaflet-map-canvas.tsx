"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { LatLngExpression, LatLngTuple } from "leaflet";

import type { MapCoordinates, ReportMapMarker } from "./map-types";

function MapController({
  center,
  zoom,
  onPick,
}: {
  readonly center: MapCoordinates;
  readonly zoom: number;
  readonly onPick?: (position: MapCoordinates) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([center.latitude, center.longitude], zoom);
  }, [center.latitude, center.longitude, map, zoom]);

  useMapEvents({
    click(event) {
      onPick?.({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function FitReportMarkers({ markers }: { readonly markers: readonly ReportMapMarker[] }) {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 1) {
      const marker = markers[0];
      if (marker !== undefined) {
        map.setView([marker.latitude, marker.longitude], 15);
      }
      return;
    }

    if (markers.length > 1) {
      const bounds: LatLngTuple[] = markers.map(
        ({ latitude, longitude }) => [latitude, longitude],
      );
      map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 });
    }
  }, [map, markers]);

  return null;
}

export function LeafletMapCanvas({
  center,
  zoom,
  selectedPosition,
  markers,
  onPick,
}: {
  readonly center: MapCoordinates;
  readonly zoom: number;
  readonly selectedPosition?: MapCoordinates | null;
  readonly markers: readonly ReportMapMarker[];
  readonly onPick?: (position: MapCoordinates) => void;
}) {
  const mapCenter: LatLngExpression = [center.latitude, center.longitude];

  return (
    <MapContainer
      center={mapCenter}
      className="h-full w-full"
      scrollWheelZoom
      zoom={zoom}
    >
      <MapController center={center} onPick={onPick} zoom={zoom} />
      {onPick === undefined && <FitReportMarkers markers={markers} />}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {selectedPosition && (
        <CircleMarker
          center={[selectedPosition.latitude, selectedPosition.longitude]}
          pathOptions={{ color: "#1F4FD8", fillColor: "#1F4FD8", fillOpacity: 0.9 }}
          radius={9}
        >
          <Popup>Position sélectionnée</Popup>
        </CircleMarker>
      )}
      {markers.map((marker) => (
        <CircleMarker
          center={[marker.latitude, marker.longitude]}
          key={marker.id}
          pathOptions={{ color: "#B42318", fillColor: "#B42318", fillOpacity: 0.85 }}
          radius={8}
        >
          <Popup>
            <Link href={`/reports/${encodeURIComponent(marker.id)}`}>
              {marker.title}
            </Link>
            <br />
            {marker.status}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
