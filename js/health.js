// Health Module - Handles health insights page
class HealthManager {
    constructor() {
        this.currentAQI = 0;
    }

    // Initialize health page
    async init() {
        await this.updateHealthPage();
    }

    // Update health page
    async updateHealthPage() {
        // Fetch real-time data from dual API
        const currentData = await window.AirQualityAPI.fetchRealTimeData(window.AirQualityAPI.currentLocation);
        this.currentAQI = currentData.aqi;

        // Update daily health forecast
        this.updateDailyHealthForecast();

        // Update group-specific cards
        this.updateGroupCards(this.currentAQI);

        // Update alert card
        this.updateAlertCard(this.currentAQI);

        // Update health index
        this.updateHealthIndex(this.currentAQI);
    }

    // Update daily health forecast with hourly breakdown
    updateDailyHealthForecast() {
        const forecastContainer = document.getElementById('dailyHealthForecast');
        const updateTimeElement = document.getElementById('forecastUpdateTime');

        if (!forecastContainer) return;

        // Get hourly forecast data
        const hourlyForecast = window.AirQualityAPI.generateForecast(24);

        // Update last update time
        if (updateTimeElement) {
            const now = new Date();
            updateTimeElement.textContent = `Updated: ${now.toLocaleTimeString()}`;
        }

        // Generate hourly breakdown HTML
        let html = '<div class="hourly-forecast-grid">';

        // Group hours into time periods for better organization
        const periods = [
            { name: 'Morning', icon: '🌅', hours: [6, 7, 8, 9, 10, 11] },
            { name: 'Afternoon', icon: '☀️', hours: [12, 13, 14, 15, 16, 17] },
            { name: 'Evening', icon: '🌆', hours: [18, 19, 20, 21] },
            { name: 'Night', icon: '🌙', hours: [22, 23, 0, 1, 2, 3, 4, 5] }
        ];

        periods.forEach(period => {
            const periodData = hourlyForecast.filter((forecast, idx) => {
                const hour = new Date(forecast.time).getHours();
                return period.hours.includes(hour);
            });

            if (periodData.length === 0) return;

            // Calculate period average AQI
            const avgAQI = Math.round(periodData.reduce((sum, d) => sum + d.aqi, 0) / periodData.length);
            const maxAQI = Math.max(...periodData.map(d => d.aqi));
            const minAQI = Math.min(...periodData.map(d => d.aqi));

            const category = this.getAQICategory(avgAQI);
            const advice = this.getTimeBasedAdvice(avgAQI, period.name);

            html += `
                <div class="forecast-period-card" style="border-left: 4px solid ${category.color}">
                    <div class="period-header">
                        <span class="period-icon">${period.icon}</span>
                        <h3>${period.name}</h3>
                    </div>
                    <div class="period-aqi">
                        <div class="aqi-range">
                            <span class="aqi-value" style="color: ${category.color}">${avgAQI}</span>
                            <span class="aqi-label">Avg AQI</span>
                        </div>
                        <div class="aqi-minmax">
                            <span>Range: ${minAQI} - ${maxAQI}</span>
                        </div>
                    </div>
                    <div class="period-status ${category.class}">
                        ${category.name}
                    </div>
                    <div class="period-advice">
                        <strong>Recommendation:</strong> ${advice.activity}
                    </div>
                    <div class="period-details">
                        ${advice.details}
                    </div>
                </div>
            `;
        });

        html += '</div>';

        // Add summary card
        const bestPeriod = periods.reduce((best, period) => {
            const periodData = hourlyForecast.filter((_, idx) => {
                const hour = new Date(hourlyForecast[idx].time).getHours();
                return period.hours.includes(hour);
            });
            if (periodData.length === 0) return best;
            const avgAQI = periodData.reduce((sum, d) => sum + d.aqi, 0) / periodData.length;
            return !best || avgAQI < best.aqi ? { period, aqi: avgAQI } : best;
        }, null);

        if (bestPeriod) {
            html += `
                <div class="forecast-summary">
                    <div class="summary-icon">💡</div>
                    <div class="summary-content">
                        <strong>Best Time for Activities:</strong> ${bestPeriod.period.name} ${bestPeriod.period.icon}
                        <br><span class="summary-detail">Lowest expected AQI: ~${Math.round(bestPeriod.aqi)}</span>
                    </div>
                </div>
            `;
        }

        forecastContainer.innerHTML = html;
    }

    // Get time-based health advice
    getTimeBasedAdvice(aqi, periodName) {
        if (aqi <= 50) {
            return {
                activity: '✅ Perfect for all outdoor activities',
                details: 'Enjoy running, sports, or any physical activities without concern.'
            };
        } else if (aqi <= 100) {
            return {
                activity: '⚠️ Safe for most, sensitive groups should monitor',
                details: 'Generally safe for outdoor activities. Those with respiratory conditions should watch for symptoms.'
            };
        } else if (aqi <= 150) {
            return {
                activity: '⚠️ Limit prolonged outdoor exertion',
                details: 'Reduce intense outdoor activities. Wear a mask if you must go outside for extended periods.'
            };
        } else if (aqi <= 200) {
            return {
                activity: '🚫 Avoid outdoor activities',
                details: 'Stay indoors with windows closed. Use air purifiers. Wear N95 masks if you must go out.'
            };
        } else if (aqi <= 300) {
            return {
                activity: '🚨 Stay indoors - Health Alert',
                details: 'Serious health risk. Avoid all outdoor exposure. Keep emergency medications ready.'
            };
        } else {
            return {
                activity: '🆘 Emergency - Hazardous conditions',
                details: 'Extreme health risk. Stay indoors with air purification. Seek medical help if breathing difficulty occurs.'
            };
        }
    }

    // Get AQI category info
    getAQICategory(aqi) {
        if (aqi <= 50) return { name: 'Good', class: 'good', color: '#10b981' };
        if (aqi <= 100) return { name: 'Moderate', class: 'moderate', color: '#fbbf24' };
        if (aqi <= 150) return { name: 'Unhealthy for Sensitive', class: 'sensitive', color: '#f97316' };
        if (aqi <= 200) return { name: 'Unhealthy', class: 'unhealthy', color: '#ef4444' };
        if (aqi <= 300) return { name: 'Very Unhealthy', class: 'very-unhealthy', color: '#9333ea' };
        return { name: 'Hazardous', class: 'hazardous', color: '#7c2d12' };
    }

    // Update group-specific cards with AQI-based recommendations
    updateGroupCards(aqi) {
        // For Children
        const childrenAdvice = document.getElementById('childrenAdvice');
        if (childrenAdvice) {
            childrenAdvice.innerHTML = this.getChildrenRecommendations(aqi);
        }

        // For Elderly
        const elderlyAdvice = document.getElementById('elderlyAdvice');
        if (elderlyAdvice) {
            elderlyAdvice.innerHTML = this.getElderlyRecommendations(aqi);
        }

        // For Patients
        const patientsAdvice = document.getElementById('patientsAdvice');
        if (patientsAdvice) {
            patientsAdvice.innerHTML = this.getPatientsRecommendations(aqi);
        }
    }

    // Get Children recommendations based on AQI
    getChildrenRecommendations(aqi) {
        if (aqi <= 50) {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🏃</div>
                    <div class="advice-content">
                        <div class="advice-title">Outdoor Play Encouraged</div>
                        <div class="advice-desc">Safe for all outdoor activities</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">😊</div>
                    <div class="advice-content">
                        <div class="advice-title">No Restrictions</div>
                        <div class="advice-desc">Perfect air quality for kids</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🏠</div>
                    <div class="advice-content">
                        <div class="advice-title">Indoor Activities</div>
                        <div class="advice-desc">Optional, outdoor is great</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💧</div>
                    <div class="advice-content">
                        <div class="advice-title">Stay Hydrated</div>
                        <div class="advice-desc">Ensure plenty of water intake</div>
                    </div>
                </div>
            `;
        } else if (aqi <= 100) {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🏃</div>
                    <div class="advice-content">
                        <div class="advice-title">Limit Outdoor Play</div>
                        <div class="advice-desc">Reduce playtime when AQI > 100</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">😷</div>
                    <div class="advice-content">
                        <div class="advice-title">Child-Sized Masks</div>
                        <div class="advice-desc">Use properly fitted N95 masks</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🏠</div>
                    <div class="advice-content">
                        <div class="advice-title">Indoor Activities</div>
                        <div class="advice-desc">Encourage indoor games and hobbies</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💧</div>
                    <div class="advice-content">
                        <div class="advice-title">Stay Hydrated</div>
                        <div class="advice-desc">Ensure plenty of water intake</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🚫</div>
                    <div class="advice-content">
                        <div class="advice-title">Limit Outdoor Play</div>
                        <div class="advice-desc">Reduce playtime when AQI > 100</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">😷</div>
                    <div class="advice-content">
                        <div class="advice-title">Child-Sized Masks</div>
                        <div class="advice-desc">Use properly fitted N95 masks</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🏠</div>
                    <div class="advice-content">
                        <div class="advice-title">Indoor Activities</div>
                        <div class="advice-desc">Encourage indoor games and hobbies</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💧</div>
                    <div class="advice-content">
                        <div class="advice-title">Stay Hydrated</div>
                        <div class="advice-desc">Ensure plenty of water intake</div>
                    </div>
                </div>
            `;
        }
    }

    // Get Elderly recommendations based on AQI
    getElderlyRecommendations(aqi) {
        if (aqi <= 50) {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🚶</div>
                    <div class="advice-content">
                        <div class="advice-title">Morning Walks Encouraged</div>
                        <div class="advice-desc">Safe for outdoor exercise</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💊</div>
                    <div class="advice-content">
                        <div class="advice-title">Regular Medications</div>
                        <div class="advice-desc">Continue routine as normal</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💨</div>
                    <div class="advice-content">
                        <div class="advice-title">Fresh Air</div>
                        <div class="advice-desc">Open windows for ventilation</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">📞</div>
                    <div class="advice-content">
                        <div class="advice-title">Emergency Contacts</div>
                        <div class="advice-desc">Keep doctor's number accessible</div>
                    </div>
                </div>
            `;
        } else if (aqi <= 150) {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">⚠️</div>
                    <div class="advice-content">
                        <div class="advice-title">Avoid Morning Walks</div>
                        <div class="advice-desc">Skip outdoor exercise when AQI > 150</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💊</div>
                    <div class="advice-content">
                        <div class="advice-title">Keep Medications Ready</div>
                        <div class="advice-desc">Have inhalers and emergency meds handy</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💨</div>
                    <div class="advice-content">
                        <div class="advice-title">Use Air Purifiers</div>
                        <div class="advice-desc">Keep indoor air clean and filtered</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">📞</div>
                    <div class="advice-content">
                        <div class="advice-title">Emergency Contacts</div>
                        <div class="advice-desc">Keep doctor's number accessible</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🚫</div>
                    <div class="advice-content">
                        <div class="advice-title">Avoid Morning Walks</div>
                        <div class="advice-desc">Skip outdoor exercise when AQI > 150</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💊</div>
                    <div class="advice-content">
                        <div class="advice-title">Keep Medications Ready</div>
                        <div class="advice-desc">Have inhalers and emergency meds handy</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">💨</div>
                    <div class="advice-content">
                        <div class="advice-title">Use Air Purifiers</div>
                        <div class="advice-desc">Keep indoor air clean and filtered</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">📞</div>
                    <div class="advice-content">
                        <div class="advice-title">Emergency Contacts</div>
                        <div class="advice-desc">Keep doctor's number accessible</div>
                    </div>
                </div>
            `;
        }
    }

    // Get Patients recommendations based on AQI
    getPatientsRecommendations(aqi) {
        if (aqi <= 50) {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🫁</div>
                    <div class="advice-content">
                        <div class="advice-title">Respiratory Patients</div>
                        <div class="advice-desc">Safe for moderate outdoor activities</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">❤️</div>
                    <div class="advice-content">
                        <div class="advice-title">Heart Patients</div>
                        <div class="advice-desc">Normal activity levels permitted</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🤧</div>
                    <div class="advice-content">
                        <div class="advice-title">Allergy Sufferers</div>
                        <div class="advice-desc">Monitor pollen levels separately</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🏥</div>
                    <div class="advice-content">
                        <div class="advice-title">Seek Medical Help</div>
                        <div class="advice-desc">Visit doctor if symptoms worsen</div>
                    </div>
                </div>
            `;
        } else if (aqi <= 150) {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🫁</div>
                    <div class="advice-content">
                        <div class="advice-title">Respiratory Patients</div>
                        <div class="advice-desc">Stay indoors, use nebulizers as prescribed</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">❤️</div>
                    <div class="advice-content">
                        <div class="advice-title">Heart Patients</div>
                        <div class="advice-desc">Avoid any strenuous activity outdoors</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🤧</div>
                    <div class="advice-content">
                        <div class="advice-title">Allergy Sufferers</div>
                        <div class="advice-desc">Take antihistamines as recommended</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🏥</div>
                    <div class="advice-content">
                        <div class="advice-title">Seek Medical Help</div>
                        <div class="advice-desc">Visit doctor if symptoms worsen</div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="health-advice-item">
                    <div class="advice-icon">🫁</div>
                    <div class="advice-content">
                        <div class="advice-title">Respiratory Patients</div>
                        <div class="advice-desc">Stay indoors, use nebulizers as prescribed</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">❤️</div>
                    <div class="advice-content">
                        <div class="advice-title">Heart Patients</div>
                        <div class="advice-desc">Avoid any strenuous activity outdoors</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🤧</div>
                    <div class="advice-content">
                        <div class="advice-title">Allergy Sufferers</div>
                        <div class="advice-desc">Take antihistamines as recommended</div>
                    </div>
                </div>
                <div class="health-advice-item">
                    <div class="advice-icon">🏥</div>
                    <div class="advice-content">
                        <div class="advice-title">Seek Medical Help</div>
                        <div class="advice-desc">Visit doctor if symptoms worsen</div>
                    </div>
                </div>
            `;
        }
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
