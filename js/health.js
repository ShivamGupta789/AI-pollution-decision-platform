// Health Module - Handles health insights page
class HealthManager {
    constructor() {
        this.currentAQI = 0;
    }

    // Initialize health page
    init() {
        this.updateHealthPage();
        this.updateSaferRoutes();
    }

    // Update health page
    updateHealthPage() {
        const currentData = window.AirQualityAPI.generateCurrentData();
        this.currentAQI = currentData.aqi;
        const recommendations = window.AirQualityAPI.getHealthRecommendations(this.currentAQI);

        // Update alert card
        this.updateAlertCard(this.currentAQI);

        // Update group-specific advice
        this.updateGroupAdvice(recommendations);

        // Update activities
        this.updateActivities(recommendations);

        // Update protection measures
        this.updateProtectionMeasures(recommendations);

        // Update health index
        this.updateHealthIndex(this.currentAQI);
    }

    // Update alert card
    updateAlertCard(aqi) {
        const alertCard = document.getElementById('healthAlert');
        if (!alertCard) return;

        const category = window.AirQualityAPI.getAQICategory(aqi);
        let alertLevel = 'info';
        let icon = 'ℹ️';

        if (aqi > 200) {
            alertLevel = 'danger';
            icon = '🚨';
        } else if (aqi > 150) {
            alertLevel = 'warning';
            icon = '⚠️';
        } else if (aqi > 100) {
            alertLevel = 'caution';
            icon = '⚡';
        }

        alertCard.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div style="font-size: 3rem;">${icon}</div>
                <div>
                    <h3 style="margin-bottom: 0.5rem;">Air Quality Alert: ${category.name}</h3>
                    <p style="color: var(--text-secondary); margin: 0;">
                        Current AQI is ${aqi}. ${this.getAlertMessage(aqi)}
                    </p>
                </div>
            </div>
        `;
    }

    // Get alert message based on AQI
    getAlertMessage(aqi) {
        if (aqi <= 50) return 'Air quality is good. Enjoy outdoor activities!';
        if (aqi <= 100) return 'Air quality is acceptable for most people.';
        if (aqi <= 150) return 'Sensitive groups should limit prolonged outdoor exposure.';
        if (aqi <= 200) return 'Everyone should reduce prolonged outdoor exertion.';
        if (aqi <= 300) return 'Health alert: everyone may experience health effects.';
        return 'Health emergency: everyone should avoid outdoor activities.';
    }

    // Update group-specific advice
    updateGroupAdvice(recommendations) {
        const groups = {
            childrenAdvice: { text: recommendations.children, icon: '👶' },
            elderlyAdvice: { text: recommendations.elderly, icon: '👴' },
            pregnantAdvice: { text: recommendations.pregnant, icon: '🤰' },
            patientsAdvice: { text: recommendations.patients, icon: '🏥' }
        };

        Object.keys(groups).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `
                    <p style="color: var(--text-secondary); line-height: 1.8;">${groups[id].text}</p>
                `;
            }
        });
    }

    // Update activities
    updateActivities(recommendations) {
        const container = document.getElementById('activitiesGrid');
        if (!container) return;

        container.innerHTML = '';

        recommendations.activities.forEach(activity => {
            const card = document.createElement('div');
            card.className = 'activity-card';

            let statusColor = '#10b981';
            let statusText = 'Safe';

            if (activity.status === 'caution') {
                statusColor = '#fbbf24';
                statusText = 'Use Caution';
            } else if (activity.status === 'avoid') {
                statusColor = '#ef4444';
                statusText = 'Avoid';
            } else if (activity.status === 'recommended') {
                statusColor = '#00d4ff';
                statusText = 'Recommended';
            }

            card.innerHTML = `
                <div style="font-size: 2.5rem; text-align: center; margin-bottom: 1rem;">${activity.icon}</div>
                <h4 style="text-align: center; margin-bottom: 0.5rem;">${activity.name}</h4>
                <div style="text-align: center; padding: 0.5rem; background: ${statusColor}20; border-radius: 0.5rem;">
                    <span style="color: ${statusColor}; font-weight: 600; font-size: 0.875rem;">${statusText}</span>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // Update protection measures
    updateProtectionMeasures(recommendations) {
        const container = document.getElementById('protectionMeasures');
        if (!container) return;

        container.innerHTML = '';

        if (recommendations.protection.length === 0) {
            const card = document.createElement('div');
            card.className = 'measure-card';
            card.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                    <p style="color: var(--text-secondary);">No special precautions needed. Enjoy your day!</p>
                </div>
            `;
            container.appendChild(card);
            return;
        }

        recommendations.protection.forEach((measure, index) => {
            const card = document.createElement('div');
            card.className = 'measure-card';

            const icons = ['😷', '💨', '🪟', '💧', '🏥'];
            const icon = icons[index % icons.length];

            card.innerHTML = `
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="font-size: 2rem;">${icon}</div>
                    <p style="color: var(--text-secondary); margin: 0;">${measure}</p>
                </div>
            `;

            container.appendChild(card);
        });
    }

    // Update health index visualization
    updateHealthIndex(aqi) {
        const container = document.getElementById('healthIndex');
        if (!container) return;

        const category = window.AirQualityAPI.getAQICategory(aqi);
        const percentage = Math.min((aqi / 500) * 100, 100);

        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 4rem; font-weight: 800; margin-bottom: 1rem; color: ${this.getAQIColor(aqi)};">
                    ${aqi}
                </div>
                <div class="metric-status ${category.class}" style="font-size: 1rem; padding: 0.75rem 1.5rem;">
                    ${category.name}
                </div>
                <div style="margin-top: 2rem;">
                    <div style="width: 100%; height: 20px; background: var(--glass-bg); border-radius: 10px; overflow: hidden; position: relative;">
                        <div style="width: ${percentage}%; height: 100%; background: ${this.getAQIColor(aqi)}; transition: width 1s ease;"></div>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
                        <span>0 (Good)</span>
                        <span>500 (Hazardous)</span>
                    </div>
                </div>
                <p style="margin-top: 2rem; color: var(--text-secondary); line-height: 1.8;">
                    ${this.getHealthIndexDescription(aqi)}
                </p>
            </div>
        `;
    }

    // Get health index description
    getHealthIndexDescription(aqi) {
        if (aqi <= 50) {
            return 'Air quality is excellent. This is perfect weather for all outdoor activities. No health impacts expected.';
        } else if (aqi <= 100) {
            return 'Air quality is acceptable. Most people can enjoy outdoor activities, but sensitive individuals should monitor symptoms.';
        } else if (aqi <= 150) {
            return 'Sensitive groups (children, elderly, and those with respiratory conditions) may experience health effects. General public is less likely to be affected.';
        } else if (aqi <= 200) {
            return 'Everyone may begin to experience health effects. Sensitive groups may experience more serious effects. Limit prolonged outdoor exertion.';
        } else if (aqi <= 300) {
            return 'Health alert: everyone may experience serious health effects. Avoid all outdoor physical activities.';
        } else {
            return 'Health emergency: serious health effects for everyone. Stay indoors and use air purifiers. Seek medical attention if experiencing symptoms.';
        }
    }

    // Update safer routes
    updateSaferRoutes() {
        if (typeof RouteOptimizer === 'undefined') return;

        const routeOptimizer = new RouteOptimizer();
        const currentAQIData = [];

        // Generate AQI data for multiple areas
        const areas = ['Central Delhi', 'Dwarka', 'Noida', 'Gurugram', 'Ghaziabad', 'Anand Vihar'];
        areas.forEach(area => {
            const data = window.AirQualityAPI ? window.AirQualityAPI.generateCurrentData() : { aqi: 150 };
            currentAQIData.push({ area, aqi: data.aqi });
        });

        // Get safer routes
        const routesSuggestion = routeOptimizer.findSaferRoutes(null, null, currentAQIData);

        // Display routes
        const routesGrid = document.getElementById('routesGrid');
        if (routesGrid) {
            routesGrid.innerHTML = '';

            // Show safest route
            if (routesSuggestion.safest) {
                const card = this.createRouteCard(routesSuggestion.safest, true);
                routesGrid.appendChild(card);
            }

            // Show alternative routes
            routesSuggestion.alternatives.forEach(route => {
                const card = this.createRouteCard(route, false);
                routesGrid.appendChild(card);
            });
        }

        // Display best travel times
        const forecastData = window.AirQualityAPI ? window.AirQualityAPI.generateForecast() : { current: { aqi: 150 } };
        const bestTimes = routeOptimizer.getBestTravelTimes(forecastData);

        const bestTimesDisplay = document.getElementById('bestTimesDisplay');
        if (bestTimesDisplay) {
            bestTimesDisplay.innerHTML = `
                <h4>⏰ Best Times to Travel</h4>
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">${bestTimes.recommendation}</p>
                <div class="time-slots">
                    ${bestTimes.bestTimes.map(time => `
                        <div class="time-slot ${time.recommended ? 'recommended' : ''}">
                            <div class="time-slot-time">${time.time}</div>
                            <div class="time-slot-aqi">AQI: ${time.aqi}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    // Create route card
    createRouteCard(route, isSafest) {
        const card = document.createElement('div');
        card.className = `route-card ${isSafest ? 'safest' : ''}`;

        card.innerHTML = `
            <div class="route-header">
                <div class="route-name">${route.name}</div>
                ${isSafest ? '<div class="route-badge" style="background: var(--aqi-good); color: white; padding: 0.25rem 0.75rem; border-radius: 0.5rem;">✓ Safest</div>' : ''}
            </div>
            <div class="route-stats">
                <div class="route-stat-item">
                    <span class="route-stat-label">Distance:</span>
                    <span class="route-stat-value">${route.distance} km</span>
                </div>
                <div class="route-stat-item">
                    <span class="route-stat-label">Est. Time:</span>
                    <span class="route-stat-value">${route.travelTime} min</span>
                </div>
                <div class="route-stat-item">
                    <span class="route-stat-label">Avg AQI:</span>
                    <span class="route-stat-value" style="color: ${this.getAQIColor(route.averageAQI)}">${route.averageAQI}</span>
                </div>
                <div class="route-stat-item">
                    <span class="route-stat-label">Risk Level:</span>
                    <span class="route-stat-value">${route.riskLevel.icon} ${route.riskLevel.level}</span>
                </div>
            </div>
            <div class="route-recommendation">
                ${route.recommendation}
            </div>
        `;

        return card;
    }

    // Get AQI color
    getAQIColor(aqi) {
        if (aqi <= 50) return '#10b981';
        if (aqi <= 100) return '#fbbf24';
        if (aqi <= 150) return '#f97316';
        if (aqi <= 200) return '#ef4444';
        if (aqi <= 300) return '#9333ea';
        return '#7c2d12';
    }
}

window.HealthManager = new HealthManager();
