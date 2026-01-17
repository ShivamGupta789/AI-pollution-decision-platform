/**
 * Route Optimizer - Suggests safer travel routes based on AQI levels
 * Calculates exposure index and recommends alternative routes
 */

class RouteOptimizer {
    constructor() {
        this.pollutionEngine = new PollutionEngine();

        // Major routes/corridors in Delhi NCR with their passing areas
        this.routes = {
            route1: {
                name: 'NH-48 (Delhi-Gurgaon)',
                areas: ['Central Delhi', 'RK Puram', 'Gurugram'],
                type: 'highway',
                distance: 28
            },
            route2: {
                name: 'Ring Road',
                areas: ['Central Delhi', 'ITO', 'Anand Vihar'],
                type: 'expressway',
                distance: 35
            },
            route3: {
                name: 'Noida-Delhi Link',
                areas: ['Noida', 'Anand Vihar', 'Central Delhi'],
                type: 'expressway',
                distance: 22
            },
            route4: {
                name: 'Dwarka-Airport Route',
                areas: ['Dwarka', 'Punjabi Bagh', 'Central Delhi'],
                type: 'arterial',
                distance: 18
            },
            route5: {
                name: 'Outer Ring Road',
                areas: ['Rohini', 'Mundka', 'Dwarka', 'Najafgarh'],
                type: 'highway',
                distance: 45
            },
            route6: {
                name: 'Ghaziabad-Delhi Route',
                areas: ['Ghaziabad', 'Anand Vihar', 'ITO'],
                type: 'highway',
                distance: 25
            }
        };
    }

    /**
     * Calculate exposure index for a route
     * Considers duration, AQI levels, and pollutant concentrations
     */
    calculateExposure(route, aqiData, travelTime) {
        let totalExposure = 0;
        let segmentCount = route.areas.length;

        route.areas.forEach(areaName => {
            const areaData = aqiData.find(d => d.area === areaName);
            if (areaData) {
                // Exposure = AQI × time × sensitivity factor
                const segmentTime = travelTime / segmentCount;
                const exposure = areaData.aqi * segmentTime;
                totalExposure += exposure;
            }
        });

        return {
            totalExposure: Math.round(totalExposure),
            averageAQI: Math.round(totalExposure / (travelTime || 1)),
            riskLevel: this.getExposureRisk(totalExposure / (travelTime || 1))
        };
    }

    /**
     * Get exposure risk level
     */
    getExposureRisk(avgAQI) {
        if (avgAQI < 50) return { level: 'Low', color: '#22c55e', icon: '✓' };
        if (avgAQI < 100) return { level: 'Moderate', color: '#eab308', icon: '⚠' };
        if (avgAQI < 150) return { level: 'High', color: '#f97316', icon: '⚠️' };
        if (avgAQI < 200) return { level: 'Very High', color: '#ef4444', icon: '🚨' };
        return { level: 'Extreme', color: '#991b1b', icon: '☢️' };
    }

    /**
     * Find safer alternative routes
     */
    findSaferRoutes(origin, destination, currentAQIData) {
        const allRoutes = Object.entries(this.routes).map(([key, route]) => {
            // Estimate travel time based on distance and route type
            const speedMap = { highway: 60, expressway: 50, arterial: 35 };
            const avgSpeed = speedMap[route.type] || 40;
            const travelTime = (route.distance / avgSpeed) * 60; // in minutes

            const exposure = this.calculateExposure(route, currentAQIData, travelTime);

            return {
                id: key,
                ...route,
                travelTime: Math.round(travelTime),
                exposure: exposure.totalExposure,
                averageAQI: exposure.averageAQI,
                riskLevel: exposure.riskLevel,
                recommendation: this.generateRouteRecommendation(exposure.riskLevel, travelTime)
            };
        });

        // Sort by exposure (safest first)
        allRoutes.sort((a, b) => a.exposure - b.exposure);

        return {
            safest: allRoutes[0],
            alternatives: allRoutes.slice(1, 4),
            allRoutes
        };
    }

    /**
     * Generate route recommendation
     */
    generateRouteRecommendation(riskLevel, travelTime) {
        const recommendations = {
            'Low': `✅ Safe route. Air quality is good along this path.`,
            'Moderate': `⚠️ Acceptable route. Consider wearing a mask if you're sensitive to pollution.`,
            'High': `⚠️ Not recommended. High pollution exposure expected. Use AC in car, keep windows closed.`,
            'Very High': `🚨 Avoid if possible. Very poor air quality. Wear N95 mask if travel is essential.`,
            'Extreme': `☢️ Highly discouraged. Hazardous pollution levels. Postpone travel if possible.`
        };

        return recommendations[riskLevel.level] || 'Route analysis unavailable.';
    }

    /**
     * Get best travel time recommendations
     */
    getBestTravelTimes(forecastData) {
        const hourlyData = [];

        // Simulate hourly data for next 24 hours
        for (let hour = 0; hour < 24; hour++) {
            const baseAQI = forecastData.current.aqi;
            // Typical pollution patterns: higher during rush hours
            let hourFactor = 1.0;

            if (hour >= 7 && hour <= 10) hourFactor = 1.3; // Morning rush
            else if (hour >= 17 && hour <= 20) hourFactor = 1.4; // Evening rush
            else if (hour >= 0 && hour <= 5) hourFactor = 0.8; // Early morning

            const hourAQI = Math.round(baseAQI * hourFactor);

            hourlyData.push({
                hour,
                time: `${hour.toString().padStart(2, '0')}:00`,
                aqi: hourAQI,
                category: this.pollutionEngine.getAQICategory(hourAQI),
                recommended: hourAQI < baseAQI * 0.9
            });
        }

        // Sort by AQI to find best times
        const sorted = [...hourlyData].sort((a, b) => a.aqi - b.aqi);

        return {
            hourlyData,
            bestTimes: sorted.slice(0, 6),
            worstTimes: sorted.slice(-3),
            recommendation: this.generateTimeRecommendation(sorted[0], sorted[sorted.length - 1])
        };
    }

    /**
     * Generate time-based recommendation
     */
    generateTimeRecommendation(bestTime, worstTime) {
        let rec = `🕐 Best time to travel: Around ${bestTime.time} (AQI: ${bestTime.aqi}). `;
        rec += `Avoid traveling around ${worstTime.time} (AQI: ${worstTime.aqi}). `;

        if (bestTime.hour >= 0 && bestTime.hour <= 5) {
            rec += `Early morning hours have the cleanest air.`;
        } else if (bestTime.hour >= 11 && bestTime.hour <= 15) {
            rec += `Midday hours benefit from better atmospheric mixing.`;
        }

        return rec;
    }

    /**
     * Compare two specific routes
     */
    compareRoutes(routeId1, routeId2, currentAQIData) {
        const route1 = this.routes[routeId1];
        const route2 = this.routes[routeId2];

        if (!route1 || !route2) {
            return { error: 'Invalid route IDs' };
        }

        const speedMap = { highway: 60, expressway: 50, arterial: 35 };

        const route1Time = (route1.distance / (speedMap[route1.type] || 40)) * 60;
        const route2Time = (route2.distance / (speedMap[route2.type] || 40)) * 60;

        const route1Exposure = this.calculateExposure(route1, currentAQIData, route1Time);
        const route2Exposure = this.calculateExposure(route2, currentAQIData, route2Time);

        const comparison = {
            route1: {
                name: route1.name,
                distance: route1.distance,
                travelTime: Math.round(route1Time),
                averageAQI: route1Exposure.averageAQI,
                exposure: route1Exposure.totalExposure,
                riskLevel: route1Exposure.riskLevel
            },
            route2: {
                name: route2.name,
                distance: route2.distance,
                travelTime: Math.round(route2Time),
                averageAQI: route2Exposure.averageAQI,
                exposure: route2Exposure.totalExposure,
                riskLevel: route2Exposure.riskLevel
            }
        };

        // Determine better route
        if (route1Exposure.totalExposure < route2Exposure.totalExposure) {
            comparison.recommendation = `${route1.name} is safer (${Math.round((route2Exposure.totalExposure - route1Exposure.totalExposure) / route2Exposure.totalExposure * 100)}% less exposure)`;
            comparison.betterRoute = 'route1';
        } else {
            comparison.recommendation = `${route2.name} is safer (${Math.round((route1Exposure.totalExposure - route2Exposure.totalExposure) / route1Exposure.totalExposure * 100)}% less exposure)`;
            comparison.betterRoute = 'route2';
        }

        return comparison;
    }

    /**
     * Get all available routes
     */
    getAllRoutes() {
        return this.routes;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteOptimizer;
}
