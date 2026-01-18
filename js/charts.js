// Charts Module - Handles all chart visualizations
class ChartsManager {
    constructor() {
        this.charts = {};
        this.chartColors = {
            primary: '#00d4ff',
            purple: '#a855f7',
            green: '#10b981',
            yellow: '#fbbf24',
            orange: '#f97316',
            red: '#ef4444'
        };
    }

    // Create historical trends chart
    createHistoricalChart(canvasId, data, period) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        // Destroy existing chart
        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = data.map(d => {
            const date = new Date(d.date);
            if (period === 'year') {
                return date.toLocaleDateString('en-US', { month: 'short' });
            }
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AQI',
                    data: data.map(d => d.aqi),
                    borderColor: this.chartColors.primary,
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#4a5568'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#4a5568'
                        }
                    }
                }
            }
        });
    }

    // Create forecast chart
    createForecastChart(canvasId, forecastData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        // Determine if this is hourly or daily data
        const isHourly = forecastData[0] && forecastData[0].hour !== undefined && forecastData[0].hour !== null;

        // Generate appropriate labels
        const labels = forecastData.map(d => {
            if (isHourly) {
                // Hourly: show hour
                const date = new Date(d.time);
                return date.getHours() + ':00';
            } else {
                // Daily: show day or date
                return d.day || d.date || new Date(d.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        });

        const data = forecastData.map(d => d.aqi);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Forecasted AQI',
                    data: data,
                    borderColor: this.chartColors.purple,
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                        min: 0,
                        max: 1000,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            color: '#4a5568',
                            stepSize: 100
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#4a5568',
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                }
            }
        });
    }

    // Create pollution sources chart
    createSourcesChart(canvasId, sources) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: sources.map(s => s.name),
                datasets: [{
                    data: sources.map(s => s.percentage),
                    backgroundColor: [
                        this.chartColors.primary,
                        this.chartColors.purple,
                        this.chartColors.orange,
                        this.chartColors.red,
                        this.chartColors.yellow,
                        this.chartColors.green
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 25, // Increased padding
                            font: {
                                size: 18 // Increased size (1.5x of 12)
                            },
                            color: '#4a5568',
                            boxWidth: 20 // Slightly larger box
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

    // Create comparative analytics chart
    createComparativeChart(canvasId, locationData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        const labels = locationData.map(d => d.location.charAt(0).toUpperCase() + d.location.slice(1));
        const data = locationData.map(d => d.aqi);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Current AQI',
                    data: data,
                    backgroundColor: data.map(aqi => {
                        if (aqi <= 50) return this.chartColors.green;
                        if (aqi <= 100) return this.chartColors.yellow;
                        if (aqi <= 150) return this.chartColors.orange;
                        if (aqi <= 200) return this.chartColors.red;
                        return this.chartColors.purple;
                    }),
                    borderRadius: 8,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Create patterns chart
    createPatternsChart(canvasId, patternType = 'daily') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.charts[canvasId]) {
            this.charts[canvasId].destroy();
        }

        let labels, data;

        if (patternType === 'daily') {
            labels = Array.from({ length: 24 }, (_, i) => i + ':00');
            data = labels.map((_, i) => {
                // Peak hours: morning 7-10, evening 6-9
                if ((i >= 7 && i <= 10) || (i >= 18 && i <= 21)) {
                    return 150 + Math.random() * 100;
                }
                return 80 + Math.random() * 60;
            });
        } else if (patternType === 'weekly') {
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data = labels.map(() => 100 + Math.random() * 100);
        } else if (patternType === 'monthly') {
            labels = Array.from({ length: 30 }, (_, i) => 'Day ' + (i + 1));
            data = labels.map(() => 100 + Math.random() * 120);
        } else {
            labels = ['Winter', 'Spring', 'Summer', 'Monsoon', 'Autumn'];
            data = [250, 120, 90, 70, 150]; // Seasonal patterns
        }

        this.charts[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Average AQI',
                    data: data,
                    backgroundColor: this.chartColors.primary,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

window.ChartsManager = new ChartsManager();
