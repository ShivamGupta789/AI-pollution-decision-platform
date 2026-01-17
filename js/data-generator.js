/**
 * Data Generator - Realistic Pollution and Weather Data Simulation
 * Generates realistic pollution data for Delhi NCR areas with seasonal and temporal patterns
 */

class DataGenerator {
    constructor() {
        // Delhi NCR major areas with characteristics
        this.areas = [
            { id: 'central_delhi', name: 'Central Delhi', type: 'urban', trafficLevel: 'high', industrial: 'low' },
            { id: 'dwarka', name: 'Dwarka', type: 'residential', trafficLevel: 'medium', industrial: 'low' },
            { id: 'rohini', name: 'Rohini', type: 'residential', trafficLevel: 'medium', industrial: 'medium' },
            { id: 'anand_vihar', name: 'Anand Vihar', type: 'urban', trafficLevel: 'very_high', industrial: 'medium' },
            { id: 'ito', name: 'ITO', type: 'urban', trafficLevel: 'very_high', industrial: 'low' },
            { id: 'ghaziabad', name: 'Ghaziabad', type: 'industrial', trafficLevel: 'high', industrial: 'very_high' },
            { id: 'noida', name: 'Noida', type: 'mixed', trafficLevel: 'high', industrial: 'high' },
            { id: 'greater_noida', name: 'Greater Noida', type: 'developing', trafficLevel: 'medium', industrial: 'medium' },
            { id: 'gurugram', name: 'Gurugram', type: 'urban', trafficLevel: 'very_high', industrial: 'medium' },
            { id: 'faridabad', name: 'Faridabad', type: 'industrial', trafficLevel: 'high', industrial: 'very_high' },
            { id: 'manesar', name: 'Manesar', type: 'industrial', trafficLevel: 'medium', industrial: 'very_high' },
            { id: 'rk_puram', name: 'RK Puram', type: 'residential', trafficLevel: 'medium', industrial: 'low' },
            { id: 'punjabi_bagh', name: 'Punjabi Bagh', type: 'residential', trafficLevel: 'high', industrial: 'low' },
            { id: 'najafgarh', name: 'Najafgarh', type: 'rural', trafficLevel: 'low', industrial: 'low' },
            { id: 'mundka', name: 'Mundka', type: 'industrial', trafficLevel: 'medium', industrial: 'high' }
        ];

        // Seasonal patterns (month-based)
        this.seasonalFactors = {
            winter: { months: [11, 12, 1, 2], multiplier: 2.5, cropBurning: true },
            summer: { months: [4, 5, 6], multiplier: 1.3, dust: true },
            monsoon: { months: [7, 8, 9], multiplier: 0.6, clearing: true },
            autumn: { months: [10], multiplier: 2.0, cropBurning: true },
            spring: { months: [3], multiplier: 1.0 }
        };
    }

    /**
     * Get current season based on month
     */
    getCurrentSeason(month) {
        for (const [season, data] of Object.entries(this.seasonalFactors)) {
            if (data.months.includes(month)) {
                return { name: season, ...data };
            }
        }
        return { name: 'spring', multiplier: 1.0 };
    }

    /**
     * Generate hourly pollution pattern (rush hours have higher pollution)
     */
    getHourlyMultiplier(hour) {
        // Morning rush: 7-10 AM
        if (hour >= 7 && hour <= 10) return 1.8;
        // Evening rush: 6-9 PM
        if (hour >= 18 && hour <= 21) return 1.9;
        // Night time: 11 PM - 5 AM (lower traffic)
        if (hour >= 23 || hour <= 5) return 0.5;
        // Daytime
        return 1.0;
    }

    /**
     * Generate base pollution levels for area type
     */
    getBasePollution(areaType, industrial) {
        const baseLevels = {
            pm25: { urban: 120, residential: 80, industrial: 180, mixed: 110, developing: 90, rural: 60 },
            pm10: { urban: 200, residential: 140, industrial: 280, mixed: 180, developing: 150, rural: 100 },
            no2: { urban: 60, residential: 40, industrial: 80, mixed: 55, developing: 45, rural: 25 },
            so2: { urban: 15, residential: 10, industrial: 35, mixed: 18, developing: 12, rural: 8 },
            co: { urban: 1.5, residential: 1.0, industrial: 2.5, mixed: 1.8, developing: 1.2, rural: 0.8 }
        };

        // Industrial multiplier
        const industrialMultipliers = {
            'very_high': 1.5,
            'high': 1.3,
            'medium': 1.1,
            'low': 1.0
        };

        const multiplier = industrialMultipliers[industrial] || 1.0;

        return {
            pm25: baseLevels.pm25[areaType] * multiplier,
            pm10: baseLevels.pm10[areaType] * multiplier,
            no2: baseLevels.no2[areaType] * multiplier,
            so2: baseLevels.so2[areaType] * multiplier,
            co: baseLevels.co[areaType] * multiplier
        };
    }

    /**
     * Generate weather data
     */
    generateWeather(date) {
        const month = date.getMonth() + 1;
        const hour = date.getHours();
        
        // Temperature patterns
        let baseTemp = 25;
        if (month >= 11 || month <= 2) baseTemp = 15; // Winter
        else if (month >= 4 && month <= 6) baseTemp = 35; // Summer
        else if (month >= 7 && month <= 9) baseTemp = 28; // Monsoon

        // Daily variation
        const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 8;
        const temperature = baseTemp + tempVariation + (Math.random() - 0.5) * 3;

        // Wind speed (lower in winter, higher in summer/monsoon)
        const baseWind = month >= 11 || month <= 2 ? 3 : 8;
        const windSpeed = baseWind + (Math.random() - 0.5) * 4;

        // Humidity (higher in monsoon)
        const baseHumidity = month >= 7 && month <= 9 ? 75 : 45;
        const humidity = baseHumidity + (Math.random() - 0.5) * 20;

        // Inversion layer (common in winter mornings)
        const hasInversion = (month >= 11 || month <= 2) && hour >= 5 && hour <= 9;

        return {
            temperature: Math.max(5, Math.min(45, temperature)),
            windSpeed: Math.max(0, Math.min(20, windSpeed)),
            humidity: Math.max(20, Math.min(95, humidity)),
            hasInversion,
            pressure: 1013 + (Math.random() - 0.5) * 10
        };
    }

    /**
     * Generate pollution data for a specific area and time
     */
    generatePollutionData(area, date = new Date()) {
        const month = date.getMonth() + 1;
        const hour = date.getHours();
        
        const season = this.getCurrentSeason(month);
        const hourlyMultiplier = this.getHourlyMultiplier(hour);
        const basePollution = this.getBasePollution(area.type, area.industrial);
        const weather = this.generateWeather(date);

        // Weather impact on pollution
        let weatherMultiplier = 1.0;
        if (weather.windSpeed < 3) weatherMultiplier *= 1.4; // Low wind = pollution accumulation
        if (weather.hasInversion) weatherMultiplier *= 1.6; // Inversion layer traps pollution
        if (weather.humidity > 70) weatherMultiplier *= 0.9; // High humidity settles particles

        // Final pollution values
        const totalMultiplier = season.multiplier * hourlyMultiplier * weatherMultiplier;
        
        const pollution = {
            pm25: Math.round(basePollution.pm25 * totalMultiplier + (Math.random() - 0.5) * 20),
            pm10: Math.round(basePollution.pm10 * totalMultiplier + (Math.random() - 0.5) * 30),
            no2: Math.round(basePollution.no2 * totalMultiplier + (Math.random() - 0.5) * 10),
            so2: Math.round(basePollution.so2 * totalMultiplier + (Math.random() - 0.5) * 5),
            co: parseFloat((basePollution.co * totalMultiplier + (Math.random() - 0.5) * 0.3).toFixed(2))
        };

        // Ensure non-negative values
        Object.keys(pollution).forEach(key => {
            pollution[key] = Math.max(0, pollution[key]);
        });

        return {
            area: area.name,
            areaId: area.id,
            timestamp: date.toISOString(),
            pollution,
            weather,
            season: season.name
        };
    }

    /**
     * Generate pollution data for all areas
     */
    generateAllAreasData(date = new Date()) {
        return this.areas.map(area => this.generatePollutionData(area, date));
    }

    /**
     * Generate historical data for trend analysis
     */
    generateHistoricalData(hours = 72) {
        const data = [];
        const now = new Date();
        
        for (let i = hours; i >= 0; i--) {
            const date = new Date(now.getTime() - i * 60 * 60 * 1000);
            data.push({
                timestamp: date,
                areas: this.generateAllAreasData(date)
            });
        }
        
        return data;
    }

    /**
     * Get area by ID
     */
    getArea(areaId) {
        return this.areas.find(a => a.id === areaId);
    }

    /**
     * Get all areas
     */
    getAllAreas() {
        return this.areas;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataGenerator;
}
