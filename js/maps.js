// Maps Module - Handles Leaflet map integration
class MapsManager {
    constructor() {
        this.maps = {};
        this.markers = [];
    }

    // Initialize dashboard mini map
    initDashboardMap(mapId) {
        const mapElement = document.getElementById(mapId);
        if (!mapElement) return;

        const currentLocation = window.AirQualityAPI.locationCoords[window.AirQualityAPI.currentLocation];

        this.maps[mapId] = L.map(mapId).setView([currentLocation.lat, currentLocation.lng], 11);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.maps[mapId]);

        // Add current location marker
        this.addLocationMarkers(mapId);
    }

    // Initialize full map page
    initFullMap(mapId) {
        const mapElement = document.getElementById(mapId);
        if (!mapElement) return;

        this.maps[mapId] = L.map(mapId).setView([28.6139, 77.2090], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.maps[mapId]);

        // Add all locations
        this.addAllLocationMarkers(mapId);
    }

    // Add markers for all locations
    addAllLocationMarkers(mapId) {
        const locationData = window.AirQualityAPI.getMultiLocationData();

        this.clearMarkers(mapId);

        locationData.forEach(location => {
            const color = this.getMarkerColor(location.aqi);

            const marker = L.circleMarker([location.coords.lat, location.coords.lng], {
                color: color,
                fillColor: color,
                fillOpacity: 0.6,
                radius: 15,
                weight: 3
            }).addTo(this.maps[mapId]);

            const popupContent = `
                <div style="text-align: center; padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; text-transform: capitalize;">${location.location}</h3>
                    <div style="font-size: 2rem; font-weight: 700; color: ${color};">${location.aqi}</div>
                    <div style="font-size: 0.875rem; margin-top: 4px;">${location.category.name}</div>
                </div>
            `;

            marker.bindPopup(popupContent);
            this.markers.push(marker);
        });
    }

    // Add marker for current location
    addLocationMarkers(mapId) {
        const currentData = window.AirQualityAPI.generateCurrentData();
        const location = window.AirQualityAPI.locationCoords[window.AirQualityAPI.currentLocation];
        const color = this.getMarkerColor(currentData.aqi);

        const marker = L.circleMarker([location.lat, location.lng], {
            color: color,
            fillColor: color,
            fillOpacity: 0.7,
            radius: 20,
            weight: 4
        }).addTo(this.maps[mapId]);

        const category = window.AirQualityAPI.getAQICategory(currentData.aqi);

        const popupContent = `
            <div style="text-align: center; padding: 10px;">
                <h3 style="margin: 0 0 10px 0; text-transform: capitalize;">${window.AirQualityAPI.currentLocation}</h3>
                <div style="font-size: 2.5rem; font-weight: 700; color: ${color};">${currentData.aqi}</div>
                <div style="font-size: 0.875rem; margin-top: 6px;">${category.name}</div>
                <div style="font-size: 0.75rem; margin-top: 8px; color: #718096;">
                    PM2.5: ${currentData.pm25} | PM10: ${currentData.pm10}
                </div>
            </div>
        `;

        marker.bindPopup(popupContent).openPopup();
        this.markers.push(marker);
    }

    // Get marker color based on AQI
    getMarkerColor(aqi) {
        if (aqi <= 50) return '#10b981';
        if (aqi <= 100) return '#fbbf24';
        if (aqi <= 150) return '#f97316';
        if (aqi <= 200) return '#ef4444';
        if (aqi <= 300) return '#9333ea';
        return '#7c2d12';
    }

    // Clear all markers
    clearMarkers(mapId) {
        this.markers.forEach(marker => {
            if (this.maps[mapId]) {
                this.maps[mapId].removeLayer(marker);
            }
        });
        this.markers = [];
    }

    // Update map when location changes
    updateMapLocation(mapId, location) {
        if (!this.maps[mapId]) return;

        const coords = window.AirQualityAPI.locationCoords[location];
        this.maps[mapId].setView([coords.lat, coords.lng], 11);

        if (mapId === 'dashboardMap') {
            this.addLocationMarkers(mapId);
        }
    }

    // Refresh map
    refreshMap(mapId) {
        if (!this.maps[mapId]) return;

        setTimeout(() => {
            this.maps[mapId].invalidateSize();
        }, 100);
    }
}

window.MapsManager = new MapsManager();
