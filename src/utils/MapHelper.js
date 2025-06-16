import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

class MapHelper {
  constructor(mapElementId, lat, lon, zoom = 13) {
    this.mapElementId = mapElementId;
    this.map = null;
    this.lat = lat;
    this.lon = lon;
    this.zoom = zoom;
  }

  initMap() {
    if (!document.getElementById(this.mapElementId)) {
      console.warn(`Map element with ID "${this.mapElementId}" not found.`);
      return null;
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.mapElementId).setView(
      [this.lat, this.lon],
      this.zoom
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    return this.map;
  }

  addMarker(lat, lon, popupContent) {
    if (!this.map) {
      console.error("Map not initialized. Call initMap() first.");
      return null;
    }
    const marker = L.marker([lat, lon]).addTo(this.map);
    marker.bindPopup(popupContent).openPopup();
    return marker;
  }
}

export default MapHelper;
