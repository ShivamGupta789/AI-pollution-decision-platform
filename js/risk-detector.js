/**
 * Risk Detector - Identifies high-risk areas and peak pollution times
 * Provides actionable recommendations for authorities and citizens
 */

class RiskDetector {
    constructor() {
        this.pollutionEngine = new PollutionEngine();

        // Risk thresholds
        this.thresholds = {
            high: 200,
            severe: 300,
            hazardous: 400
        };
    }

    /**
     * Identify pollution hotspots
     */
    identifyHotspots(analysisDataArray) {
        // Filter areas with high pollution
        const hotspots = analysisDataArray
            .filter(data => data.aqi >= this.thresholds.high)
            .sort((a, b) => b.aqi - a.aqi);

        return hotspots.map(data => ({
            area: data.area,
            areaId: data.areaId,
            aqi: data.aqi,
            category: data.category,
            riskLevel: this.getRiskLevel(data.aqi),
            mainCause: data.mainCause,
            prominentPollutant: data.prominentPollutant,
            timestamp: data.timestamp
        }));
    }

    /**
     * Get risk level
     */
    getRiskLevel(aqi) {
        if (aqi >= this.thresholds.hazardous) return 'hazardous';
        if (aqi >= this.thresholds.severe) return 'severe';
        if (aqi >= this.thresholds.high) return 'high';
        return 'moderate';
    }

    /**
     * Detect peak pollution hours from historical data
     */
    detectPeakHours(historicalData) {
        // Group data by hour
        const hourlyData = {};

        historicalData.forEach(dataPoint => {
            dataPoint.areas.forEach(areaData => {
                const hour = new Date(areaData.timestamp).getHours();

                if (!hourlyData[hour]) {
                    hourlyData[hour] = [];
                }

                const analysis = this.pollutionEngine.analyze(areaData);
                hourlyData[hour].push(analysis.aqi);
            });
        });

        // Calculate average AQI for each hour
        const hourlyAverages = Object.keys(hourlyData).map(hour => ({
            hour: parseInt(hour),
            averageAQI: hourlyData[hour].reduce((a, b) => a + b, 0) / hourlyData[hour].length,
            samples: hourlyData[hour].length
        }));

        // Sort by AQI
        hourlyAverages.sort((a, b) => b.averageAQI - a.averageAQI);

        // Identify peak hours (top hours with AQI > threshold)
        const peakHours = hourlyAverages
            .filter(h => h.averageAQI >= this.thresholds.high)
            .slice(0, 5);

        return {
            peakHours: peakHours.map(h => ({
                hour: h.hour,
                timeRange: `${h.hour}:00 - ${h.hour + 1}:00`,
                averageAQI: Math.round(h.averageAQI)
            })),
            safestHours: hourlyAverages.slice(-3).reverse().map(h => ({
                hour: h.hour,
                timeRange: `${h.hour}:00 - ${h.hour + 1}:00`,
                averageAQI: Math.round(h.averageAQI)
            }))
        };
    }

    /**
     * Analyze spatial patterns
     */
    analyzeSpatialPatterns(analysisDataArray) {
        // Group by area type if available
        const byType = {};

        analysisDataArray.forEach(data => {
            const type = data.area.type || 'unknown';
            if (!byType[type]) {
                byType[type] = [];
            }
            byType[type].push(data.aqi);
        });

        const patterns = Object.keys(byType).map(type => ({
            areaType: type,
            averageAQI: Math.round(byType[type].reduce((a, b) => a + b, 0) / byType[type].length),
            maxAQI: Math.max(...byType[type]),
            minAQI: Math.min(...byType[type]),
            count: byType[type].length
        }));

        patterns.sort((a, b) => b.averageAQI - a.averageAQI);

        return patterns;
    }

    /**
     * Generate recommendations for authorities
     */
    getAuthorityRecommendations(hotspots, peakHours) {
        const recommendations = [];

        // Hotspot-based recommendations
        if (hotspots.length > 0) {
            const topHotspot = hotspots[0];

            if (topHotspot.riskLevel === 'hazardous') {
                recommendations.push({
                    priority: 'critical',
                    action: 'Declare public health emergency',
                    area: topHotspot.area,
                    details: `AQI ${topHotspot.aqi} in ${topHotspot.area}. Immediate intervention required.`
                });
                recommendations.push({
                    priority: 'critical',
                    action: 'Close schools and non-essential offices',
                    area: topHotspot.area,
                    details: 'Protect vulnerable populations from hazardous air quality.'
                });
            } else if (topHotspot.riskLevel === 'severe') {
                recommendations.push({
                    priority: 'high',
                    action: 'Implement emergency pollution control measures',
                    area: topHotspot.area,
                    details: `AQI ${topHotspot.aqi}. Consider odd-even rule, construction ban.`
                });
            }

            // Source-specific recommendations
            hotspots.forEach(hotspot => {
                if (hotspot.mainCause === 'traffic') {
                    recommendations.push({
                        priority: 'high',
                        action: 'Implement traffic restrictions',
                        area: hotspot.area,
                        details: 'Traffic is the main contributor. Consider odd-even rule or congestion pricing.'
                    });
                } else if (hotspot.mainCause === 'industrial') {
                    recommendations.push({
                        priority: 'high',
                        action: 'Enforce industrial emission controls',
                        area: hotspot.area,
                        details: 'Industrial emissions are dominant. Inspect and penalize violators.'
                    });
                } else if (hotspot.mainCause === 'cropBurning') {
                    recommendations.push({
                        priority: 'medium',
                        action: 'Coordinate with neighboring states on crop burning',
                        area: 'Regional',
                        details: 'Provide subsidies for alternative stubble management.'
                    });
                }
            });
        }

        // Peak hour recommendations
        if (peakHours && peakHours.peakHours.length > 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Implement time-based traffic management',
                area: 'All areas',
                details: `Peak pollution hours: ${peakHours.peakHours.map(h => h.timeRange).join(', ')}. Stagger office timings.`
            });
        }

        // General recommendations
        recommendations.push({
            priority: 'medium',
            action: 'Increase public transport frequency',
            area: 'All areas',
            details: 'Encourage shift from private vehicles to public transport.'
        });

        recommendations.push({
            priority: 'low',
            action: 'Deploy water sprinklers on major roads',
            area: 'High traffic areas',
            details: 'Reduce dust and particulate matter.'
        });

        return recommendations;
    }

    /**
     * Generate recommendations for citizens
     */
    getCitizenRecommendations(currentAQI, category, peakHours) {
        const recommendations = [];

        // AQI-based recommendations
        if (currentAQI >= this.thresholds.hazardous) {
            recommendations.push({
                priority: 'critical',
                action: 'Stay indoors',
                details: 'Hazardous air quality. Avoid all outdoor activities.'
            });
            recommendations.push({
                priority: 'critical',
                action: 'Use N95 masks',
                details: 'Wear N95/N99 masks if you must go outside.'
            });
            recommendations.push({
                priority: 'critical',
                action: 'Use air purifiers',
                details: 'Keep air purifiers running on high setting.'
            });
        } else if (currentAQI >= this.thresholds.severe) {
            recommendations.push({
                priority: 'high',
                action: 'Minimize outdoor exposure',
                details: 'Limit time spent outdoors. Reschedule non-essential activities.'
            });
            recommendations.push({
                priority: 'high',
                action: 'Wear masks outdoors',
                details: 'Use N95 masks when going outside.'
            });
        } else if (currentAQI >= this.thresholds.high) {
            recommendations.push({
                priority: 'medium',
                action: 'Limit prolonged outdoor activities',
                details: 'Avoid heavy exercise outdoors. Take frequent breaks.'
            });
            recommendations.push({
                priority: 'medium',
                action: 'Close windows during peak hours',
                details: 'Keep windows closed when pollution is highest.'
            });
        }

        // Peak hour recommendations
        if (peakHours && peakHours.peakHours.length > 0) {
            recommendations.push({
                priority: 'medium',
                action: 'Avoid peak pollution hours',
                details: `Highest pollution: ${peakHours.peakHours.map(h => h.timeRange).join(', ')}`
            });
        }

        // General recommendations
        recommendations.push({
            priority: 'low',
            action: 'Use public transport',
            details: 'Reduce personal vehicle usage to lower emissions.'
        });

        recommendations.push({
            priority: 'low',
            action: 'Monitor air quality regularly',
            details: 'Check AQI updates before planning outdoor activities.'
        });

        return recommendations;
    }

    /**
     * Comprehensive risk analysis
     */
    analyzeRisk(currentDataArray, historicalData = []) {
        // Analyze current data
        const analysisData = currentDataArray.map(data =>
            this.pollutionEngine.analyze(data)
        );

        // Identify hotspots
        const hotspots = this.identifyHotspots(analysisData);

        // Detect peak hours
        const peakHours = historicalData.length > 0
            ? this.detectPeakHours(historicalData)
            : null;

        // Spatial patterns
        const spatialPatterns = this.analyzeSpatialPatterns(analysisData);

        // Generate recommendations
        const authorityRecommendations = this.getAuthorityRecommendations(hotspots, peakHours);

        // Get overall AQI for citizen recommendations
        const avgAQI = Math.round(
            analysisData.reduce((sum, d) => sum + d.aqi, 0) / analysisData.length
        );
        const citizenRecommendations = this.getCitizenRecommendations(
            avgAQI,
            this.pollutionEngine.getAQICategory(avgAQI),
            peakHours
        );

        return {
            hotspots,
            peakHours,
            spatialPatterns,
            recommendations: {
                forAuthorities: authorityRecommendations,
                forCitizens: citizenRecommendations
            },
            summary: {
                totalAreas: analysisData.length,
                highRiskAreas: hotspots.length,
                averageAQI: avgAQI,
                worstArea: hotspots.length > 0 ? hotspots[0] : null
            }
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RiskDetector;
}
