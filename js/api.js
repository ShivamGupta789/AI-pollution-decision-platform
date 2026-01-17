// API Module - Handles data generation and simulation
class AirQualityAPI {
    constructor() {
        this.locations = ['delhi', 'noida', 'gurgaon', 'faridabad', 'ghaziabad'];
        this.currentLocation = 'delhi';
        this.locationCoords = {
            delhi: { lat: 28.6139, lng: 77.2090 },
            noida: { lat: 28.5355, lng: 77.3910 },
            gurgaon: { lat: 28.4595, lng: 77.0266 },
            faridabad: { lat: 28.4089, lng: 77.3178 },
            ghaziabad: { lat: 28.6692, lng: 77.4538 }
        };
    }

    // Generate realistic AQI data
    generateCurrentData() {
        const baseAQI = 120 + Math.random() * 180; // Delhi typically has poor AQI
        const pm25 = baseAQI * 0.8 + Math.random() * 50;
        const pm10 = baseAQI * 1.2 + Math.random() * 60;
        const temp = 15 + Math.random() * 20;
        const humidity = 40 + Math.random() * 40;

        return {
            aqi: Math.round(baseAQI),
            pm25: Math.round(pm25),
            pm10: Math.round(pm10),
            temperature: Math.round(temp * 10) / 10,
            humidity: Math.round(humidity),
            timestamp: new Date().toISOString(),
            location: this.currentLocation
        };
    }

    // Get AQI category
    getAQICategory(aqi) {
        if (aqi <= 50) return { name: 'Good', class: 'status-good' };
        if (aqi <= 100) return { name: 'Moderate', class: 'status-moderate' };
        if (aqi <= 150) return { name: 'Unhealthy for Sensitive Groups', class: 'status-unhealthy-sensitive' };
        if (aqi <= 200) return { name: 'Unhealthy', class: 'status-unhealthy' };
        if (aqi <= 300) return { name: 'Very Unhealthy', class: 'status-very-unhealthy' };
        return { name: 'Hazardous', class: 'status-hazardous' };
    }

    // Generate forecast data for next 48 hours
    generateForecast() {
        const forecast = [];
        let baseAQI = 120;

        for (let i = 0; i < 48; i++) {
            // Add some variation and trends
            const variation = Math.sin(i / 6) * 30 + Math.random() * 40;
            const aqi = Math.max(50, Math.min(350, baseAQI + variation));

            forecast.push({
                time: new Date(Date.now() + i * 3600000).toISOString(),
                aqi: Math.round(aqi),
                hour: new Date(Date.now() + i * 3600000).getHours()
            });

            baseAQI = aqi;
        }

        return forecast;
    }

    // Generate historical data
    generateHistoricalData(period = 'week') {
        const data = [];
        let points = 7;
        let interval = 86400000; // 1 day

        if (period === 'month') {
            points = 30;
        } else if (period === 'year') {
            points = 12;
            interval = 2592000000; // ~30 days
        }

        for (let i = points; i >= 0; i--) {
            const time = Date.now() - (i * interval);
            const baseAQI = 100 + Math.random() * 150;

            data.push({
                date: new Date(time).toISOString(),
                aqi: Math.round(baseAQI),
                pm25: Math.round(baseAQI * 0.8),
                pm10: Math.round(baseAQI * 1.2)
            });
        }

        return data;
    }

    // Generate pollution sources
    getPollutionSources() {
        return [
            { name: 'Vehicular Emissions', percentage: 28, icon: '🚗' },
            { name: 'Industrial Pollution', percentage: 22, icon: '🏭' },
            { name: 'Construction Dust', percentage: 18, icon: '🏗️' },
            { name: 'Crop Burning', percentage: 15, icon: '🔥' },
            { name: 'Residential Heating', percentage: 12, icon: '🏠' },
            { name: 'Others', percentage: 5, icon: '💨' }
        ];
    }

    // Generate health recommendations
    getHealthRecommendations(aqi) {
        const category = this.getAQICategory(aqi);
        const recommendations = {
            general: '',
            children: '',
            elderly: '',
            pregnant: '',
            patients: '',
            activities: [],
            protection: []
        };

        if (aqi <= 50) {
            recommendations.general = 'Air quality is good. It\'s a great day to be outside!';
            recommendations.children = 'Perfect for outdoor activities and play.';
            recommendations.elderly = 'Enjoy outdoor activities as normal.';
            recommendations.pregnant = 'No restrictions on outdoor activities.';
            recommendations.patients = 'All activities are safe.';
            recommendations.activities = [
                { name: 'Jogging/Running', status: 'safe', icon: '🏃' },
                { name: 'Outdoor Sports', status: 'safe', icon: '⚽' },
                { name: 'Cycling', status: 'safe', icon: '🚴' }
            ];
        } else if (aqi <= 100) {
            recommendations.general = 'Air quality is acceptable. Sensitive groups should limit prolonged outdoor exertion.';
            recommendations.children = 'Limit prolonged outdoor activities if feeling unwell.';
            recommendations.elderly = 'Generally safe, but monitor for any discomfort.';
            recommendations.pregnant = 'Limit prolonged outdoor exertion.';
            recommendations.patients = 'Consider reducing intense outdoor activities.';
            recommendations.activities = [
                { name: 'Light Walking', status: 'safe', icon: '🚶' },
                { name: 'Indoor Exercise', status: 'recommended', icon: '🏠' },
                { name: 'Intense Workouts', status: 'caution', icon: '⚠️' }
            ];
            recommendations.protection = ['Consider wearing a mask if sensitive', 'Stay hydrated'];
        } else if (aqi <= 200) {
            recommendations.general = 'Air quality is unhealthy. Everyone should reduce prolonged outdoor exertion.';
            recommendations.children = 'Avoid prolonged outdoor activities. Play indoors.';
            recommendations.elderly = 'Stay indoors as much as possible.';
            recommendations.pregnant = 'Minimize outdoor exposure. Use air purifiers indoors.';
            recommendations.patients = 'Avoid outdoor activities. Keep medications handy.';
            recommendations.activities = [
                { name: 'Outdoor Activities', status: 'avoid', icon: '❌' },
                { name: 'Indoor Activities', status: 'recommended', icon: '✅' }
            ];
            recommendations.protection = [
                'Wear N95 mask when going outside',
                'Use air purifiers indoors',
                'Keep windows closed',
                'Stay hydrated'
            ];
        } else {
            recommendations.general = 'Air quality is very unhealthy or hazardous. Avoid outdoor activities.';
            recommendations.children = 'Keep indoors with air purifiers running.';
            recommendations.elderly = 'Avoid going outside. Use air purifiers.';
            recommendations.pregnant = 'Stay indoors. Monitor health closely.';
            recommendations.patients = 'Stay indoors. Consult doctor if experiencing symptoms.';
            recommendations.activities = [
                { name: 'All Outdoor Activities', status: 'avoid', icon: '🚫' },
                { name: 'Indoor Rest', status: 'recommended', icon: '🏠' }
            ];
            recommendations.protection = [
                'Mandatory N95/N99 mask if going outside',
                'Use high-quality air purifiers',
                'Seal windows and doors',
                'Monitor health symptoms',
                'Consult doctor if breathing difficulties'
            ];
        }

        return recommendations;
    }

    // Get multi-location data
    getMultiLocationData() {
        return this.locations.map(location => {
            const baseAQI = 80 + Math.random() * 200;
            return {
                location: location,
                aqi: Math.round(baseAQI),
                coords: this.locationCoords[location],
                category: this.getAQICategory(Math.round(baseAQI))
            };
        });
    }

    setLocation(location) {
        this.currentLocation = location;
    }
}

// Export for use in other modules
window.AirQualityAPI = new AirQualityAPI();
