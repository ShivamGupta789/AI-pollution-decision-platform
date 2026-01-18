/**
 * Route Planner Module
 * Calculates and visualizes pollution-aware routes using Real-Time Visibility
 */

class RoutePlanner {
    constructor() {
        // Locations data - Keys must match config.js LOCATIONS
        this.locations = {
            "delhi": "Central Delhi (ITO)",
            "dwarka": "Dwarka",
            "rohini": "Rohini",
            "noida": "Noida",
            "gurgaon": "Gurugram",
            "ghaziabad": "Ghaziabad",
            "faridabad": "Faridabad",
            "greater_noida": "Greater Noida",
            "anand_vihar": "Anand Vihar"
        };

        // Real-time pollution zones (could also be dynamic if needed)
        this.pollutionZones = [
            { name: "Anand Vihar", visibility: 0.8, reason: "Traffic congestion" },
            { name: "RK Puram", visibility: 1.2, reason: "Construction dust" },
            { name: "ITO", visibility: 1.0, reason: "Vehicle emissions" }
        ];

        this.initializeEventListeners();
        // Use the global DualAPI instance
        this.api = window.DualAPI;
    }

    initializeEventListeners() {
        const calculateBtn = document.getElementById('btnCalculateRoute');
        const resetBtn = document.getElementById('btnResetRoute');

        if (calculateBtn) {
            calculateBtn.addEventListener('click', () => this.calculateRoute());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetRoute());
        }
    }

    async calculateRoute() {
        const loadingEl = document.getElementById('routeLoading');
        const resultsEl = document.getElementById('routeResults');
        const startSelect = document.getElementById('startLocation');
        const endSelect = document.getElementById('endLocation');

        const startKey = startSelect.value;
        const endKey = endSelect.value;

        if (startKey === endKey) {
            alert("Please select different start and end locations");
            return;
        }

        // Show loading
        if (loadingEl) loadingEl.classList.add('active');
        if (resultsEl) resultsEl.classList.remove('active');

        try {
            // Fetch Real-Time Data for Points using DualAPI
            // Note: DualAPI uses fetchCompleteData
            const startData = await this.api.fetchCompleteData(startKey);
            const endData = await this.api.fetchCompleteData(endKey);

            if (!startData || !endData) {
                throw new Error("Failed to fetch data for one or more locations");
            }

            // Generate calculations based on real data
            const stats = this.generateRouteStats(startData, endData);

            // Render results
            this.updateVisualization(startData, endData, stats);

            // Hide loading, show results
            if (loadingEl) loadingEl.classList.remove('active');
            if (resultsEl) resultsEl.classList.add('active');

            // Scroll to results
            resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            console.error("Route calculation error:", error);
            alert("Failed to calculate route. Please try again.");
            if (loadingEl) loadingEl.classList.remove('active');
        }
    }

    generateRouteStats(startData, endData) {
        // Distance heuristic (randomized slightly around 15km for demo)
        const cleanDistance = 15 + Math.random() * 5;
        const directDistance = cleanDistance * 0.85;

        // Get actual visibility from API (defaults to 3.0 if missing)
        // DualAPI structure: data.weather.visibility
        const startVis = parseFloat(startData.weather?.visibility) || 3.0;
        const endVis = parseFloat(endData.weather?.visibility) || 3.0;
        const avgVis = (startVis + endVis) / 2;

        // "Clean Route" (High Visibility) Logic
        // Assumes taking a greener path improves visibility by ~40% vs average, capped at 10km
        const cleanVis = Math.min(10, avgVis * 1.4).toFixed(1);

        // "Direct Route" (Low Visibility/Polluted) Logic
        // Direct routes through traffic often have worse visibility (~70% of area average)
        const directVis = Math.max(0.5, avgVis * 0.7).toFixed(1);

        return {
            clean: {
                distance: cleanDistance.toFixed(1),
                time: Math.round(cleanDistance * 3.5),
                visibility: cleanVis,
                zones: 0
            },
            direct: {
                distance: directDistance.toFixed(1),
                time: Math.round(directDistance * 3),
                visibility: directVis,
                zones: 3
            }
        };
    }

    updateVisualization(startData, endData, stats) {
        // Update Stats Cards
        this.updateStat('cleanDistance', stats.clean.distance + ' km');
        this.updateStat('cleanTime', stats.clean.time + ' min');
        this.updateStat('cleanVisibility', stats.clean.visibility + ' km');

        this.updateStat('directDistance', stats.direct.distance + ' km');
        this.updateStat('directTime', stats.direct.time + ' min');
        // Clean up directAQI if element exists but we don't use it, or leave it blank
        const directAQIEl = document.getElementById('directAQI');
        if (directAQIEl) directAQIEl.parentElement.style.display = 'none'; // Hide if exists

        this.updateStat('directVisibility', stats.direct.visibility + ' km');

        this.renderRoutePath(startData, endData, stats);
        this.renderPollutionZones();
    }

    updateStat(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    renderRoutePath(startData, endData, stats) {
        const container = document.getElementById('routePathDisplay');
        if (!container) return;

        container.innerHTML = '<div class="path-line"></div>';

        const startLabel = this.locations[startData.areaId] || startData.area || "Start";
        const endLabel = this.locations[endData.areaId] || endData.area || "End";

        // Define stops logic
        const stops = [
            { name: startLabel, val: parseFloat(startData.weather?.visibility) || 3.0, type: 'start' },
            { name: "Green Zone", val: stats.clean.visibility, type: 'safe' },
            { name: "Congestion", val: stats.direct.visibility, type: 'avoid' },
            { name: endLabel, val: parseFloat(endData.weather?.visibility) || 3.0, type: 'end' }
        ];

        stops.forEach((stop, index) => {
            const stopEl = document.createElement('div');
            stopEl.className = 'stop';

            let borderColor = 'var(--text-secondary)';
            let markerColor = 'var(--text-primary)';
            let badge = '';

            if (stop.type === 'start') {
                borderColor = 'var(--primary-color)';
                markerColor = 'var(--primary-color)';
            } else if (stop.type === 'end') {
                borderColor = 'var(--accent-cyan)';
                markerColor = 'var(--accent-cyan)';
            } else if (stop.type === 'safe') {
                borderColor = '#10b981';
                markerColor = '#10b981';
            } else if (stop.type === 'avoid') {
                borderColor = '#ef4444';
                markerColor = '#ef4444';
            }

            const color = this.getVisibilityColor(stop.val);
            // Format visibility to 1 decimal place if it's a number
            const valDisplay = typeof stop.val === 'number' ? stop.val.toFixed(1) : stop.val;
            badge = `<div class="stop-aqi" style="background: ${color}">Vis: ${valDisplay} km</div>`;

            stopEl.innerHTML = `
                <div class="stop-marker" style="border-color: ${borderColor}; color: ${markerColor}">
                    ${index + 1}
                </div>
                <div class="stop-name">${stop.name}</div>
                ${badge}
            `;

            container.appendChild(stopEl);
        });
    }

    renderPollutionZones() {
        const container = document.getElementById('hazardZonesgrid');
        if (!container) return;

        container.innerHTML = '';

        this.pollutionZones.forEach(zone => {
            const div = document.createElement('div');
            // Check visibility color for border/badge
            const color = this.getVisibilityColor(zone.visibility);

            div.className = 'hazard-card';
            div.innerHTML = `
                <div class="hazard-name">${zone.name}</div>
                <div class="stop-aqi" style="background: ${color}; display: inline-block; margin-bottom: 8px;">Vis: ${zone.visibility} km</div>
                <div class="hazard-reason">${zone.reason}</div>
            `;
            container.appendChild(div);
        });
    }

    getVisibilityColor(vis) {
        vis = parseFloat(vis);
        if (vis >= 4.0) return '#10b981'; // Green (Good > 4km)
        if (vis >= 2.5) return '#fbbf24'; // Yellow (Moderate 2.5-4km)
        if (vis >= 1.0) return '#f97316'; // Orange (Poor 1-2.5km)
        return '#ef4444'; // Red (Very Poor < 1km)
    }

    resetRoute() {
        document.getElementById('routeResults').classList.remove('active');
        document.getElementById('startLocation').value = 'delhi';
        document.getElementById('endLocation').value = 'dwarka';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.routePlanner = new RoutePlanner();
});
