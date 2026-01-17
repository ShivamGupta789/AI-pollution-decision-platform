/**
 * Source Visualizer - Creates detailed pollution source visualizations
 * Provides time-based analysis and area comparisons
 */

class SourceVisualizer {
    constructor() {
        this.pollutionEngine = new PollutionEngine();

        // Source metadata for visualization
        this.sourceMetadata = {
            traffic: {
                icon: '🚗',
                color: '#ef4444',
                label: 'Vehicular Emissions',
                description: 'Cars, trucks, and two-wheelers'
            },
            crop_burning: {
                icon: '🌾',
                color: '#f97316',
                label: 'Crop Burning',
                description: 'Agricultural stubble burning'
            },
            industry: {
                icon: '🏭',
                color: '#8b5cf6',
                label: 'Industrial',
                description: 'Factories and industrial zones'
            },
            weather: {
                icon: '🌦️',
                color: '#06b6d4',
                label: 'Weather Factors',
                description: 'Temperature inversion, low wind'
            },
            construction: {
                icon: '🏗️',
                color: '#a3a3a3',
                label: 'Construction',
                description: 'Building activities and dust'
            },
            domestic: {
                icon: '🏠',
                color: '#14b8a6',
                label: 'Domestic',
                description: 'Cooking, heating, waste burning'
            }
        };
    }

    /**
     * Create visualization data for pie/donut chart
     */
    createSourcePieData(sourceContributions) {
        const labels = [];
        const data = [];
        const colors = [];
        const icons = [];

        Object.entries(sourceContributions).forEach(([source, percentage]) => {
            if (percentage > 0) {
                const meta = this.sourceMetadata[source];
                if (meta) {
                    labels.push(meta.label);
                    data.push(percentage);
                    colors.push(meta.color);
                    icons.push(meta.icon);
                }
            }
        });

        return {
            labels,
            datasets: [{
                data,
                backgroundColor: colors,
                borderColor: '#1e293b',
                borderWidth: 2
            }],
            metadata: { icons }
        };
    }

    /**
     * Create time-based source analysis (hourly breakdown)
     */
    createTimeBasedAnalysis(baseData) {
        const hours = [];
        const trafficData = [];
        const industryData = [];
        const cropBurningData = [];
        const weatherData = [];

        // Simulate 24-hour source variation
        for (let hour = 0; hour < 24; hour++) {
            hours.push(`${hour.toString().padStart(2, '0')}:00`);

            // Traffic peaks during rush hours
            let trafficContrib = 25;
            if (hour >= 7 && hour <= 10) trafficContrib = 45;
            else if (hour >= 17 && hour <= 20) trafficContrib = 50;
            else if (hour >= 0 && hour <= 5) trafficContrib = 10;

            // Industry peaks during working hours
            let industryContrib = 20;
            if (hour >= 9 && hour <= 18) industryContrib = 30;
            else if (hour >= 0 && hour <= 6) industryContrib = 10;

            // Crop burning varies by season, peaks evening/night
            let cropContrib = 15;
            if (hour >= 18 || hour <= 2) cropContrib = 25;

            // Weather effects (inversion) worse at night
            let weatherContrib = 20;
            if (hour >= 22 || hour <= 6) weatherContrib = 30;
            else if (hour >= 12 && hour <= 16) weatherContrib = 10;

            // Normalize to 100%
            const total = trafficContrib + industryContrib + cropContrib + weatherContrib;
            trafficData.push(Math.round((trafficContrib / total) * 100));
            industryData.push(Math.round((industryContrib / total) * 100));
            cropBurningData.push(Math.round((cropContrib / total) * 100));
            weatherData.push(Math.round((weatherContrib / total) * 100));
        }

        return {
            labels: hours,
            datasets: [
                {
                    label: this.sourceMetadata.traffic.label,
                    data: trafficData,
                    backgroundColor: this.sourceMetadata.traffic.color + '80',
                    borderColor: this.sourceMetadata.traffic.color,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: this.sourceMetadata.industry.label,
                    data: industryData,
                    backgroundColor: this.sourceMetadata.industry.color + '80',
                    borderColor: this.sourceMetadata.industry.color,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: this.sourceMetadata.crop_burning.label,
                    data: cropBurningData,
                    backgroundColor: this.sourceMetadata.crop_burning.color + '80',
                    borderColor: this.sourceMetadata.crop_burning.color,
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: this.sourceMetadata.weather.label,
                    data: weatherData,
                    backgroundColor: this.sourceMetadata.weather.color + '80',
                    borderColor: this.sourceMetadata.weather.color,
                    borderWidth: 2,
                    fill: true
                }
            ]
        };
    }

    /**
     * Create area comparison data
     */
    createAreaComparison(analysisDataArray) {
        const areas = [];
        const trafficData = [];
        const industryData = [];
        const cropBurningData = [];
        const weatherData = [];

        analysisDataArray.forEach(analysis => {
            areas.push(analysis.area);

            const sources = analysis.sources.contributions;
            trafficData.push(sources.traffic || 0);
            industryData.push(sources.industry || 0);
            cropBurningData.push(sources.crop_burning || 0);
            weatherData.push(sources.weather || 0);
        });

        return {
            labels: areas,
            datasets: [
                {
                    label: this.sourceMetadata.traffic.label,
                    data: trafficData,
                    backgroundColor: this.sourceMetadata.traffic.color,
                    borderColor: this.sourceMetadata.traffic.color,
                    borderWidth: 1
                },
                {
                    label: this.sourceMetadata.industry.label,
                    data: industryData,
                    backgroundColor: this.sourceMetadata.industry.color,
                    borderColor: this.sourceMetadata.industry.color,
                    borderWidth: 1
                },
                {
                    label: this.sourceMetadata.crop_burning.label,
                    data: cropBurningData,
                    backgroundColor: this.sourceMetadata.crop_burning.color,
                    borderColor: this.sourceMetadata.crop_burning.color,
                    borderWidth: 1
                },
                {
                    label: this.sourceMetadata.weather.label,
                    data: weatherData,
                    backgroundColor: this.sourceMetadata.weather.color,
                    borderColor: this.sourceMetadata.weather.color,
                    borderWidth: 1
                }
            ]
        };
    }

    /**
     * Generate source detail cards
     */
    generateSourceCards(sourceContributions, mainCause) {
        const cards = [];

        Object.entries(sourceContributions).forEach(([source, percentage]) => {
            const meta = this.sourceMetadata[source];
            if (!meta) return;

            const isMain = source === mainCause;

            cards.push({
                source,
                icon: meta.icon,
                label: meta.label,
                description: meta.description,
                percentage,
                color: meta.color,
                isMain,
                severity: this.getSourceSeverity(percentage),
                details: this.getSourceDetails(source, percentage)
            });
        });

        // Sort by percentage (highest first)
        cards.sort((a, b) => b.percentage - a.percentage);

        return cards;
    }

    /**
     * Get source severity level
     */
    getSourceSeverity(percentage) {
        if (percentage >= 40) return { level: 'Critical', badge: '🚨' };
        if (percentage >= 30) return { level: 'High', badge: '⚠️' };
        if (percentage >= 20) return { level: 'Moderate', badge: '⚠' };
        return { level: 'Low', badge: '✓' };
    }

    /**
     * Get detailed information about source
     */
    getSourceDetails(source, percentage) {
        const details = {
            traffic: {
                impact: 'Major contributor to PM2.5, NO2, and CO levels',
                solutions: ['Odd-even vehicle scheme', 'Public transport promotion', 'Electric vehicle adoption'],
                peakHours: '7-10 AM and 5-8 PM'
            },
            crop_burning: {
                impact: 'Severe PM2.5 and PM10 spikes, especially Oct-Nov',
                solutions: ['Stubble management incentives', 'Alternative crop residue uses', 'Mechanized solutions'],
                peakHours: 'Evening and night (6 PM - 2 AM)'
            },
            industry: {
                impact: 'Contributes to SO2, NOx, and particulate matter',
                solutions: ['Emission controls', 'Cleaner fuel mandates', 'Relocation of heavy industries'],
                peakHours: 'Business hours (9 AM - 6 PM)'
            },
            weather: {
                impact: 'Temperature inversion traps pollutants near ground',
                solutions: ['Not directly controllable', 'Focus on reducing other sources during adverse weather'],
                peakHours: 'Early morning and late night'
            },
            construction: {
                impact: 'Major source of PM10 and dust',
                solutions: ['Water spraying', 'Covered construction sites', 'Green netting'],
                peakHours: 'Daytime (8 AM - 6 PM)'
            },
            domestic: {
                impact: 'Contributes PM2.5 from cooking and heating',
                solutions: ['Clean cooking fuel', 'Ban on waste burning', 'Heating alternatives'],
                peakHours: 'Morning and evening (6-9 AM, 6-10 PM)'
            }
        };

        return details[source] || {
            impact: 'Contributes to overall pollution',
            solutions: ['Source-specific mitigation needed'],
            peakHours: 'Varies'
        };
    }

    /**
     * Create trend analysis (source changes over days)
     */
    createSourceTrend(historicalData) {
        const dates = [];
        const trafficTrend = [];
        const industryTrend = [];
        const cropBurningTrend = [];
        const weatherTrend = [];

        historicalData.forEach(dayData => {
            dates.push(new Date(dayData.timestamp).toLocaleDateString());
            trafficTrend.push(dayData.sources?.contributions?.traffic || 0);
            industryTrend.push(dayData.sources?.contributions?.industry || 0);
            cropBurningTrend.push(dayData.sources?.contributions?.crop_burning || 0);
            weatherTrend.push(dayData.sources?.contributions?.weather || 0);
        });

        return {
            labels: dates,
            datasets: [
                {
                    label: this.sourceMetadata.traffic.label,
                    data: trafficTrend,
                    borderColor: this.sourceMetadata.traffic.color,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: this.sourceMetadata.industry.label,
                    data: industryTrend,
                    borderColor: this.sourceMetadata.industry.color,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: this.sourceMetadata.crop_burning.label,
                    data: cropBurningTrend,
                    borderColor: this.sourceMetadata.crop_burning.color,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: this.sourceMetadata.weather.label,
                    data: weatherTrend,
                    borderColor: this.sourceMetadata.weather.color,
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        };
    }

    /**
     * Export source analysis as report
     */
    exportSourceReport(analysis) {
        let report = '=== POLLUTION SOURCE ANALYSIS REPORT ===\n\n';
        report += `Area: ${analysis.area}\n`;
        report += `AQI: ${analysis.aqi} (${analysis.category})\n`;
        report += `Timestamp: ${new Date(analysis.timestamp).toLocaleString()}\n\n`;

        report += '--- SOURCE BREAKDOWN ---\n';
        const cards = this.generateSourceCards(analysis.sources.contributions, analysis.sources.mainCause);

        cards.forEach(card => {
            report += `\n${card.icon} ${card.label} (${card.percentage}%)\n`;
            report += `   Severity: ${card.severity.level}\n`;
            report += `   Impact: ${card.details.impact}\n`;
            report += `   Peak Hours: ${card.details.peakHours}\n`;
            if (card.isMain) {
                report += `   ⭐ MAIN POLLUTION CAUSE\n`;
            }
        });

        report += `\n\n--- EXPLANATION ---\n${analysis.sources.explanation}\n`;

        return report;
    }

    /**
     * Get source metadata
     */
    getSourceMetadata(source) {
        return this.sourceMetadata[source] || {
            icon: '❓',
            color: '#gray',
            label: 'Unknown',
            description: 'Unknown source'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SourceVisualizer;
}
