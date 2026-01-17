/**
 * Policy Dashboard Controller - Manages policy simulation page
 * Handles policy selection, simulation, and visualization
 */

class PolicyDashboard {
    constructor() {
        this.policySimulator = new PolicySimulator();
        this.dataGenerator = new DataGenerator();
        this.currentLocation = 'delhi';
        this.selectedPolicies = [];
        this.simulationResults = null;
    }

    /**
     * Initialize the policy dashboard
     */
    async initialize() {
        this.setupEventListeners();
        this.loadPolicies();
        await this.loadCurrentData();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Policy selection checkboxes
        document.querySelectorAll('.policy-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.handlePolicySelection(e.target.value, e.target.checked);
            });
        });

        // Simulate button
        const simulateBtn = document.getElementById('simulatePolicies');
        if (simulateBtn) {
            simulateBtn.addEventListener('click', () => this.simulatePolicies());
        }

        // Compare areas button
        const compareBtn = document.getElementById('compareAreas');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => this.compareMultipleAreas());
        }

        // Reset button
        const resetBtn = document.getElementById('resetSimulation');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSimulation());
        }

        // Export button
        const exportBtn = document.getElementById('exportPolicyReport');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportReport());
        }
    }

    /**
     * Load available policies
     */
    loadPolicies() {
        const policies = this.policySimulator.getAllPolicies();
        const container = document.getElementById('policyList');

        if (!container) return;

        container.innerHTML = '';

        Object.entries(policies).forEach(([key, policy]) => {
            const card = this.createPolicyCard(key, policy);
            container.appendChild(card);
        });
    }

    /**
     * Create policy selection card
     */
    createPolicyCard(key, policy) {
        const card = document.createElement('div');
        card.className = 'policy-card';
        card.innerHTML = `
            <div class="policy-card-header">
                <input type="checkbox" class="policy-checkbox" id="policy-${key}" value="${key}">
                <label for="policy-${key}">
                    <span class="policy-icon">${this.getPolicyIcon(key)}</span>
                    <span class="policy-name">${policy.name}</span>
                </label>
            </div>
            <p class="policy-description">${policy.description}</p>
            <div class="policy-stats">
                <div class="stat-item">
                    <span class="stat-label">Expected Impact:</span>
                    <span class="stat-value">${policy.impact * 100}% reduction</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Type:</span>
                    <span class="stat-value">${policy.type}</span>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Get policy icon
     */
    getPolicyIcon(policyKey) {
        const icons = {
            oddEven: '🚗',
            firecracker: '🧨',
            construction: '🏗️',
            industrial: '🏭',
            publicTransport: '🚌',
            workFromHome: '💼'
        };
        return icons[policyKey] || '📋';
    }

    /**
     * Handle policy selection
     */
    handlePolicySelection(policyKey, isSelected) {
        if (isSelected) {
            if (!this.selectedPolicies.includes(policyKey)) {
                this.selectedPolicies.push(policyKey);
            }
        } else {
            this.selectedPolicies = this.selectedPolicies.filter(p => p !== policyKey);
        }

        this.updateSelectionCount();
    }

    /**
     * Update selection count display
     */
    updateSelectionCount() {
        const countEl = document.getElementById('selectedPolicyCount');
        if (countEl) {
            countEl.textContent = this.selectedPolicies.length;
        }

        const simulateBtn = document.getElementById('simulatePolicies');
        if (simulateBtn) {
            simulateBtn.disabled = this.selectedPolicies.length === 0;
        }
    }

    /**
     * Load current pollution data
     */
    async loadCurrentData() {
        this.baselineData = this.dataGenerator.generateAreaData(this.currentLocation);
        this.displayBaselineData();
    }

    /**
     * Display baseline data
     */
    displayBaselineData() {
        const container = document.getElementById('baselineStats');
        if (!container) return;

        const pollutionEngine = new PollutionEngine();
        const analysis = pollutionEngine.analyze(this.baselineData);

        container.innerHTML = `
            <div class="baseline-card">
                <h4>Current Conditions</h4>
                <div class="baseline-aqi">
                    <span class="aqi-value" style="color: ${this.getAQIColor(analysis.aqi)}">${analysis.aqi}</span>
                    <span class="aqi-category">${analysis.category}</span>
                </div>
                <div class="baseline-pollutants">
                    <div class="pollutant-item">
                        <span>PM2.5:</span>
                        <strong>${this.baselineData.pollution.pm25} μg/m³</strong>
                    </div>
                    <div class="pollutant-item">
                        <span>PM10:</span>
                        <strong>${this.baselineData.pollution.pm10} μg/m³</strong>
                    </div>
                    <div class="pollutant-item">
                        <span>NO2:</span>
                        <strong>${this.baselineData.pollution.no2} μg/m³</strong>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Simulate selected policies
     */
    async simulatePolicies() {
        if (this.selectedPolicies.length === 0) {
            alert('Please select at least one policy to simulate.');
            return;
        }

        // Show loading state
        this.showLoading(true);

        // Simulate with a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (this.selectedPolicies.length === 1) {
            this.simulationResults = this.policySimulator.simulatePolicy(
                this.baselineData,
                this.selectedPolicies[0]
            );
        } else {
            this.simulationResults = this.policySimulator.simulateCombined(
                this.baselineData,
                this.selectedPolicies
            );
        }

        this.displayResults();
        this.showLoading(false);
    }

    /**
     * Display simulation results
     */
    displayResults() {
        if (!this.simulationResults) return;

        this.displayImpactSummary();
        this.displayBeforeAfterChart();
        this.displayPollutantBreakdown();
        this.displayRecommendations();

        // Scroll to results
        document.getElementById('simulationResults')?.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Display impact summary
     */
    displayImpactSummary() {
        const container = document.getElementById('impactSummary');
        if (!container) return;

        const baseAQI = this.simulationResults.baseline.aqi;
        const afterAQI = this.simulationResults.after.aqi;
        const reduction = baseAQI - afterAQI;
        const reductionPercent = Math.round((reduction / baseAQI) * 100);

        container.innerHTML = `
            <div class="impact-cards">
                <div class="impact-card">
                    <div class="impact-icon">📊</div>
                    <div class="impact-label">AQI Reduction</div>
                    <div class="impact-value">${reduction} points</div>
                    <div class="impact-percent">${reductionPercent}% improvement</div>
                </div>
                <div class="impact-card">
                    <div class="impact-icon">🎯</div>
                    <div class="impact-label">New AQI</div>
                    <div class="impact-value" style="color: ${this.getAQIColor(afterAQI)}">${afterAQI}</div>
                    <div class="impact-category">${this.simulationResults.after.category}</div>
                </div>
                <div class="impact-card">
                    <div class="impact-icon">${this.getImpactIcon(this.simulationResults.impact.effectiveness)}</div>
                    <div class="impact-label">Effectiveness</div>
                    <div class="impact-value">${this.simulationResults.impact.effectiveness}</div>
                </div>
            </div>
        `;
    }

    /**
     * Display before/after comparison chart
     */
    displayBeforeAfterChart() {
        const canvas = document.getElementById('beforeAfterChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if any
        if (this.beforeAfterChart) {
            this.beforeAfterChart.destroy();
        }

        this.beforeAfterChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Before Policy', 'After Policy'],
                datasets: [{
                    label: 'AQI Level',
                    data: [this.simulationResults.baseline.aqi, this.simulationResults.after.aqi],
                    backgroundColor: [
                        this.getAQIColor(this.simulationResults.baseline.aqi) + '80',
                        this.getAQIColor(this.simulationResults.after.aqi) + '80'
                    ],
                    borderColor: [
                        this.getAQIColor(this.simulationResults.baseline.aqi),
                        this.getAQIColor(this.simulationResults.after.aqi)
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'AQI Before & After Policy Implementation',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    /**
     * Display pollutant breakdown
     */
    displayPollutantBreakdown() {
        const canvas = document.getElementById('pollutantBreakdownChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.pollutantChart) {
            this.pollutantChart.destroy();
        }

        const before = this.simulationResults.baseline.pollution;
        const after = this.simulationResults.after.pollution;

        this.pollutantChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO'],
                datasets: [
                    {
                        label: 'Before',
                        data: [before.pm25, before.pm10, before.no2, before.so2, before.co],
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 1
                    },
                    {
                        label: 'After',
                        data: [after.pm25, after.pm10, after.no2, after.so2, after.co],
                        backgroundColor: '#22c55e',
                        borderColor: '#16a34a',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#e2e8f0' }
                    },
                    title: {
                        display: true,
                        text: 'Pollutant Levels Comparison',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'Concentration (μg/m³)',
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    /**
     * Display recommendations
     */
    displayRecommendations() {
        const container = document.getElementById('policyRecommendations');
        if (!container) return;

        container.innerHTML = `
            <div class="recommendations-content">
                <h4>📋 Implementation Recommendations</h4>
                <p>${this.simulationResults.impact.recommendation}</p>
                
                ${this.simulationResults.combinedPolicies ? `
                    <div class="policy-list">
                        <h5>Applied Policies:</h5>
                        <ul>
                            ${this.simulationResults.combinedPolicies.map(p => `<li>${p}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Compare multiple areas
     */
    async compareMultipleAreas() {
        const areas = ['delhi', 'noida', 'gurgaon', 'ghaziabad', 'faridabad'];
        const baselineDataArray = areas.map(area => this.dataGenerator.generateAreaData(area));

        if (this.selectedPolicies.length === 0) {
            alert('Please select at least one policy first.');
            return;
        }

        const policyKey = this.selectedPolicies[0];
        const results = this.policySimulator.simulateMultipleAreas(baselineDataArray, policyKey);

        this.displayAreaComparison(results);
    }

    /**
     * Display area comparison
     */
    displayAreaComparison(results) {
        const canvas = document.getElementById('areaComparisonChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (this.areaChart) {
            this.areaChart.destroy();
        }

        const areas = results.areaResults.map(r => r.area);
        const beforeData = results.areaResults.map(r => r.baseline.aqi);
        const afterData = results.areaResults.map(r => r.after.aqi);

        this.areaChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: areas,
                datasets: [
                    {
                        label: 'Before',
                        data: beforeData,
                        backgroundColor: '#ef4444',
                        borderColor: '#dc2626',
                        borderWidth: 1
                    },
                    {
                        label: 'After',
                        data: afterData,
                        backgroundColor: '#22c55e',
                        borderColor: '#16a34a',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#e2e8f0' }
                    },
                    title: {
                        display: true,
                        text: 'Policy Impact Across Areas',
                        color: '#e2e8f0',
                        font: { size: 16, weight: 'bold' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' },
                        title: {
                            display: true,
                            text: 'AQI',
                            color: '#94a3b8'
                        }
                    },
                    x: {
                        grid: { color: '#334155' },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    /**
     * Reset simulation
     */
    resetSimulation() {
        this.selectedPolicies = [];
        this.simulationResults = null;

        // Uncheck all checkboxes
        document.querySelectorAll('.policy-checkbox').forEach(cb => {
            cb.checked = false;
        });

        // Clear results
        const resultsSection = document.getElementById('simulationResults');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }

        this.updateSelectionCount();
    }

    /**
     * Export policy report
     */
    exportReport() {
        if (!this.simulationResults) {
            alert('Please run a simulation first.');
            return;
        }

        let report = '=== POLICY SIMULATION REPORT ===\n\n';
        report += `Generated: ${new Date().toLocaleString()}\n`;
        report += `Location: ${this.baselineData.area}\n\n`;

        report += '--- BASELINE CONDITIONS ---\n';
        report += `AQI: ${this.simulationResults.baseline.aqi} (${this.simulationResults.baseline.category})\n`;
        report += `PM2.5: ${this.simulationResults.baseline.pollution.pm25} μg/m³\n`;
        report += `PM10: ${this.simulationResults.baseline.pollution.pm10} μg/m³\n\n`;

        report += '--- SIMULATED POLICIES ---\n';
        if (this.simulationResults.combinedPolicies) {
            this.simulationResults.combinedPolicies.forEach(policy => {
                report += `• ${policy}\n`;
            });
        }
        report += '\n';

        report += '--- PROJECTED IMPACT ---\n';
        report += `New AQI: ${this.simulationResults.after.aqi} (${this.simulationResults.after.category})\n`;
        report += `Reduction: ${this.simulationResults.baseline.aqi - this.simulationResults.after.aqi} points\n`;
        report += `Effectiveness: ${this.simulationResults.impact.effectiveness}\n\n`;

        report += '--- RECOMMENDATIONS ---\n';
        report += this.simulationResults.impact.recommendation;

        // Download as text file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `policy-simulation-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Show/hide loading state
     */
    showLoading(show) {
        const loader = document.getElementById('simulationLoader');
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * Get AQI color
     */
    getAQIColor(aqi) {
        if (aqi <= 50) return '#22c55e';
        if (aqi <= 100) return '#eab308';
        if (aqi <= 150) return '#f97316';
        if (aqi <= 200) return '#ef4444';
        if (aqi <= 300) return '#a855f7';
        return '#991b1b';
    }

    /**
     * Get impact icon
     */
    getImpactIcon(effectiveness) {
        if (effectiveness === 'Very High') return '🌟';
        if (effectiveness === 'High') return '✅';
        if (effectiveness === 'Moderate') return '⚡';
        return '📊';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PolicyDashboard;
}
