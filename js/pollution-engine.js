/**
 * Pollution Engine - Source Identification and Attribution
 * Analyzes pollution data to identify and attribute sources with explainable reasoning
 */

class PollutionEngine {
    constructor() {
        // Source attribution rules based on pollutant signatures
        this.sourceSignatures = {
            traffic: {
                indicators: ['no2', 'co', 'pm25'],
                peakHours: [7, 8, 9, 18, 19, 20, 21],
                baseContribution: 35
            },
            cropBurning: {
                indicators: ['pm25', 'pm10'],
                months: [10, 11],
                baseContribution: 25
            },
            industrial: {
                indicators: ['so2', 'no2', 'pm10'],
                areaTypes: ['industrial', 'mixed'],
                baseContribution: 20
            },
            meteorological: {
                indicators: ['all'],
                baseContribution: 20
            }
        };
    }

    /**
     * Calculate AQI from pollutant concentrations (India AQI standard)
     */
    calculateAQI(pollution) {
        const breakpoints = {
            pm25: [
                { low: 0, high: 30, aqiLow: 0, aqiHigh: 50 },
                { low: 31, high: 60, aqiLow: 51, aqiHigh: 100 },
                { low: 61, high: 90, aqiLow: 101, aqiHigh: 200 },
                { low: 91, high: 120, aqiLow: 201, aqiHigh: 300 },
                { low: 121, high: 250, aqiLow: 301, aqiHigh: 400 },
                { low: 251, high: 500, aqiLow: 401, aqiHigh: 500 }
            ],
            pm10: [
                { low: 0, high: 50, aqiLow: 0, aqiHigh: 50 },
                { low: 51, high: 100, aqiLow: 51, aqiHigh: 100 },
                { low: 101, high: 250, aqiLow: 101, aqiHigh: 200 },
                { low: 251, high: 350, aqiLow: 201, aqiHigh: 300 },
                { low: 351, high: 430, aqiLow: 301, aqiHigh: 400 },
                { low: 431, high: 600, aqiLow: 401, aqiHigh: 500 }
            ],
            no2: [
                { low: 0, high: 40, aqiLow: 0, aqiHigh: 50 },
                { low: 41, high: 80, aqiLow: 51, aqiHigh: 100 },
                { low: 81, high: 180, aqiLow: 101, aqiHigh: 200 },
                { low: 181, high: 280, aqiLow: 201, aqiHigh: 300 },
                { low: 281, high: 400, aqiLow: 301, aqiHigh: 400 },
                { low: 401, high: 600, aqiLow: 401, aqiHigh: 500 }
            ],
            so2: [
                { low: 0, high: 40, aqiLow: 0, aqiHigh: 50 },
                { low: 41, high: 80, aqiLow: 51, aqiHigh: 100 },
                { low: 81, high: 380, aqiLow: 101, aqiHigh: 200 },
                { low: 381, high: 800, aqiLow: 201, aqiHigh: 300 },
                { low: 801, high: 1600, aqiLow: 301, aqiHigh: 400 },
                { low: 1601, high: 2400, aqiLow: 401, aqiHigh: 500 }
            ],
            co: [
                { low: 0, high: 1.0, aqiLow: 0, aqiHigh: 50 },
                { low: 1.1, high: 2.0, aqiLow: 51, aqiHigh: 100 },
                { low: 2.1, high: 10, aqiLow: 101, aqiHigh: 200 },
                { low: 10.1, high: 17, aqiLow: 201, aqiHigh: 300 },
                { low: 17.1, high: 34, aqiLow: 301, aqiHigh: 400 },
                { low: 34.1, high: 50, aqiLow: 401, aqiHigh: 500 }
            ]
        };

        const calculateSubIndex = (pollutant, concentration) => {
            const bps = breakpoints[pollutant];
            if (!bps) return 0;

            for (const bp of bps) {
                if (concentration >= bp.low && concentration <= bp.high) {
                    const aqi = ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) *
                        (concentration - bp.low) + bp.aqiLow;
                    return Math.round(aqi);
                }
            }
            // If concentration exceeds all breakpoints, return max AQI
            return 500;
        };

        const subIndices = {
            pm25: calculateSubIndex('pm25', pollution.pm25),
            pm10: calculateSubIndex('pm10', pollution.pm10),
            no2: calculateSubIndex('no2', pollution.no2),
            so2: calculateSubIndex('so2', pollution.so2),
            co: calculateSubIndex('co', pollution.co)
        };

        // AQI is the maximum of all sub-indices
        const aqi = Math.max(...Object.values(subIndices));

        // Determine prominent pollutant
        const prominentPollutant = Object.entries(subIndices)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        return {
            aqi,
            category: this.getAQICategory(aqi),
            subIndices,
            prominentPollutant
        };
    }

    /**
     * Get AQI category
     */
    getAQICategory(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 200) return 'Poor';
        if (aqi <= 300) return 'Very Poor';
        if (aqi <= 400) return 'Severe';
        return 'Hazardous';
    }

    /**
     * Identify pollution sources with attribution percentages
     */
    identifySources(data) {
        const { pollution, weather, timestamp, area } = data;
        const date = new Date(timestamp);
        const hour = date.getHours();
        const month = date.getMonth() + 1;

        let contributions = {
            traffic: 0,
            cropBurning: 0,
            industrial: 0,
            meteorological: 0
        };

        // Traffic contribution analysis
        let trafficScore = this.sourceSignatures.traffic.baseContribution;

        // High NO2 and CO indicate traffic
        if (pollution.no2 > 60) trafficScore += 10;
        if (pollution.co > 1.5) trafficScore += 10;

        // Peak hours increase traffic contribution
        if (this.sourceSignatures.traffic.peakHours.includes(hour)) {
            trafficScore += 15;
        }

        // Area type affects traffic contribution
        if (area && (area.trafficLevel === 'very_high' || area.trafficLevel === 'high')) {
            trafficScore += 10;
        }

        contributions.traffic = Math.min(trafficScore, 50);

        // Crop burning contribution (seasonal)
        if (this.sourceSignatures.cropBurning.months.includes(month)) {
            let cropScore = this.sourceSignatures.cropBurning.baseContribution;

            // High PM2.5 and PM10 indicate biomass burning
            if (pollution.pm25 > 150) cropScore += 15;
            if (pollution.pm10 > 250) cropScore += 10;

            contributions.cropBurning = Math.min(cropScore, 40);
        }

        // Industrial contribution
        let industrialScore = this.sourceSignatures.industrial.baseContribution;

        // High SO2 indicates industrial emissions
        if (pollution.so2 > 20) industrialScore += 15;

        // Industrial areas have higher contribution
        if (area && (area.industrial === 'very_high' || area.industrial === 'high')) {
            industrialScore += 15;
        }

        contributions.industrial = Math.min(industrialScore, 40);

        // Meteorological contribution
        let meteoScore = this.sourceSignatures.meteorological.baseContribution;

        // Low wind speed traps pollution
        if (weather.windSpeed < 3) meteoScore += 10;

        // Inversion layer
        if (weather.hasInversion) meteoScore += 15;

        // Low humidity
        if (weather.humidity < 40) meteoScore += 5;

        contributions.meteorological = Math.min(meteoScore, 35);

        // Normalize to 100%
        const total = Object.values(contributions).reduce((a, b) => a + b, 0);
        Object.keys(contributions).forEach(key => {
            contributions[key] = Math.round((contributions[key] / total) * 100);
        });

        // Ensure total is exactly 100% (adjust largest contributor if needed)
        const normalizedTotal = Object.values(contributions).reduce((a, b) => a + b, 0);
        if (normalizedTotal !== 100) {
            const maxKey = Object.entries(contributions)
                .reduce((a, b) => a[1] > b[1] ? a : b)[0];
            contributions[maxKey] += (100 - normalizedTotal);
        }

        // Determine main cause
        const mainCause = Object.entries(contributions)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        // Generate explanation
        const explanation = this.generateExplanation(contributions, mainCause, {
            hour,
            month,
            weather,
            pollution,
            area
        });

        return {
            contributions,
            mainCause,
            explanation
        };
    }

    /**
     * Generate human-readable explanation
     */
    generateExplanation(contributions, mainCause, context) {
        const { hour, month, weather, pollution, area } = context;

        let explanation = '';

        switch (mainCause) {
            case 'traffic':
                explanation = `Vehicular emissions are the primary contributor (${contributions.traffic}%). `;
                if ([7, 8, 9, 18, 19, 20, 21].includes(hour)) {
                    explanation += `This is rush hour (${hour}:00), when traffic density peaks. `;
                }
                if (pollution.no2 > 60) {
                    explanation += `High NO₂ levels (${pollution.no2} µg/m³) confirm heavy traffic activity. `;
                }
                break;

            case 'cropBurning':
                explanation = `Crop residue burning is the dominant source (${contributions.cropBurning}%). `;
                if ([10, 11].includes(month)) {
                    explanation += `This is the post-harvest season when farmers burn stubble in neighboring states. `;
                }
                if (pollution.pm25 > 150) {
                    explanation += `Extremely high PM2.5 (${pollution.pm25} µg/m³) indicates biomass smoke. `;
                }
                break;

            case 'industrial':
                explanation = `Industrial emissions dominate (${contributions.industrial}%). `;
                if (area && area.industrial === 'very_high') {
                    explanation += `${area.name} is an industrial zone with heavy manufacturing activity. `;
                }
                if (pollution.so2 > 20) {
                    explanation += `Elevated SO₂ levels (${pollution.so2} µg/m³) point to industrial sources. `;
                }
                break;

            case 'meteorological':
                explanation = `Weather conditions are trapping pollutants (${contributions.meteorological}%). `;
                if (weather.windSpeed < 3) {
                    explanation += `Low wind speed (${weather.windSpeed.toFixed(1)} km/h) prevents dispersion. `;
                }
                if (weather.hasInversion) {
                    explanation += `Temperature inversion is creating a pollution lid. `;
                }
                break;
        }

        // Add secondary contributors
        const secondary = Object.entries(contributions)
            .filter(([key, val]) => key !== mainCause && val > 15)
            .sort((a, b) => b[1] - a[1]);

        if (secondary.length > 0) {
            explanation += `Secondary contributors: `;
            explanation += secondary.map(([key, val]) =>
                `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} (${val}%)`
            ).join(', ') + '.';
        }

        return explanation;
    }

    /**
     * Analyze pollution data for an area
     */
    analyze(data) {
        const aqiData = this.calculateAQI(data.pollution);
        const sourceData = this.identifySources(data);

        return {
            area: data.area,
            areaId: data.areaId,
            timestamp: data.timestamp,
            aqi: aqiData.aqi,
            category: aqiData.category,
            prominentPollutant: aqiData.prominentPollutant,
            pollution: data.pollution,
            weather: data.weather,
            sources: sourceData.contributions,
            mainCause: sourceData.mainCause,
            explanation: sourceData.explanation,
            subIndices: aqiData.subIndices
        };
    }

    /**
     * Analyze multiple areas
     */
    analyzeMultiple(dataArray) {
        return dataArray.map(data => this.analyze(data));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PollutionEngine;
}
