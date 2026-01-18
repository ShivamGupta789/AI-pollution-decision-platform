// Main App Module - Handles navigation and app initialization
class VaayuSaathiApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.currentLocation = 'delhi';
        this.isDarkTheme = false;
    }

    // Initialize the app
    init() {
        console.log('🌬️ Vaayu Saathi - Initializing...');

        // Setup navigation
        this.setupNavigation();

        // Setup location selector
        this.setupLocationSelector();

        // Setup theme toggle
        this.setupThemeToggle();

        // Setup sidebar toggle for mobile
        this.setupSidebarToggle();

        // Initialize first page
        this.navigateToPage('dashboard');

        // Update sidebar live AQI
        this.updateSidebarAQI();
        setInterval(() => this.updateSidebarAQI(), 60000); // Update every minute

        console.log('✅ Vaayu Saathi - Ready!');
    }

    // Setup navigation
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);

                // Close sidebar on mobile
                if (window.innerWidth <= 1024) {
                    document.getElementById('sidebar').classList.remove('active');
                }
            });
        });
    }

    // Navigate to page
    navigateToPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageName + '-page');
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // Update nav active states
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // Update page title
        const pageTitle = document.getElementById('pageTitle');
        if (pageTitle) {
            pageTitle.textContent = this.formatPageTitle(pageName);
        }

        // Initialize page-specific functionality
        this.initializePage(pageName);

        this.currentPage = pageName;
    }

    // Format page title
    formatPageTitle(pageName) {
        const titles = {
            'dashboard': 'Dashboard',
            'map': 'AQI Map',
            'forecasting': 'Forecasting',
            'health': 'Health Insights',
            'policy': 'Policy Simulation',
            'analytics': 'Analytics'
        };
        return titles[pageName] || pageName;
    }

    // Initialize page-specific functionality
    initializePage(pageName) {
        switch (pageName) {
            case 'dashboard':
                window.DashboardManager.init();
                break;
            case 'map':
                setTimeout(() => {
                    if (!window.MapsManager.maps['mainMap']) {
                        window.MapsManager.initFullMap('mainMap');
                    } else {
                        window.MapsManager.refreshMap('mainMap');
                    }
                }, 100);
                break;
            case 'forecasting':
                this.initForecastingPage();
                break;
            case 'health':
                window.HealthManager.init();
                break;
            case 'policy':
                // Initialize policy simulation page
                if (window.policyDashboard) {
                    window.policyDashboard.initialize();
                } else if (typeof PolicyDashboard !== 'undefined') {
                    window.policyDashboard = new PolicyDashboard();
                    window.policyDashboard.initialize();
                }
                break;
            case 'analytics':
                window.AnalyticsManager.init();
                break;
        }
    }

    // Initialize forecasting page
    async initForecastingPage() {
        // Try to get current data for backend
        let forecastData;
        let currentData;

        // Fetch current data first (used for both forecast generation and weather grid)
        try {
            // Use DualAPI directly if available for best real-time data
            if (window.DualAPI) {
                currentData = await window.DualAPI.fetchCompleteData(this.currentLocation);
            } else {
                currentData = await window.AirQualityAPI.fetchRealTimeData(this.currentLocation);
            }
        } catch (e) {
            console.error("Error fetching current data for forecast page:", e);
            // Fallback to simulated
            currentData = window.AirQualityAPI.generateCurrentData();
        }

        if (window.ForecastBackend && window.ForecastBackend.isAvailable) {
            forecastData = await window.ForecastBackend.getForecast(currentData, 'hourly');
        }

        // Fallback to local generation if backend unavailable
        if (!forecastData) {
            forecastData = window.AirQualityAPI.generateForecast();
        }

        window.ChartsManager.createForecastChart('forecastChart', forecastData);

        // Weather grid - Pass real data
        this.updateWeatherGrid(currentData);

        // Prediction details
        this.updatePredictionDetails(forecastData);

        // Setup forecast option buttons
        const forecastBtns = document.querySelectorAll('.forecast-options .filter-btn');
        forecastBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                forecastBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Get forecast type
                const forecastType = btn.dataset.forecast;
                let newForecastData;

                // Try backend first
                if (window.ForecastBackend && window.ForecastBackend.isAvailable) {
                    newForecastData = await window.ForecastBackend.getForecast(currentData, forecastType);
                }

                // Fallback to local generation
                if (!newForecastData) {
                    switch (forecastType) {
                        case 'hourly':
                            newForecastData = window.AirQualityAPI.generateForecast(48);
                            break;
                        case 'daily':
                            newForecastData = window.AirQualityAPI.generateDailyForecast(7);
                            break;
                        case 'extended':
                            newForecastData = window.AirQualityAPI.generateDailyForecast(14);
                            break;
                        default:
                            newForecastData = window.AirQualityAPI.generateForecast(48);
                    }
                }

                // Update the chart
                window.ChartsManager.createForecastChart('forecastChart', newForecastData);

                // Update prediction details
                this.updatePredictionDetails(newForecastData);
            });
        });
    }

    // Update weather grid
    updateWeatherGrid(data) {
        const weatherGrid = document.getElementById('weatherGrid');
        if (!weatherGrid) return;

        // Default to placeholders if data is missing
        const windSpeed = data?.weather?.windSpeed || data?.windSpeed || '--';
        const temp = data?.weather?.temperature || data?.temperature || '--';
        const humidity = data?.weather?.humidity || data?.humidity || '--';
        const pressure = data?.weather?.pressure || data?.pressure || '--';

        // Add units if missing (simulated data might optionally include it, but usually raw numbers)
        // DualAPI returns raw numbers.
        // Check if values are numbers to append units safely
        const windDisplay = typeof windSpeed === 'number' ? `${windSpeed} km/h` : windSpeed;
        const tempDisplay = typeof temp === 'number' ? `${temp}°C` : temp;
        const humDisplay = typeof humidity === 'number' ? `${humidity}%` : humidity;
        const pressDisplay = typeof pressure === 'number' ? `${pressure} hPa` : pressure;

        const weatherFactors = [
            { name: 'Wind Speed', value: windDisplay, impact: 'Helps disperse pollutants', icon: '💨' },
            { name: 'Temperature', value: tempDisplay, impact: 'Moderate temperature', icon: '🌡️' },
            { name: 'Humidity', value: humDisplay, impact: 'Higher humidity can trap pollutants', icon: '💧' },
            { name: 'Pressure', value: pressDisplay, impact: 'Stable atmospheric conditions', icon: '⏱️' }
        ];

        weatherGrid.innerHTML = '';

        weatherFactors.forEach(factor => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            card.innerHTML = `
                <div class="metric-header">
                    <span class="metric-icon">${factor.icon}</span>
                    <span class="metric-label">${factor.name}</span>
                </div>
                <div class="metric-value small" style="background: var(--gradient-cyan); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${factor.value}
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem;">
                    ${factor.impact}
                </p>
            `;
            weatherGrid.appendChild(card);
        });
    }

    // Update prediction details
    updatePredictionDetails(forecastData) {
        const container = document.getElementById('predictionDetails');
        if (!container) return;

        const avgAQI = Math.round(forecastData.slice(0, 24).reduce((sum, f) => sum + f.aqi, 0) / 24);
        const trend = forecastData[0].aqi < forecastData[23].aqi ? 'Worsening' : 'Improving';

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; padding: 2rem;">

                <div style="text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">
                        ${trend === 'Improving' ? '📉' : '📈'}
                    </div>
                    <div style="color: var(--text-secondary);">${trend} Trend</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 0.5rem;">
                        85%
                    </div>
                    <div style="color: var(--text-secondary);">Confidence Level</div>
                </div>
            </div>
            <div style="margin-top: 2rem; padding: 1.5rem; background: var(--glass-bg); border-radius: 1rem;">
                <h4 style="margin-bottom: 1rem;">📊 Forecast Analysis</h4>
                <p style="color: var(--text-secondary); line-height: 1.8;">
                    Based on current meteorological conditions and historical patterns, air quality is expected to ${trend.toLowerCase()} 
                    over the next 24 hours. Wind patterns and atmospheric pressure will play a crucial role in pollutant dispersion.
                    Monitor updates regularly for the most accurate information.
                </p>
            </div>
        `;
    }

    // Setup location selector
    setupLocationSelector() {
        const locationSelect = document.getElementById('locationSelect');
        if (locationSelect) {
            locationSelect.addEventListener('change', (e) => {
                this.currentLocation = e.target.value;
                window.AirQualityAPI.setLocation(this.currentLocation);
                this.onLocationChange();
            });
        }
    }

    // Handle location change
    onLocationChange() {
        // Refresh current page
        this.initializePage(this.currentPage);

        // Update sidebar AQI
        this.updateSidebarAQI();
    }

    // Setup theme toggle
    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.isDarkTheme = !this.isDarkTheme;
                document.body.classList.toggle('dark-theme', this.isDarkTheme);
                themeToggle.textContent = this.isDarkTheme ? '☀️' : '🌙';
            });
        }
    }

    // Setup sidebar toggle for mobile
    setupSidebarToggle() {
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');

        if (menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 1024) {
                    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                        sidebar.classList.remove('active');
                    }
                }
            });
        }
    }

    // Update sidebar live AQI
    async updateSidebarAQI() {
        // Fetch real-time data from dual API
        const currentData = await window.AirQualityAPI.fetchRealTimeData(window.AirQualityAPI.currentLocation);
        const category = window.AirQualityAPI.getAQICategory(currentData.aqi);

        const sidebarAQI = document.getElementById('sidebar-aqi');
        const sidebarCategory = document.getElementById('sidebar-category');

        if (sidebarAQI) {
            sidebarAQI.textContent = currentData.aqi;
        }

        if (sidebarCategory) {
            sidebarCategory.textContent = category.name;
            sidebarCategory.className = 'live-aqi-category ' + category.class;
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new VaayuSaathiApp();
    app.init();

    // Make app globally available
    window.VaayuSaathi = app;
});
