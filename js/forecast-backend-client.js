/**
 * Forecast Backend Client
 * Calls the Python backend to get XGBoost model predictions
 */

class ForecastBackendClient {
    constructor() {
        this.backendUrl = 'http://localhost:5000';
        this.isAvailable = false;
        this.checkHealth();
    }

    async checkHealth() {
        try {
            const response = await fetch(`${this.backendUrl}/health`);
            const data = await response.json();
            this.isAvailable = data.status === 'ok' && data.model_loaded;
            console.log(`🌬️  Forecast Backend: ${this.isAvailable ? '✅ Connected' : '❌ Unavailable'}`);
            if (this.isAvailable) {
                console.log(`   AQI Range: ${data.aqi_range[0]} - ${data.aqi_range[1]}`);
            }
            return this.isAvailable;
        } catch (error) {
            this.isAvailable = false;
            console.log('⚠️  Forecast Backend unavailable');
            return false;
        }
    }

    async getForecast(currentData, type = 'hourly') {
        if (!this.isAvailable) {
            await this.checkHealth();
            if (!this.isAvailable) {
                return null;
            }
        }

        try {
            const response = await fetch(`${this.backendUrl}/forecast`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pm25: currentData.pm25 || 150,
                    temperature: currentData.temperature || 20,
                    humidity: currentData.humidity || 60,
                    wind_speed: currentData.windSpeed || 5,
                    type: type
                })
            });

            if (!response.ok) {
                throw new Error('Backend request failed');
            }

            const data = await response.json();
            console.log(`✅ Received XGBoost forecast (${type}):`, data.forecasts.length, 'points');
            return data.forecasts;

        } catch (error) {
            console.warn('Failed to get backend forecast:', error);
            this.isAvailable = false;
            return null;
        }
    }
}

// Create global instance
window.ForecastBackend = new ForecastBackendClient();
