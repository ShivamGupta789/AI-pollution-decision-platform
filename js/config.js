// OpenWeather API Configuration
const API_CONFIG = {
    // OpenWeather API Configuration
    OPENWEATHER: {
        // 👇 PASTE YOUR API KEY HERE (replace the text below)
        API_KEY: 'ed0c918deb2c4f6daeca19a073b0e993',

        // API Endpoints (Don't change these)
        BASE_URL: 'https://api.openweathermap.org/data/2.5',
        AIR_POLLUTION_URL: 'https://api.openweathermap.org/data/2.5/air_pollution',

        // 👇 SET THIS TO true AFTER ADDING YOUR API KEY
        ENABLED: true
    },

    // Delhi NCR Location Coordinates
    LOCATIONS: {
        'delhi': { lat: 28.6139, lon: 77.2090, name: 'Central Delhi' },
        'dwarka': { lat: 28.5921, lon: 77.0460, name: 'Dwarka' },
        'rohini': { lat: 28.7496, lon: 77.0669, name: 'Rohini' },
        'noida': { lat: 28.5355, lon: 77.3910, name: 'Noida' },
        'gurgaon': { lat: 28.4595, lon: 77.0266, name: 'Gurugram' },
        'ghaziabad': { lat: 28.6692, lon: 77.4538, name: 'Ghaziabad' },
        'faridabad': { lat: 28.4089, lon: 77.3178, name: 'Faridabad' },
        'greater_noida': { lat: 28.4744, lon: 77.5040, name: 'Greater Noida' },
        'anand_vihar': { lat: 28.6469, lon: 77.3162, name: 'Anand Vihar' }
    },

    // Smart Fallback Settings
    USE_FALLBACK: true,  // Use simulated data if API fails
    CACHE_DURATION: 5 * 60 * 1000,  // Cache data for 5 minutes
    REQUEST_TIMEOUT: 10000  // 10 second timeout
};

// Make configuration globally available
window.API_CONFIG = API_CONFIG;
