/**
 * AQI Forecaster - Predicts future AQI levels
 * Uses historical trends, weather patterns, and seasonal factors
 */

class AQIForecaster {
    constructor() {
        this.pollutionEngine = new PollutionEngine();
    }

    /**
     * Analyze historical trend
     */
    analyzeTrend(historicalData) {
        if (historicalData.length < 2) {
            return { direction: 'stable', slope: 0 };
        }

        // Calculate linear regression slope
        const n = historicalData.length;
        const xValues = Array.from({ length: n }, (_, i) => i);
        const yValues = historicalData.map(d => d.aqi);

        const xMean = xValues.reduce((a, b) => a + b, 0) / n;
        const yMean = yValues.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < n; i++) {
            numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
            denominator += Math.pow(xValues[i] - xMean, 2);
        }

        const slope = denominator !== 0 ? numerator / denominator : 0;

        let direction = 'stable';
        if (slope > 5) direction = 'increasing';
        else if (slope < -5) direction = 'improving';

        return { direction, slope };
    }

    /**
     * Calculate confidence level
     */
    calculateConfidence(weather, dataQuality, seasonalStability) {
        let confidence = 70; // Base confidence

        // Weather stability affects confidence
        if (weather.windSpeed > 5 && weather.windSpeed < 15) {
            confidence += 10; // Moderate wind is predictable
        } else if (weather.windSpeed < 2) {
            confidence -= 10; // Very low wind is unpredictable
        }

        // Seasonal stability
        if (seasonalStability === 'high') {
            confidence += 15;
        } else if (seasonalStability === 'low') {
            confidence -= 15;
        }

        // Data quality
        confidence += dataQuality * 5;

        confidence = Math.max(30, Math.min(95, confidence));

        if (confidence >= 75) return 'high';
        if (confidence >= 55) return 'medium';
        return 'low';
    }

    /**
     * Predict future pollution levels
     */
    predictPollution(currentPollution, weather, hours, trend) {
        const predicted = { ...currentPollution };

        // Apply trend
        const trendFactor = 1 + (trend.slope * hours / 100);

        // Weather impact on future
        let weatherFactor = 1.0;

        // Wind speed forecast (assume gradual change)
        const futureWindSpeed = weather.windSpeed + (Math.random() - 0.5) * 2;
        if (futureWindSpeed < 3) {
            weatherFactor *= 1.2; // Low wind accumulates pollution
        } else if (futureWindSpeed > 10) {
            weatherFactor *= 0.8; // High wind disperses pollution
        }

        // Apply factors
        Object.keys(predicted).forEach(pollutant => {
            predicted[pollutant] = Math.round(
                predicted[pollutant] * trendFactor * weatherFactor *
                (1 + (Math.random() - 0.5) * 0.2) // Random variation
            );
            predicted[pollutant] = Math.max(0, predicted[pollutant]);
        });

        return predicted;
    }

    /**
     * Forecast AQI for multiple time horizons
     */
    forecast(currentData, historicalData = []) {
        const current = this.pollutionEngine.analyze(currentData);

        // Analyze trend from historical data
        const trend = this.analyzeTrend(historicalData);

        // Determine seasonal stability
        const month = new Date(currentData.timestamp).getMonth() + 1;
        let seasonalStability = 'medium';
        if ([11, 12, 1, 2].includes(month)) {
            seasonalStability = 'low'; // Winter is unpredictable
        } else if ([7, 8, 9].includes(month)) {
            seasonalStability = 'high'; // Monsoon is more stable
        }

        // Calculate confidence
        const confidence = this.calculateConfidence(
            currentData.weather,
            historicalData.length > 24 ? 3 : 1,
            seasonalStability
        );

        // Predict for 24, 48, 72 hours
        const forecasts = {};

        [24, 48, 72].forEach(hours => {
            const predictedPollution = this.predictPollution(
                currentData.pollution,
                currentData.weather,
                hours,
                trend
            );

            const predictedAQI = this.pollutionEngine.calculateAQI(predictedPollution);

            forecasts[`${hours}h`] = {
                hours,
                aqi: predictedAQI.aqi,
                category: predictedAQI.category,
                pollution: predictedPollution,
                prominentPollutant: predictedAQI.prominentPollutant
            };
        });

        return {
            current: {
                aqi: current.aqi,
                category: current.category,
                timestamp: current.timestamp
            },
            forecasts,
            trend: trend.direction,
            confidence,
            explanation: this.generateForecastExplanation(forecasts, trend, confidence)
        };
    }

    /**
     * Generate forecast explanation
     */
    generateForecastExplanation(forecasts, trend, confidence) {
        const f24 = forecasts['24h'];
        const f72 = forecasts['72h'];

        let explanation = `AQI is expected to ${trend.direction === 'increasing' ? 'worsen' :
            trend.direction === 'improving' ? 'improve' : 'remain stable'} `;
        explanation += `over the next 72 hours. `;

        if (f24.aqi > f72.aqi) {
            explanation += `Short-term spike expected in 24 hours (${f24.category}), `;
            explanation += `followed by gradual improvement to ${f72.category}. `;
        } else if (f24.aqi < f72.aqi) {
            explanation += `Conditions will deteriorate from ${f24.category} to ${f72.category}. `;
        } else {
            explanation += `Levels will remain in the ${f24.category} range. `;
        }

        explanation += `Forecast confidence: ${confidence}.`;

        return explanation;
    }

    /**
     * Forecast for multiple areas
     */
    forecastMultiple(currentDataArray, historicalDataMap = {}) {
        return currentDataArray.map(data => {
            const historical = historicalDataMap[data.areaId] || [];
            return {
                area: data.area,
                areaId: data.areaId,
                ...this.forecast(data, historical)
            };
        });
    }

    /**
     * Identify short-term spikes
     */
    identifySpikes(forecastData) {
        const spikes = [];

        Object.entries(forecastData.forecasts).forEach(([timeKey, forecast]) => {
            if (forecast.aqi > 300) {
                spikes.push({
                    time: timeKey,
                    aqi: forecast.aqi,
                    category: forecast.category,
                    severity: forecast.aqi > 400 ? 'severe' : 'high'
                });
            }
        });

        return spikes;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AQIForecaster;
}
