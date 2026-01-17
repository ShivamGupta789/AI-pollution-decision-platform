/**
 * API Integration Wrapper
 * Seamlessly integrates real-time OpenWeather data with existing code
 */

(function () {
    // Wait for AirQualityAPI to be available
    if (typeof AirQualityAPI === 'undefined') {
        console.error('❌ AirQualityAPI not found!');
        return;
    }

    const OriginalAPI = window.AirQualityAPI;

    // Store the original method
    const originalGenerateCurrentData = OriginalAPI.generateCurrentData.bind(OriginalAPI);

    // Create a promise-based wrapper
    OriginalAPI.fetchRealTimeData = async function () {
        // Check if real-time API is available and properly configured
        if (typeof API_CONFIG !== 'undefined' &&
            API_CONFIG.OPENWEATHER.ENABLED &&
            API_CONFIG.OPENWEATHER.API_KEY !== 'YOUR_API_KEY_HERE' &&
            typeof RealTimeAPI !== 'undefined') {

            try {
                // Fetch real-time data
                const realData = await window.RealTimeAPI.fetchCompleteData(this.currentLocation);

                if (realData) {
                    console.log(`📡 Using REAL-TIME data for ${this.currentLocation}`);

                    // Transform to match expected format
                    return {
                        aqi: realData.aqi,
                        pm25: realData.pollution.pm25,
                        pm10: realData.pollution.pm10,
                        temperature: realData.weather?.temperature || 25,
                        humidity: realData.weather?.humidity || 50,
                        timestamp: realData.timestamp,
                        location: this.currentLocation,
                        source: 'real-time',
                        pollution: realData.pollution,
                        weather: realData.weather
                    };
                }
            } catch (error) {
                console.warn('⚠️ Real-time API failed:', error.message);
            }
        }

        // Fallback to simulated data
        console.log(`🎲 Using SIMULATED data for ${this.currentLocation}`);
        return originalGenerateCurrentData();
    };

    // Keep synchronous version for backwards compatibility
    // It will return cached data if available, otherwise trigger fetch
    OriginalAPI.generateCurrentData = function () {
        // If we have cached real-time data, return it immediately
        if (typeof RealTimeAPI !== 'undefined' &&
            API_CONFIG?.OPENWEATHER?.ENABLED &&
            RealTimeAPI.cache.has(this.currentLocation)) {

            const cached = RealTimeAPI.cache.get(this.currentLocation);
            console.log(`💾 Returning cached real-time data for ${this.currentLocation}`);

            return {
                aqi: cached.aqi,
                pm25: cached.pollution.pm25,
                pm10: cached.pollution.pm10,
                temperature: cached.weather?.temperature || 25,
                humidity: cached.weather?.humidity || 50,
                timestamp: cached.timestamp,
                location: this.currentLocation,
                source: 'real-time'
            };
        }

        // If no cache, trigger async fetch in background and return simulated data for now
        if (typeof API_CONFIG !== 'undefined' &&
            API_CONFIG.OPENWEATHER.ENABLED &&
            typeof RealTimeAPI !== 'undefined') {

            // Trigger fetch in background
            this.fetchRealTimeData().then(data => {
                if (data && window.DashboardManager) {
                    // Update dashboard when data arrives
                    setTimeout(() => {
                        if (window.DashboardManager.init) {
                            window.DashboardManager.init();
                        }
                    }, 100);
                }
            });
        }

        // Return simulated data immediately
        return originalGenerateCurrentData();
    };

    console.log('✅ API Integration Wrapper loaded');
    console.log('💡 System will use real-time data when available');
})();
