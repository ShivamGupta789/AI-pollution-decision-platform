/**
 * Visualizations - Chart.js based data visualizations
 * Creates interactive charts and graphs for pollution data
 */

class Visualizations {
    constructor() {
        this.charts = {};
        this.chartColors = {
            good: '#00e400',
            moderate: '#ffff00',
            poor: '#ff7e00',
            veryPoor: '#ff0000',
            severe: '#8f3f97',
            hazardous: '#7e0023',
            primary: '#667eea',
            secondary: '#764ba2'
        };
    }

    /**
     * Get color for AQI value
     */
    getAQIColor(aqi) {
        if (aqi <= 50) return this.chartColors.good;
        if (aqi <= 100) return this.chartColors.moderate;
        if (aqi <= 200) return this.chartColors.poor;
        if (aqi <= 300) return this.chartColors.veryPoor;
        if (aqi <= 400) return this.chartColors.severe;
        return this.chartColors.hazardous;
    }

    /**
     * Create source breakdown pie chart
     */
    createSourceChart(canvasId, sources) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = Object.keys(sources).map(key => {
            const names = {
                traffic: 'Traffic',
                cropBurning: 'Crop Burning',
                industrial: 'Industrial',
                meteorological: 'Weather'
            };
            return names[key] || key;
        });

        const data = Object.values(sources);
        const colors = ['#4c9aff', '#9d5cff', '#ff7e00', '#00d4ff'];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: '#0a0e27',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create forecast line chart
     */
    createForecastChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = ['Now', '24h', '48h', '72h'];
        const data = [
            forecastData.current.aqi,
            forecastData.forecasts['24h'].aqi,
            forecastData.forecasts['48h'].aqi,
            forecastData.forecasts['72h'].aqi
        ];

        const colors = data.map(aqi => this.getAQIColor(aqi));

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'AQI Forecast',
                    data,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: colors,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return 'AQI: ' + context.parsed.y;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    }
                }
            }
        });
    }

    /**
     * Create area comparison bar chart
     */
    createAreaComparisonChart(canvasId, areasData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        // Sort by AQI descending
        const sorted = [...areasData].sort((a, b) => b.aqi - a.aqi);

        const labels = sorted.map(area => area.area);
        const data = sorted.map(area => area.aqi);
        const colors = data.map(aqi => this.getAQIColor(aqi));

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'AQI by Area',
                    data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const category = context.raw <= 50 ? 'Good' :
                                    context.raw <= 100 ? 'Moderate' :
                                        context.raw <= 200 ? 'Poor' :
                                            context.raw <= 300 ? 'Very Poor' :
                                                context.raw <= 400 ? 'Severe' : 'Hazardous';
                                return 'AQI: ' + context.parsed.x + ' (' + category + ')';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff'
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Create pollutant breakdown chart
     */
    createPollutantChart(canvasId, pollution) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = ['PM2.5', 'PM10', 'NO₂', 'SO₂', 'CO'];
        const data = [
            pollution.pm25,
            pollution.pm10,
            pollution.no2,
            pollution.so2,
            pollution.co * 100 // Scale CO for visibility
        ];

        this.charts[canvasId] = new Chart(ctx, {
            type: 'radar',
            data: {
                labels,
                datasets: [{
                    label: 'Pollutant Levels',
                    data,
                    backgroundColor: 'rgba(157, 92, 255, 0.2)',
                    borderColor: '#9d5cff',
                    borderWidth: 2,
                    pointBackgroundColor: '#9d5cff',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            backdropColor: 'transparent'
                        },
                        pointLabels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Destroy all charts
     */
    destroyAll() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    /**
     * Destroy specific chart
     */
    destroy(canvasId) {
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
            delete this.charts[canvasId];
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Visualizations;
}
