// Policy Simulator - New Implementation
// Handles sliders, toggles, and real-time calculations

class PolicySimulator {
    constructor() {
        this.trafficSlider = document.getElementById('trafficSlider');
        this.industrialSlider = document.getElementById('industrialSlider');
        this.constructionToggle = document.getElementById('constructionToggle');
        this.oddEvenToggle = document.getElementById('oddEvenToggle');

        this.trafficValue = document.getElementById('trafficValue');
        this.industrialValue = document.getElementById('industrialValue');

        this.runButton = document.getElementById('runPolicySimulation');
        this.resetButton = document.getElementById('resetPolicySimulator');

        this.baselineAqiValue = document.getElementById('baselineAqiValue');
        this.projectedAqiValue = document.getElementById('projectedAqiValue');
        this.improvementBadge = document.getElementById('improvementBadge');
        this.impactAnalysisText = document.getElementById('impactAnalysisText');

        this.init();
    }

    init() {
        // Set baseline from current AQI
        this.setBaselineAQI();

        // Update slider displays
        this.trafficSlider.addEventListener('input', () => {
            this.trafficValue.textContent = `${this.trafficSlider.value}%`;
        });

        this.industrialSlider.addEventListener('input', () => {
            this.industrialValue.textContent = `${this.industrialSlider.value}%`;
        });

        // Run simulation button
        this.runButton.addEventListener('click', () => this.runSimulation());

        // Reset button
        this.resetButton.addEventListener('click', () => this.resetAll());
    }

    async setBaselineAQI() {
        try {
            // Try to get current AQI from dashboard display
            let currentAQI = parseInt(document.getElementById('currentAQI')?.textContent);

            // If not available, try sidebar AQI
            if (!currentAQI || isNaN(currentAQI)) {
                currentAQI = parseInt(document.getElementById('sidebar-aqi')?.textContent);
            }

            // If still not available, fetch from API
            if (!currentAQI || isNaN(currentAQI)) {
                if (window.DualAPI) {
                    const data = await window.DualAPI.fetchCompleteData('delhi');
                    currentAQI = data?.aqi || 320;
                } else {
                    currentAQI = 320; // Final fallback
                }
            }

            this.baselineAqiValue.textContent = currentAQI;

            // Also set initial projected value
            this.runSimulation();
        } catch (error) {
            console.error('Error setting baseline:', error);
            this.baselineAqiValue.textContent = '320';
        }
    }

    runSimulation() {
        const traffic = parseInt(this.trafficSlider.value);
        const industrial = parseInt(this.industrialSlider.value);
        const construction = this.constructionToggle.checked;
        const oddEven = this.oddEvenToggle.checked;

        const baseline = parseInt(this.baselineAqiValue.textContent);

        // Calculate impact
        let reduction = 0;

        // Traffic reduction impact (0.3 * percentage)
        reduction += (traffic / 100) * 0.30 * baseline;

        // Industrial shutdown impact (0.35 * percentage)
        reduction += (industrial / 100) * 0.35 * baseline;

        // Construction ban impact (fixed 15%)
        if (construction) {
            reduction += 0.15 * baseline;
        }

        // Odd-even scheme impact (fixed 12%)
        if (oddEven) {
            reduction += 0.12 * baseline;
        }

        // Calculate projected AQI
        const projected = Math.max(50, Math.round(baseline - reduction));
        const improvementPercent = Math.round(((baseline - projected) / baseline) * 100);

        // Update UI
        this.projectedAqiValue.textContent = projected;
        this.improvementBadge.textContent = `↓ ${improvementPercent}% Improvement`;

        // Determine highest impact parameter
        const impacts = [
            { name: 'Traffic Reduction', value: (traffic / 100) * 0.30 * baseline },
            { name: 'Industrial Shutdown', value: (industrial / 100) * 0.35 * baseline },
            { name: 'Construction Ban', value: construction ? 0.15 * baseline : 0 },
            { name: 'Odd-Even Scheme', value: oddEven ? 0.12 * baseline : 0 }
        ];

        const maxImpact = impacts.reduce((max, impact) =>
            impact.value > max.value ? impact : max
        );

        // Update impact analysis text
        this.updateImpactText(maxImpact.name, improvementPercent);
    }

    updateImpactText(highestImpact, improvement) {
        const text = `Based on the current meteorological conditions (low wind speed, high humidity), the selected measures would reduce the PM2.5 concentration significantly. The <strong>${highestImpact}</strong> parameter has the highest leverage in this scenario.`;
        this.impactAnalysisText.innerHTML = text;
    }

    resetAll() {
        this.trafficSlider.value = 38;
        this.industrialSlider.value = 88;
        this.constructionToggle.checked = false;
        this.oddEvenToggle.checked = false;

        this.trafficValue.textContent = '38%';
        this.industrialValue.textContent = '88%';

        this.setBaselineAQI();
        this.projectedAqiValue.textContent = '134';
        this.improvementBadge.textContent = '↓ 58% Improvement';

        this.updateImpactText('Traffic Reduction', 58);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PolicySimulator();
    });
} else {
    new PolicySimulator();
}
