/**
 * Health Advisor - Generates health advisories and recommendations
 * Provides demographic-specific advice based on AQI levels
 */

class HealthAdvisor {
    constructor() {
        // Health impact guidelines by AQI category
        this.guidelines = {
            'Good': {
                range: [0, 50],
                color: '#00e400',
                general: 'Air quality is satisfactory, and air pollution poses little or no risk.',
                children: 'Enjoy outdoor activities freely.',
                elderly: 'No restrictions. Outdoor activities are safe.',
                patients: 'No special precautions needed.'
            },
            'Moderate': {
                range: [51, 100],
                color: '#ffff00',
                general: 'Air quality is acceptable. However, there may be a risk for some people.',
                children: 'Outdoor activities are generally safe. Stay hydrated.',
                elderly: 'Sensitive individuals should consider limiting prolonged outdoor exertion.',
                patients: 'People with respiratory or heart conditions should monitor symptoms.'
            },
            'Poor': {
                range: [101, 200],
                color: '#ff7e00',
                general: 'Members of sensitive groups may experience health effects.',
                children: 'Limit prolonged outdoor activities. Prefer indoor play.',
                elderly: 'Reduce prolonged or heavy outdoor exertion. Take frequent breaks.',
                patients: 'Avoid prolonged outdoor exertion. Keep rescue medications handy.'
            },
            'Very Poor': {
                range: [201, 300],
                color: '#ff0000',
                general: 'Health alert: The risk of health effects is increased for everyone.',
                children: 'Avoid outdoor activities. Stay indoors with air purifiers if possible.',
                elderly: 'Avoid all outdoor activities. Stay indoors and keep windows closed.',
                patients: 'Stay indoors. Use air purifiers. Consult doctor if symptoms worsen.'
            },
            'Severe': {
                range: [301, 400],
                color: '#8f3f97',
                general: 'Health warning of emergency conditions. Everyone is more likely to be affected.',
                children: 'Stay indoors. Schools should cancel outdoor activities.',
                elderly: 'Stay indoors. Avoid all physical exertion. Use N95 masks if going out.',
                patients: 'Medical emergency risk. Stay indoors. Seek medical help if breathing difficulty occurs.'
            },
            'Hazardous': {
                range: [401, 500],
                color: '#7e0023',
                general: 'Health alert: everyone may experience serious health effects.',
                children: 'Stay indoors. Use air purifiers. Wear N95 masks if must go out.',
                elderly: 'Stay indoors. Minimize all physical activity. Seek medical attention if needed.',
                patients: 'High medical emergency risk. Stay indoors with air purification. Contact doctor immediately if symptoms appear.'
            }
        };

        // Safe activity recommendations
        this.activities = {
            'Good': {
                outdoor: ['Running', 'Cycling', 'Sports', 'Walking', 'Yoga'],
                indoor: ['Normal activities']
            },
            'Moderate': {
                outdoor: ['Light walking', 'Moderate exercise'],
                indoor: ['Gym workouts', 'Indoor sports']
            },
            'Poor': {
                outdoor: ['Short walks only'],
                indoor: ['Indoor exercises', 'Yoga', 'Gym with air filtration']
            },
            'Very Poor': {
                outdoor: ['Avoid all outdoor activities'],
                indoor: ['Light indoor exercises', 'Stretching', 'Meditation']
            },
            'Severe': {
                outdoor: ['No outdoor activities'],
                indoor: ['Minimal physical activity', 'Rest']
            },
            'Hazardous': {
                outdoor: ['Emergency only - wear N95 mask'],
                indoor: ['Complete rest', 'Stay in purified air environment']
            }
        };
    }

    /**
     * Get health advisory for specific AQI
     */
    getAdvisory(aqi, category) {
        const guideline = this.guidelines[category];

        if (!guideline) {
            return this.guidelines['Moderate']; // Fallback
        }

        return {
            category,
            aqi,
            color: guideline.color,
            general: guideline.general,
            demographics: {
                children: guideline.children,
                elderly: guideline.elderly,
                patients: guideline.patients
            },
            activities: this.activities[category] || this.activities['Moderate']
        };
    }

    /**
     * Generate protective measures
     */
    getProtectiveMeasures(category) {
        const measures = {
            'Good': [
                'No special precautions needed',
                'Enjoy outdoor activities'
            ],
            'Moderate': [
                'Stay hydrated',
                'Monitor air quality updates'
            ],
            'Poor': [
                'Close windows and doors',
                'Use air purifiers indoors',
                'Limit outdoor exposure',
                'Wear masks if going out'
            ],
            'Very Poor': [
                'Keep windows and doors closed',
                'Use air purifiers on high setting',
                'Avoid outdoor activities completely',
                'Wear N95 masks if must go outside',
                'Monitor health symptoms closely'
            ],
            'Severe': [
                'Stay indoors at all times',
                'Seal windows and doors',
                'Use HEPA air purifiers',
                'Wear N95 masks even for brief outdoor exposure',
                'Keep emergency medications ready',
                'Monitor news for emergency advisories'
            ],
            'Hazardous': [
                'Emergency situation - stay indoors',
                'Use multiple air purifiers',
                'Create a clean air room',
                'Wear N95/N99 masks for any outdoor exposure',
                'Seek medical help immediately if symptoms appear',
                'Follow government emergency protocols'
            ]
        };

        return measures[category] || measures['Moderate'];
    }

    /**
     * Recommend safer routes/areas
     */
    recommendSaferAreas(allAreasData) {
        // Sort areas by AQI
        const sorted = [...allAreasData].sort((a, b) => a.aqi - b.aqi);

        const safest = sorted.slice(0, 3);
        const mostPolluted = sorted.slice(-3).reverse();

        return {
            safest: safest.map(area => ({
                area: area.area,
                aqi: area.aqi,
                category: area.category
            })),
            avoid: mostPolluted.map(area => ({
                area: area.area,
                aqi: area.aqi,
                category: area.category
            }))
        };
    }

    /**
     * Generate alert for severe conditions
     */
    generateAlert(aqi, category, area) {
        if (aqi < 200) {
            return null; // No alert needed
        }

        const severity = aqi >= 400 ? 'CRITICAL' : aqi >= 300 ? 'SEVERE' : 'HIGH';

        return {
            severity,
            area,
            aqi,
            category,
            message: this.getAlertMessage(severity, area, aqi),
            timestamp: new Date().toISOString(),
            actions: this.getEmergencyActions(severity)
        };
    }

    /**
     * Get alert message
     */
    getAlertMessage(severity, area, aqi) {
        switch (severity) {
            case 'CRITICAL':
                return `🚨 CRITICAL AIR QUALITY ALERT for ${area}! AQI: ${aqi}. Hazardous conditions. Stay indoors immediately!`;
            case 'SEVERE':
                return `⚠️ SEVERE AIR QUALITY ALERT for ${area}! AQI: ${aqi}. Avoid all outdoor activities.`;
            case 'HIGH':
                return `⚠️ HIGH POLLUTION ALERT for ${area}! AQI: ${aqi}. Limit outdoor exposure.`;
            default:
                return `Air quality alert for ${area}. AQI: ${aqi}.`;
        }
    }

    /**
     * Get emergency actions
     */
    getEmergencyActions(severity) {
        const actions = {
            'CRITICAL': [
                'Stay indoors immediately',
                'Close all windows and doors',
                'Use air purifiers on maximum setting',
                'Wear N95 masks if must go outside',
                'Seek medical help if breathing difficulty occurs',
                'Monitor official emergency broadcasts'
            ],
            'SEVERE': [
                'Stay indoors',
                'Avoid all outdoor activities',
                'Use air purifiers',
                'Wear N95 masks for outdoor exposure',
                'Keep emergency medications ready'
            ],
            'HIGH': [
                'Limit outdoor activities',
                'Close windows during peak hours',
                'Use air purifiers',
                'Wear masks when going out',
                'Monitor health symptoms'
            ]
        };

        return actions[severity] || [];
    }

    /**
     * Generate comprehensive health report
     */
    generateReport(analysisData) {
        const advisory = this.getAdvisory(analysisData.aqi, analysisData.category);
        const measures = this.getProtectiveMeasures(analysisData.category);
        const alert = this.generateAlert(analysisData.aqi, analysisData.category, analysisData.area);

        return {
            area: analysisData.area,
            aqi: analysisData.aqi,
            category: analysisData.category,
            color: advisory.color,
            advisory: advisory.demographics,
            general: advisory.general,
            activities: advisory.activities,
            protectiveMeasures: measures,
            alert,
            timestamp: analysisData.timestamp
        };
    }

    /**
     * Generate reports for multiple areas
     */
    generateMultipleReports(analysisDataArray) {
        const reports = analysisDataArray.map(data => this.generateReport(data));
        const saferAreas = this.recommendSaferAreas(analysisDataArray);

        return {
            reports,
            saferAreas
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthAdvisor;
}
