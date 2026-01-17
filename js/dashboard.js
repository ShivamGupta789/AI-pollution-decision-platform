// Dashboard Module - Handles dashboard page functionality
class DashboardManager {
    constructor() {
        this.currentPeriod = 'week';
        this.updateInterval = null;
    }

    // Initialize dashboard
    init() {
        this.updateDashboard();
        this.setupEventListeners();

        // Auto-refresh every 5 minutes
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, 300000);
    }

    // Update all dashboard components
    async updateDashboard() {
        // Fetch real-time data from dual API
        const currentData = await window.AirQualityAPI.fetchRealTimeData(window.AirQualityAPI.currentLocation);
        const category = window.AirQualityAPI.getAQICategory(currentData.aqi);

        // Update metrics cards
        this.updateMetrics(currentData, category);

        // Update forecast
        this.updateForecast();

        // Update historical chart
        this.updateHistoricalChart(this.currentPeriod);

        // Update health recommendations
        this.updateHealthRecommendations(currentData.aqi);

        // Update pollution sources
        this.updatePollutionSources();
    }

    // Update metrics cards
    updateMetrics(data, category) {
        // AQI Card
        const aqiElement = document.getElementById('currentAQI');
        const aqiStatus = document.getElementById('aqiStatus');
        const aqiTime = document.getElementById('aqiTime');
        const aqiCard = document.getElementById('aqiCard');

        if (aqiElement) {
            aqiElement.textContent = data.aqi;
            aqiElement.style.color = this.getAQIColor(data.aqi);
        }

        if (aqiStatus) {
            aqiStatus.textContent = category.name;
            aqiStatus.className = 'metric-status ' + category.class;
        }

        if (aqiTime) {
            aqiTime.textContent = 'Updated: ' + new Date().toLocaleTimeString();
        }

        if (aqiCard) {
            aqiCard.style.borderColor = this.getAQIColor(data.aqi);
        }

        // PM2.5
        this.updateMetricCard('pm25Value', 'pm25Progress', data.pm25, 500);

        // PM10
        this.updateMetricCard('pm10Value', 'pm10Progress', data.pm10, 600);

        // Humidity
        this.updateMetricCard('humidityValue', 'humidityProgress', data.humidity, 100);

        // Temperature
        this.updateMetricCard('tempValue', 'tempProgress', data.temperature, 50);
    }

    // Update individual metric card
    updateMetricCard(valueId, progressId, value, max) {
        const valueElement = document.getElementById(valueId);
        const progressElement = document.getElementById(progressId);

        if (valueElement) {
            valueElement.textContent = value;
        }

        if (progressElement) {
            const percentage = Math.min((value / max) * 100, 100);
            progressElement.style.width = percentage + '%';
        }
    }

    // Update forecast section
    updateForecast() {
        const forecastData = window.AirQualityAPI.generateForecast();
        const timeline = document.getElementById('forecastTimeline');

        if (!timeline) return;

        timeline.innerHTML = '';

        // Show next 12 hours
        forecastData.slice(0, 12).forEach(forecast => {
            const card = document.createElement('div');
            card.className = 'forecast-card';

            const time = new Date(forecast.time);
            const category = window.AirQualityAPI.getAQICategory(forecast.aqi);

            card.innerHTML = `
                <div class="forecast-time">${time.getHours()}:00</div>
                <div class="forecast-aqi" style="color: ${this.getAQIColor(forecast.aqi)}">${forecast.aqi}</div>
                <div class="forecast-status ${category.class}">${category.name.split(' ')[0]}</div>
            `;

            timeline.appendChild(card);
        });
    }

    // Update historical chart
    updateHistoricalChart(period) {
        const historicalData = window.AirQualityAPI.generateHistoricalData(period);
        window.ChartsManager.createHistoricalChart('historicalChart', historicalData, period);
    }

    // Update health recommendations
    updateHealthRecommendations(aqi) {
        const recommendations = window.AirQualityAPI.getHealthRecommendations(aqi);
        const container = document.getElementById('healthRecommendations');

        if (!container) return;

        container.innerHTML = '';

        // Create recommendation cards
        const generalCard = this.createRecommendationCard('General Advisory', recommendations.general, '📢');
        container.appendChild(generalCard);

        if (recommendations.activities.length > 0) {
            recommendations.activities.forEach(activity => {
                const card = this.createActivityCard(activity);
                container.appendChild(card);
            });
        }
    }

    // Create recommendation card
    createRecommendationCard(title, text, icon) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        card.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 8px;">${icon}</div>
            <h4 style="margin-bottom: 8px;">${title}</h4>
            <p style="color: var(--text-secondary); font-size: 0.875rem;">${text}</p>
        `;
        return card;
    }

    // Create activity card
    createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';

        let statusColor = '#10b981';
        if (activity.status === 'caution') statusColor = '#fbbf24';
        if (activity.status === 'avoid') statusColor = '#ef4444';

        card.innerHTML = `
            <div style="font-size: 1.5rem; margin-bottom: 8px;">${activity.icon}</div>
            <h4 style="margin-bottom: 8px;">${activity.name}</h4>
            <p style="color: ${statusColor}; font-weight: 600; text-transform: uppercase; font-size: 0.75rem;">${activity.status}</p>
        `;
        return card;
    }

    // Update pollution sources
    updatePollutionSources() {
        const sources = window.AirQualityAPI.getPollutionSources();
        const sourcesList = document.getElementById('sourcesList');

        if (sourcesList) {
            sourcesList.innerHTML = '';

            sources.forEach(source => {
                const item = document.createElement('div');
                item.className = 'source-item';
                item.innerHTML = `
                    <span class="source-name">${source.icon} ${source.name}</span>
                    <span class="source-percentage">${source.percentage}%</span>
                `;
                sourcesList.appendChild(item);
            });
        }

        // Create chart
        window.ChartsManager.createSourcesChart('sourcesChart', sources);
    }

    // Setup event listeners
    setupEventListeners() {
        // Historical period filters
        const filterButtons = document.querySelectorAll('.trend-filters .filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateHistoricalChart(this.currentPeriod);
            });
        });
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

    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

window.DashboardManager = new DashboardManager();
