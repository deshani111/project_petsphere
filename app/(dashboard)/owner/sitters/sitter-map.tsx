"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import styles from "./sitter-map.module.css";

const COLOMBO_CENTER: [number, number] = [6.9271, 79.8612];

function ResizeMapOnContainerChange() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frame = 0;
    const invalidate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        map.invalidateSize({ pan: false, debounceMoveend: true });
      });
    };

    invalidate();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", invalidate);
      return () => {
        window.cancelAnimationFrame(frame);
        window.removeEventListener("resize", invalidate);
      };
    }

    const observer = new ResizeObserver(invalidate);
    observer.observe(container);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);

  return null;
}

export default function SitterMap() {
  return (
    <div className={styles.map} role="region" aria-label="Interactive OpenStreetMap of Colombo, Sri Lanka">
      <MapContainer
        center={COLOMBO_CENTER}
        zoom={12}
        minZoom={3}
        maxZoom={19}
        zoomControl
        scrollWheelZoom={false}
        zoomSnap={0.5}
        zoomDelta={0.5}
        zoomAnimation
        fadeAnimation
        easeLinearity={0.25}
        className={styles.leafletMap}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>'
        />
        <ResizeMapOnContainerChange />
      </MapContainer>
    </div>
  );
}
