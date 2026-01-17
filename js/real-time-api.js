/**
 * Real-time API Integration for OpenWeather
 * Fetches actual air quality and weather data
 */

class RealTimeAPI {
    constructor() {
        this.cache = new Map();
        this.lastFetchTime = new Map();
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(locationKey) {
        const lastFetch = this.lastFetchTime.get(locationKey);
        if (!lastFetch) return false;

        const now = Date.now();
        return (now - lastFetch) < API_CONFIG.CACHE_DURATION;
    }

    /**
     * Fetch real-time air quality data from OpenWeather
     */
    async fetchAirQuality(locationKey) {
        // Check if API is enabled and configured
        if (!API_CONFIG.OPENWEATHER.ENABLED ||
            API_CONFIG.OPENWEATHER.API_KEY === 'YOUR_API_KEY_HERE') {
            console.log('⚠️ OpenWeather API not configured. Using simulated data.');
            return null;
        }

        // Check cache first
        if (this.isCacheValid(locationKey)) {
            console.log(`💾 Using cached data for ${locationKey}`);
            return this.cache.get(locationKey);
        }

        const location = API_CONFIG.LOCATIONS[locationKey];
        if (!location) {
            console.error(`Location ${locationKey} not found`);
            return null;
        }

        try {
            const url = `${API_CONFIG.OPENWEATHER.AIR_POLLUTION_URL}?lat=${location.lat}&lon=${location.lon}&appid=${API_CONFIG.OPENWEATHER.API_KEY}`;

            console.log(`🌍 Fetching real-time air quality for ${location.name}...`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Transform OpenWeather data to our format
            const transformedData = this.transformAirQualityData(data, location);

            // Cache the data
            this.cache.set(locationKey, transformedData);
            this.lastFetchTime.set(locationKey, Date.now());

            console.log(`✅ Real-time data loaded for ${location.name} (AQI: ${transformedData.aqi})`);
            return transformedData;

        } catch (error) {
            console.error(`❌ Error fetching air quality for ${locationKey}:`, error.message);

            if (API_CONFIG.USE_FALLBACK) {
                console.log('🔄 Falling back to simulated data...');
            }

            return null;
        }
    }

    /**
     * Fetch weather data from OpenWeather
     */
    async fetchWeather(locationKey) {
        if (!API_CONFIG.OPENWEATHER.ENABLED ||
            API_CONFIG.OPENWEATHER.API_KEY === 'YOUR_API_KEY_HERE') {
            return null;
        }

        const location = API_CONFIG.LOCATIONS[locationKey];
        if (!location) return null;

        try {
            const url = `${API_CONFIG.OPENWEATHER.BASE_URL}/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_CONFIG.OPENWEATHER.API_KEY}&units=metric`;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

            const response = await fetch(url, {
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return this.transformWeatherData(data);

        } catch (error) {
            console.error(`Error fetching weather for ${locationKey}:`, error.message);
            return null;
        }
    }

    /**
     * Transform OpenWeather Air Quality data to our format
     * OpenWeather AQI: 1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor
     * Convert to Indian AQI standard (0-500 scale)
     */
    transformAirQualityData(apiData, location) {
        const components = apiData.list[0].components;
        const owAQI = apiData.list[0].main.aqi;

        // Get pollutant concentrations (µg/m³)
        const pm25 = components.pm2_5 || 0;
        const pm10 = components.pm10 || 0;
        const no2 = components.no2 || 0;
        const so2 = components.so2 || 0;
        const co = components.co / 1000 || 0; // Convert to mg/m³
        const o3 = components.o3 || 0;

        // Calculate Indian AQI from PM2.5
        const aqi = this.calculateIndianAQI(pm25, pm10);

        return {
            areaId: location.name.toLowerCase().replace(/\s+/g, '_'),
            area: location.name,
            timestamp: new Date().toISOString(),
            pollution: {
                pm25: Math.round(pm25),
                pm10: Math.round(pm10),
                no2: Math.round(no2),
                so2: Math.round(so2),
                co: Math.round(co * 10) / 10,
                o3: Math.round(o3)
            },
            aqi: Math.round(aqi),
            source: 'openweather',
            dataQuality: 'real-time'
        };
    }

    /**
     * Calculate Indian AQI from PM2.5 concentration
     */
    calculateIndianAQI(pm25, pm10) {
        // Indian AQI breakpoints for PM2.5
        const breakpoints = [
            { cLow: 0, cHigh: 30, aqiLow: 0, aqiHigh: 50 },
            { cLow: 31, cHigh: 60, aqiLow: 51, aqiHigh: 100 },
            { cLow: 61, cHigh: 90, aqiLow: 101, aqiHigh: 200 },
            { cLow: 91, cHigh: 120, aqiLow: 201, aqiHigh: 300 },
            { cLow: 121, cHigh: 250, aqiLow: 301, aqiHigh: 400 },
            { cLow: 251, cHigh: 9999, aqiLow: 401, aqiHigh: 500 }
        ];

        for (let bp of breakpoints) {
            if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
                // Linear interpolation formula
                const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.cHigh - bp.cLow)) *
                    (pm25 - bp.cLow) + bp.aqiLow;
                return aqi;
            }
        }

        return 500; // Maximum if beyond scale
    }

    /**
     * Transform weather data to our format
     */
    transformWeatherData(apiData) {
        return {
            temperature: Math.round(apiData.main.temp * 10) / 10,
            humidity: apiData.main.humidity,
            pressure: apiData.main.pressure,
            windSpeed: Math.round(apiData.wind.speed * 3.6 * 10) / 10, // m/s to km/h
            windDirection: apiData.wind.deg,
            description: apiData.weather[0].description,
            clouds: apiData.clouds.all,
            visibility: Math.round(apiData.visibility / 100) / 10 // meters to km
        };
    }

    /**
     * Fetch complete data (air quality + weather) for a location
     */
    async fetchCompleteData(locationKey = 'delhi') {
        const [airQuality, weather] = await Promise.all([
            this.fetchAirQuality(locationKey),
            this.fetchWeather(locationKey)
        ]);

        if (!airQuality || !weather) {
            return null;
        }

        return {
            ...airQuality,
            weather: weather
        };
    }

    /**
     * Clear cache manually
     */
    clearCache() {
        this.cache.clear();
        this.lastFetchTime.clear();
        console.log('🗑️ API cache cleared');
    }

    /**
     * Get API status
     */
    getStatus() {
        return {
            enabled: API_CONFIG.OPENWEATHER.ENABLED,
            configured: API_CONFIG.OPENWEATHER.API_KEY !== 'YOUR_API_KEY_HERE',
            cacheSize: this.cache.size,
            locations: Object.keys(API_CONFIG.LOCATIONS).length
        };
    }
}

// Create global instance
window.RealTimeAPI = new RealTimeAPI();

console.log('🌍 Real-time API module loaded');
console.log('📊 API Status:', window.RealTimeAPI.getStatus());
