/**
 * Policy Simulator - Simulates policy interventions and their impact
 * Models various pollution control policies and compares effectiveness
 */

class PolicySimulator {
    constructor() {
        this.pollutionEngine = new PollutionEngine();

        // Policy definitions with impact parameters
        this.policies = {
            oddEven: {
                name: 'Odd-Even Vehicle Rule',
                description: 'Vehicles with odd/even registration numbers allowed on alternate days',
                targetSources: ['traffic'],
                impact: {
                    traffic: -40, // 40% reduction in traffic emissions
                    no2: -25,
                    co: -30,
                    pm25: -15,
                    pm10: -15
                },
                effectiveness: 'high',
                implementationCost: 'medium',
                publicAcceptance: 'medium'
            },
            firecrackerBan: {
                name: 'Firecracker Ban',
                description: 'Complete ban on firecrackers during festival season',
                targetSources: ['cropBurning'], // Similar particulate signature
                seasonal: [10, 11], // October-November (Diwali period)
                impact: {
                    pm25: -35,
                    pm10: -30,
                    so2: -20
                },
                effectiveness: 'very_high',
                implementationCost: 'low',
                publicAcceptance: 'low'
            },
            constructionBan: {
                name: 'Construction Activity Restrictions',
                description: 'Ban on construction and demolition activities',
                targetSources: ['industrial'],
                impact: {
                    pm10: -25,
                    pm25: -15,
                    industrial: -20
                },
                effectiveness: 'medium',
                implementationCost: 'high',
                publicAcceptance: 'low'
            },
            industrialControl: {
                name: 'Industrial Emission Controls',
                description: 'Stricter emission norms and temporary shutdown of polluting industries',
                targetSources: ['industrial'],
                impact: {
                    industrial: -35,
                    so2: -40,
                    no2: -25,
                    pm10: -20,
                    pm25: -15
                },
                effectiveness: 'high',
                implementationCost: 'very_high',
                publicAcceptance: 'medium'
            },
            publicTransport: {
                name: 'Free Public Transport',
                description: 'Make metro and buses free to encourage public transport usage',
                targetSources: ['traffic'],
                impact: {
                    traffic: -25,
                    no2: -15,
                    co: -20,
                    pm25: -10
                },
                effectiveness: 'medium',
                implementationCost: 'high',
                publicAcceptance: 'very_high'
            },
            workFromHome: {
                name: 'Work From Home Mandate',
                description: 'Mandatory work from home for 50% of workforce',
                targetSources: ['traffic'],
                impact: {
                    traffic: -30,
                    no2: -20,
                    co: -25,
                    pm25: -12
                },
                effectiveness: 'high',
                implementationCost: 'low',
                publicAcceptance: 'high'
            }
        };
    }

    /**
     * Apply policy impact to pollution data
     */
    applyPolicyImpact(pollutionData, policy, month = null) {
        const policyConfig = this.policies[policy];

        if (!policyConfig) {
            throw new Error(`Unknown policy: ${policy}`);
        }

        // Check if policy is seasonal
        if (policyConfig.seasonal && month) {
            if (!policyConfig.seasonal.includes(month)) {
                // Policy not applicable in this season
                return {
                    ...pollutionData,
                    policyApplied: false,
                    reason: 'Policy not applicable in this season'
                };
            }
        }

        // Clone pollution data
        const modifiedPollution = { ...pollutionData.pollution };

        // Apply pollutant-specific impacts
        Object.keys(policyConfig.impact).forEach(key => {
            if (key !== 'traffic' && key !== 'industrial') {
                const reduction = policyConfig.impact[key];
                const reductionFactor = 1 + (reduction / 100);
                modifiedPollution[key] = Math.max(0, Math.round(modifiedPollution[key] * reductionFactor));
            }
        });

        return {
            ...pollutionData,
            pollution: modifiedPollution,
            policyApplied: true,
            policy: policyConfig.name
        };
    }

    /**
     * Simulate single policy
     */
    simulatePolicy(baselineData, policyKey) {
        const month = new Date(baselineData.timestamp).getMonth() + 1;

        // Get baseline analysis
        const baseline = this.pollutionEngine.analyze(baselineData);

        // Apply policy
        const afterPolicy = this.applyPolicyImpact(baselineData, policyKey, month);

        if (!afterPolicy.policyApplied) {
            return {
                policy: this.policies[policyKey].name,
                applicable: false,
                reason: afterPolicy.reason
            };
        }

        // Analyze after policy
        const afterAnalysis = this.pollutionEngine.analyze(afterPolicy);

        // Calculate improvements
        const aqiImprovement = baseline.aqi - afterAnalysis.aqi;
        const percentImprovement = ((aqiImprovement / baseline.aqi) * 100).toFixed(1);

        const pollutantImprovements = {};
        Object.keys(baseline.pollution).forEach(pollutant => {
            const reduction = baseline.pollution[pollutant] - afterAnalysis.pollution[pollutant];
            const percentReduction = baseline.pollution[pollutant] > 0
                ? ((reduction / baseline.pollution[pollutant]) * 100).toFixed(1)
                : 0;
            pollutantImprovements[pollutant] = {
                before: baseline.pollution[pollutant],
                after: afterAnalysis.pollution[pollutant],
                reduction,
                percentReduction: parseFloat(percentReduction)
            };
        });

        return {
            policy: this.policies[policyKey].name,
            policyKey,
            description: this.policies[policyKey].description,
            applicable: true,
            baseline: {
                aqi: baseline.aqi,
                category: baseline.category,
                pollution: baseline.pollution
            },
            afterPolicy: {
                aqi: afterAnalysis.aqi,
                category: afterAnalysis.category,
                pollution: afterAnalysis.pollution
            },
            improvement: {
                aqi: aqiImprovement,
                percent: parseFloat(percentImprovement),
                categoryChange: baseline.category !== afterAnalysis.category,
                newCategory: afterAnalysis.category
            },
            pollutantImprovements,
            effectiveness: this.policies[policyKey].effectiveness,
            cost: this.policies[policyKey].implementationCost,
            publicAcceptance: this.policies[policyKey].publicAcceptance
        };
    }

    /**
     * Compare multiple policies
     */
    comparePolicies(baselineData, policyKeys) {
        const results = policyKeys.map(key => this.simulatePolicy(baselineData, key));

        // Filter applicable policies
        const applicable = results.filter(r => r.applicable);

        // Sort by AQI improvement
        applicable.sort((a, b) => b.improvement.aqi - a.improvement.aqi);

        // Identify best policy
        const bestPolicy = applicable.length > 0 ? applicable[0] : null;

        return {
            baseline: {
                area: baselineData.area,
                aqi: this.pollutionEngine.analyze(baselineData).aqi,
                category: this.pollutionEngine.analyze(baselineData).category
            },
            policies: applicable,
            bestPolicy,
            recommendation: this.generateRecommendation(applicable, baselineData)
        };
    }

    /**
     * Simulate policy for multiple areas
     */
    simulateMultipleAreas(baselineDataArray, policyKey) {
        const results = baselineDataArray.map(data => {
            const simulation = this.simulatePolicy(data, policyKey);
            return {
                area: data.area,
                areaId: data.areaId,
                ...simulation
            };
        });

        // Identify areas with maximum improvement
        const applicable = results.filter(r => r.applicable);
        applicable.sort((a, b) => b.improvement.aqi - a.improvement.aqi);

        const maxImprovement = applicable.slice(0, 3);
        const minImprovement = applicable.slice(-3).reverse();

        return {
            policy: this.policies[policyKey].name,
            results,
            summary: {
                totalAreas: results.length,
                applicableAreas: applicable.length,
                averageImprovement: applicable.length > 0
                    ? (applicable.reduce((sum, r) => sum + r.improvement.aqi, 0) / applicable.length).toFixed(1)
                    : 0,
                maxImprovement,
                minImprovement
            }
        };
    }

    /**
     * Simulate combined policies
     */
    simulateCombined(baselineData, policyKeys) {
        let currentData = { ...baselineData };
        const month = new Date(baselineData.timestamp).getMonth() + 1;

        const baseline = this.pollutionEngine.analyze(baselineData);
        const appliedPolicies = [];

        // Apply policies sequentially
        policyKeys.forEach(policyKey => {
            const afterPolicy = this.applyPolicyImpact(currentData, policyKey, month);
            if (afterPolicy.policyApplied) {
                currentData = afterPolicy;
                appliedPolicies.push(this.policies[policyKey].name);
            }
        });

        const afterAnalysis = this.pollutionEngine.analyze(currentData);

        const aqiImprovement = baseline.aqi - afterAnalysis.aqi;
        const percentImprovement = ((aqiImprovement / baseline.aqi) * 100).toFixed(1);

        return {
            policies: appliedPolicies,
            baseline: {
                aqi: baseline.aqi,
                category: baseline.category
            },
            afterPolicies: {
                aqi: afterAnalysis.aqi,
                category: afterAnalysis.category
            },
            improvement: {
                aqi: aqiImprovement,
                percent: parseFloat(percentImprovement),
                categoryChange: baseline.category !== afterAnalysis.category
            }
        };
    }

    /**
     * Generate policy recommendation
     */
    generateRecommendation(policyResults, baselineData) {
        if (policyResults.length === 0) {
            return 'No applicable policies for current conditions.';
        }

        const best = policyResults[0];
        const baseline = this.pollutionEngine.analyze(baselineData);

        let recommendation = `Recommended: **${best.policy}**. `;
        recommendation += `Expected to reduce AQI from ${baseline.aqi} (${baseline.category}) `;
        recommendation += `to ${best.afterPolicy.aqi} (${best.afterPolicy.category}), `;
        recommendation += `a ${best.improvement.percent}% improvement. `;

        // Add implementation considerations
        if (best.publicAcceptance === 'high') {
            recommendation += `High public acceptance makes implementation easier. `;
        } else if (best.publicAcceptance === 'low') {
            recommendation += `Low public acceptance may require strong enforcement. `;
        }

        if (best.cost === 'low') {
            recommendation += `Low implementation cost. `;
        } else if (best.cost === 'very_high') {
            recommendation += `High implementation cost requires significant resources. `;
        }

        // Suggest combination if improvement is insufficient
        if (best.improvement.aqi < 50 && baseline.aqi > 200) {
            recommendation += `Consider combining with other policies for greater impact.`;
        }

        return recommendation;
    }

    /**
     * Get all available policies
     */
    getAllPolicies() {
        return Object.keys(this.policies).map(key => ({
            key,
            name: this.policies[key].name,
            description: this.policies[key].description,
            effectiveness: this.policies[key].effectiveness
        }));
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolicySimulator;
}
