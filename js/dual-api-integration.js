/**
 * Dual API Integration - Combines WeatherAPI.com and WAQI
 * WeatherAPI.com: Weather data (temperature, humidity, wind, etc.)
 * WAQI: Air quality data (AQI, PM2.5, PM10)
 */

class DualAPIIntegration {
    constructor() {
        this.cache = new Map();
        this.lastFetchTime = new Map();
        this.updateInterval = 3600000; // 1 hour
    }

    /**
     * Check if cached data is still valid
     */
    isCacheValid(cacheKey) {
        const lastFetch = this.lastFetchTime.get(cacheKey);
        if (!lastFetch) return false;
        return (Date.now() - lastFetch) < API_CONFIG.CACHE_DURATION;
    }

    /**
     * Fetch weather data from WeatherAPI.com
     */
    async fetchWeatherData(locationKey = 'delhi') {
        if (!API_CONFIG.WEATHERAPI.ENABLED) {
            console.log('⚠️ WeatherAPI not enabled');
            return null;
        }

        const cacheKey = `weather_${locationKey}`;
        if (this.isCacheValid(cacheKey)) {
            console.log(`💾 Using cached weather data for ${locationKey}`);
            return this.cache.get(cacheKey);
        }

        try {
            const location = API_CONFIG.LOCATIONS[locationKey];
            const cityName = location ? location.name : 'Delhi, India';

            const url = `${API_CONFIG.WEATHERAPI.BASE_URL}/current.json?key=${API_CONFIG.WEATHERAPI.API_KEY}&q=${cityName}`;

            console.log(`🌍 Fetching weather data from WeatherAPI for ${cityName}...`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`WeatherAPI error: ${response.status}`);
            }

            const data = await response.json();
            const transformed = this.transformWeatherAPIData(data);

            this.cache.set(cacheKey, transformed);
            this.lastFetchTime.set(cacheKey, Date.now());

            console.log(`✅ Weather data fetched successfully`);
            return transformed;

        } catch (error) {
            console.error('❌ Error fetching WeatherAPI data:', error);
            return null;
        }
    }

    /**
     * Fetch AQI data from WAQI
     */
    async fetchAQIData(locationKey = 'delhi') {
        if (!API_CONFIG.WAQI.ENABLED) {
            console.log('⚠️ WAQI not enabled');
            return null;
        }

        const cacheKey = `aqi_${locationKey}`;
        if (this.isCacheValid(cacheKey)) {
            console.log(`💾 Using cached AQI data for ${locationKey}`);
            return this.cache.get(cacheKey);
        }

        try {
            const station = API_CONFIG.WAQI.STATIONS[locationKey] || '@8179';
            const url = `${API_CONFIG.WAQI.BASE_URL}/${station}/?token=${API_CONFIG.WAQI.TOKEN}`;

            console.log(`🌍 Fetching AQI data from WAQI for ${locationKey}...`);

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`WAQI error: ${response.status}`);
            }

            const result = await response.json();
            if (result.status !== 'ok') {
                throw new Error('WAQI returned error status');
            }

            const transformed = this.transformWAQIData(result.data, locationKey);

            this.cache.set(cacheKey, transformed);
            this.lastFetchTime.set(cacheKey, Date.now());

            console.log(`✅ AQI data fetched successfully (AQI: ${transformed.aqi})`);
            return transformed;

        } catch (error) {
            console.error('❌ Error fetching WAQI data:', error);
            return null;
        }
    }

    /**
     * Fetch complete data from both APIs
     */
    async fetchCompleteData(locationKey = 'delhi') {
        console.log(`🔄 Fetching data for ${locationKey} from dual APIs...`);

        const [weatherData, aqiData] = await Promise.all([
            this.fetchWeatherData(locationKey),
            this.fetchAQIData(locationKey)
        ]);

        if (!weatherData && !aqiData) {
            console.log('⚠️ Both APIs failed, returning null');
            return null;
        }

        // Merge the data
        const location = API_CONFIG.LOCATIONS[locationKey];
        return {
            areaId: locationKey,
            area: location ? location.name : 'Delhi',
            timestamp: new Date().toISOString(),

            // Weather data (from WeatherAPI.com)
            weather: weatherData || {},

            // AQI data (from WAQI)
            aqi: aqiData?.aqi || null,
            pollution: aqiData?.pollution || {},

            // Metadata
            source: 'dual_api',
            dataQuality: 'real-time',
            apis: {
                weather: weatherData ? 'weatherapi' : 'unavailable',
                aqi: aqiData ? 'waqi' : 'unavailable'
            }
        };
    }

    /**
     * Transform WeatherAPI.com data to our format
     */
    transformWeatherAPIData(apiData) {
        const current = apiData.current;

        return {
            temperature: Math.round(current.temp_c * 10) / 10,
            feelsLike: Math.round(current.feelslike_c * 10) / 10,
            humidity: current.humidity,
            pressure: current.pressure_mb,
            windSpeed: current.wind_kph,
            windDirection: current.wind_degree,
            visibility: current.vis_km,
            uvIndex: current.uv,
            condition: {
                text: current.condition.text,
                code: current.condition.code,
                icon: current.condition.icon
            },
            emoji: this.getWeatherEmoji(current.condition.text)
        };
    }

    /**
     * Transform WAQI data to our format
     */
    transformWAQIData(apiData, locationKey) {
        const location = API_CONFIG.LOCATIONS[locationKey];

        const aqi = apiData.aqi;
        const iaqi = apiData.iaqi || {};

        return {
            areaId: locationKey,
            area: location ? location.name : 'Delhi',
            aqi: aqi,
            pollution: {
                pm25: iaqi.pm25 ? Math.round(iaqi.pm25.v) : null,
                pm10: iaqi.pm10 ? Math.round(iaqi.pm10.v) : null,
                no2: iaqi.no2 ? Math.round(iaqi.no2.v) : null,
                so2: iaqi.so2 ? Math.round(iaqi.so2.v) : null,
                co: iaqi.co ? Math.round(iaqi.co.v * 10) / 10 : null,
                o3: iaqi.o3 ? Math.round(iaqi.o3.v) : null
            },
            category: this.getAQICategory(aqi),
            timestamp: apiData.time?.iso || new Date().toISOString()
        };
    }

    /**
     * Get AQI category with color and description
     */
    getAQICategory(aqi) {
        if (aqi <= 50) {
            return {
                label: 'Good',
                color: '#00e676',
                bg: 'rgba(0, 230, 118, 0.2)',
                desc: 'Air quality is satisfactory'
            };
        } else if (aqi <= 100) {
            return {
                label: 'Moderate',
                color: '#ffeb3b',
                bg: 'rgba(255, 235, 59, 0.2)',
                desc: 'Air quality is acceptable'
            };
        } else if (aqi <= 150) {
            return {
                label: 'Unhealthy for Sensitive Groups',
                color: '#ff9800',
                bg: 'rgba(255, 152, 0, 0.2)',
                desc: 'Sensitive groups may experience health effects'
            };
        } else if (aqi <= 200) {
            return {
                label: 'Unhealthy',
                color: '#f44336',
                bg: 'rgba(244, 67, 54, 0.2)',
                desc: 'Everyone may begin to experience health effects'
            };
        } else if (aqi <= 300) {
            return {
                label: 'Very Unhealthy',
                color: '#9c27b0',
                bg: 'rgba(156, 39, 176, 0.2)',
                desc: 'Health alert: everyone may experience serious health effects'
            };
        } else {
            return {
                label: 'Hazardous',
                color: '#880e4f',
                bg: 'rgba(136, 14, 79, 0.2)',
                desc: 'Health warnings of emergency conditions'
            };
        }
    }

    /**
     * Get weather emoji based on condition
     */
    getWeatherEmoji(conditionText) {
        const text = conditionText.toLowerCase();
        if (text.includes('sunny') || text.includes('clear')) return '☀️';
        if (text.includes('partly cloudy')) return '⛅';
        if (text.includes('cloud')) return '☁️';
        if (text.includes('rain') || text.includes('drizzle')) return '🌧️';
        if (text.includes('thunder')) return '⛈️';
        if (text.includes('snow')) return '❄️';
        if (text.includes('fog') || text.includes('mist') || text.includes('haze')) return '🌫️';
        return '🌤️';
    }

    /**
     * Clear all cached data
     */
    clearCache() {
        this.cache.clear();
        this.lastFetchTime.clear();
        console.log('🗑️ Dual API cache cleared');
    }

    /**
     * Get API status
     */
    getStatus() {
        return {
            weatherAPI: {
                enabled: API_CONFIG.WEATHERAPI.ENABLED,
                configured: !!API_CONFIG.WEATHERAPI.API_KEY
            },
            waqiAPI: {
                enabled: API_CONFIG.WAQI.ENABLED,
                configured: !!API_CONFIG.WAQI.TOKEN
            },
            cacheSize: this.cache.size
        };
    }
}

// Create global instance
window.DualAPI = new DualAPIIntegration();

console.log('🚀 Dual API Integration loaded (WeatherAPI + WAQI)');
console.log('📊 API Status:', window.DualAPI.getStatus());
