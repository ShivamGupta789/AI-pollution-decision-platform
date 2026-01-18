// Dual API Configuration (WeatherAPI + WAQI)
const API_CONFIG = {
    // WeatherAPI.com Configuration (for weather data)
    WEATHERAPI: {
        API_KEY: '5d659c90699942afb11132603261701',
        BASE_URL: 'https://api.weatherapi.com/v1',
        ENABLED: true
    },

    // WAQI (World Air Quality Index) Configuration
    WAQI: {
        TOKEN: '4b892755feb1b7272647fb9d922449caa050d6ad',
        BASE_URL: 'https://api.waqi.info/feed',
        // Station mapping for different Delhi NCR locations
        STATIONS: {
            'delhi': '@2553',        // Default ITO station
            'dwarka': '@10119',
            'rohini': '@10117',
            'noida': '@12466',
            'gurgaon': '@12816',
            'ghaziabad': '@11856',
            'faridabad': '@12814',
            'greater_noida': '@12463',
        },
        ENABLED: true
    },

    // Delhi NCR Location Coordinates
    LOCATIONS: {
        'delhi': { lat: 28.6139, lon: 77.2090, name: 'Central Delhi' },
        'cp': { lat: 28.6304, lon: 77.2177, name: 'Connaught Place' },
        'dwarka': { lat: 28.5921, lon: 77.0460, name: 'Dwarka' },
        'palam': { lat: 28.5843, lon: 77.0803, name: 'Palam' },
        'atul': { lat: 28.4900, lon: 77.0800, name: 'Atul Road' }, // Approx loc
        'saket': { lat: 28.5244, lon: 77.2181, name: 'Saket' },
        'noida': { lat: 28.5355, lon: 77.3910, name: 'Noida' },
        'gurgaon': { lat: 28.4595, lon: 77.0266, name: 'Gurugram' },
        'ghaziabad': { lat: 28.6692, lon: 77.4538, name: 'Ghaziabad' },
        'faridabad': { lat: 28.4089, lon: 77.3178, name: 'Faridabad' },
        'greater_noida': { lat: 28.4744, lon: 77.5040, name: 'Greater Noida' },
    },

    // Smart Fallback Settings
    USE_FALLBACK: true,  // Use simulated data if API fails
    CACHE_DURATION: 5 * 60 * 1000,  // Cache data for 5 minutes
    REQUEST_TIMEOUT: 10000  // 10 second timeout
};

// Make configuration globally available
window.API_CONFIG = API_CONFIG;
