// Analytics Module - Handles analytics page
class AnalyticsManager {
    constructor() {
        this.currentPattern = 'daily';
    }

    // Initialize analytics page
    init() {
        this.updateAnalytics();
        this.setupEventListeners();
    }

    // Update all analytics
    updateAnalytics() {
        // Update patterns chart
        this.updatePatternsChart(this.currentPattern);

        // Update source attribution
        this.updateSourceAttribution();

        // Update comparative analytics
        this.updateComparativeAnalytics();

        // Update statistics
        this.updateStatistics();
    }

    // Update patterns chart
    updatePatternsChart(pattern) {
        window.ChartsManager.createPatternsChart('patternsChart', pattern);
    }

    // Update source attribution
    updateSourceAttribution() {
        const sources = window.AirQualityAPI.getPollutionSources();
        window.ChartsManager.createSourcesChart('attributionChart', sources);

        const detailsContainer = document.getElementById('attributionDetails');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = '<h3 style="margin-bottom: 1rem;">Source Details</h3>';

        sources.forEach(source => {
            const detail = document.createElement('div');
            detail.style.cssText = 'padding: 1rem; background: var(--glass-bg); border-radius: 0.75rem; margin-bottom: 0.75rem;';
            detail.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <strong>${source.icon} ${source.name}</strong>
                    <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-cyan);">${source.percentage}%</span>
                </div>
                <p style="font-size: 0.875rem; color: var(--text-secondary); margin: 0;">
                    ${this.getSourceDescription(source.name)}
                </p>
            `;
            detailsContainer.appendChild(detail);
        });
    }

    // Get source description
    getSourceDescription(sourceName) {
        const descriptions = {
            'Vehicular Emissions': 'Traffic congestion and vehicle exhaust contribute significantly to PM2.5 and NO2 levels.',
            'Industrial Pollution': 'Factories and industrial activities release particulates and toxic gases.',
            'Construction Dust': 'Construction sites generate large amounts of dust and PM10 particles.',
            'Crop Burning': 'Agricultural burning in neighboring states adds to pollution during certain seasons.',
            'Residential Heating': 'Biomass burning and heating during winter months increases pollution.',
            'Others': 'Miscellaneous sources including waste burning and natural dust.'
        };
        return descriptions[sourceName] || 'Contributing factor to air pollution.';
    }

    // Update comparative analytics
    updateComparativeAnalytics() {
        const locationData = window.AirQualityAPI.getMultiLocationData();
        window.ChartsManager.createComparativeChart('comparativeChart', locationData);

        // Update comparison grid
        const comparisonGrid = document.getElementById('comparisonGrid');
        if (comparisonGrid) {
            comparisonGrid.innerHTML = '';

            locationData.forEach(location => {
                const card = document.createElement('div');
                card.className = 'metric-card';
                card.innerHTML = `
                    <div class="metric-header">
                        <span class="metric-icon">📍</span>
                        <span class="metric-label" style="text-transform: capitalize;">${location.location}</span>
                    </div>
                    <div class="metric-value small" style="color: ${this.getAQIColor(location.aqi)};">
                        ${location.aqi}
                    </div>
                    <div class="metric-status ${location.category.class}">
                        ${location.category.name}
                    </div>
                `;
                comparisonGrid.appendChild(card);
            });
        }
    }

    // Update statistics
    updateStatistics() {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;

        const historicalData = window.AirQualityAPI.generateHistoricalData('month');
        const aqiValues = historicalData.map(d => d.aqi);

        const stats = {
            'Average AQI': Math.round(aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length),
            'Maximum AQI': Math.max(...aqiValues),
            'Minimum AQI': Math.min(...aqiValues),
            'Good Days': aqiValues.filter(v => v <= 50).length,
            'Unhealthy Days': aqiValues.filter(v => v > 150).length,
            'Trend': this.calculateTrend(aqiValues)
        };

        statsGrid.innerHTML = '';

        Object.entries(stats).forEach(([label, value]) => {
            const stat = document.createElement('div');
            stat.className = 'stat-item';
            stat.innerHTML = `
                <div class="stat-value">${value}</div>
                <div class="stat-label">${label}</div>
            `;
            statsGrid.appendChild(stat);
        });
    }

    // Calculate trend
    calculateTrend(values) {
        const recent = values.slice(-7);
        const older = values.slice(-14, -7);
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

        if (recentAvg > olderAvg + 10) return '📈 Worsening';
        if (recentAvg < olderAvg - 10) return '📉 Improving';
        return '➡️ Stable';
    }

    // Setup event listeners
    setupEventListeners() {
        // Pattern selector
        const patternSelect = document.getElementById('patternPeriod');
        if (patternSelect) {
            patternSelect.addEventListener('change', (e) => {
                this.currentPattern = e.target.value;
                this.updatePatternsChart(this.currentPattern);
            });
        }

        // Export buttons
        const exportCurrent = document.getElementById('exportCurrent');
        if (exportCurrent) {
            exportCurrent.addEventListener('click', () => this.exportData('current'));
        }

        const exportHistorical = document.getElementById('exportHistorical');
        if (exportHistorical) {
            exportHistorical.addEventListener('click', () => this.exportData('historical'));
        }

        const generateReport = document.getElementById('generateReport');
        if (generateReport) {
            generateReport.addEventListener('click', () => this.generatePDFReport());
        }
    }

    // Export data to CSV
    exportData(type) {
        let data, filename;

        if (type === 'current') {
            const currentData = window.AirQualityAPI.generateCurrentData();
            const locationData = window.AirQualityAPI.getMultiLocationData();

            let csv = 'Location,AQI,PM2.5,PM10,Temperature,Humidity\n';
            csv += `${currentData.location},${currentData.aqi},${currentData.pm25},${currentData.pm10},${currentData.temperature},${currentData.humidity}\n`;

            locationData.forEach(loc => {
                csv += `${loc.location},${loc.aqi},,,\n`;
            });

            data = csv;
            filename = `air-quality-current-${new Date().toISOString().split('T')[0]}.csv`;
        } else {
            const historicalData = window.AirQualityAPI.generateHistoricalData('month');

            let csv = 'Date,AQI,PM2.5,PM10\n';
            historicalData.forEach(d => {
                const date = new Date(d.date).toISOString().split('T')[0];
                csv += `${date},${d.aqi},${d.pm25},${d.pm10}\n`;
            });

            data = csv;
            filename = `air-quality-historical-${new Date().toISOString().split('T')[0]}.csv`;
        }

        this.downloadFile(data, filename, 'text/csv');
    }

    // Generate PDF report (simulated)
    generatePDFReport() {
        alert('PDF Report Generation\n\nThis feature would generate a comprehensive PDF report including:\n\n• Current air quality metrics\n• 7-day forecast\n• Historical trends\n• Health recommendations\n• Pollution source analysis\n\nIn a production app, this would use a PDF generation library like jsPDF or PDFKit.');
    }

    // Download file helper
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
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

window.AnalyticsManager = new AnalyticsManager();
