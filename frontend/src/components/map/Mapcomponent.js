import React, { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ lat, lon }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const L = window.L;
    if (!L) {
      console.error("Leaflet not loaded");
      return;
    }

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([29.863935870872957, 77.8957097806369], 5); // Initial center

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    const L = window.L;
    if (mapRef.current && lat && lon) {
      // Remove old marker if it exists
      if (markerRef.current) {
        markerRef.current.remove();
      }

      // Add new marker
      markerRef.current = L.marker([lat, lon]).addTo(mapRef.current);
      markerRef.current.bindPopup(`Lat: ${lat}, Lon: ${lon}`).openPopup();

      // Pan to new position
      mapRef.current.setView([lat, lon], 13);
    }
  }, [lat, lon]);

  return (
    <div
      id="map"
      style={{ height: "400px", width: "100%", marginTop: "20px" }}
    />
  );
};

export default MapComponent;
