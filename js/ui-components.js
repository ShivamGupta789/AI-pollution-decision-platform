/**
 * UI Components - Reusable UI rendering functions
 * Handles all DOM manipulation and component rendering
 */

class UIComponents {
    /**
     * Render AQI badge
     */
    static renderAQIBadge(aqi, category) {
        const categoryClass = category.toLowerCase().replace(/\s+/g, '-');
        return `<span class="aqi-badge ${categoryClass}">${category}</span>`;
    }

    /**
     * Render source breakdown
     */
    static renderSourceBreakdown(sources, mainCause) {
        const sourceIcons = {
            traffic: '🚗',
            cropBurning: '🌾',
            industrial: '🏭',
            meteorological: '🌦️'
        };

        const sourceNames = {
            traffic: 'Vehicular Emissions',
            cropBurning: 'Crop Burning',
            industrial: 'Industrial Activity',
            meteorological: 'Weather Factors'
        };

        let html = '';
        Object.entries(sources).forEach(([key, value]) => {
            const isMain = key === mainCause;
            html += `
                <div class="source-item">
                    <span class="source-icon">${sourceIcons[key] || '📊'}</span>
                    <div class="source-info">
                        <div class="source-name">
                            ${sourceNames[key] || key}
                            ${isMain ? '<span style="color: var(--accent-green);">★ Primary</span>' : ''}
                        </div>
                        <div class="source-bar">
                            <div class="source-bar-fill" style="width: ${value}%"></div>
                        </div>
                    </div>
                    <span class="source-percent">${value}%</span>
                </div>
            `;
        });

        return html;
    }

    /**
     * Render forecast timeline
     */
    static renderForecastTimeline(forecasts) {
        let html = '';

        Object.entries(forecasts).forEach(([key, forecast]) => {
            const categoryClass = forecast.category.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div class="forecast-item">
                    <div class="forecast-time">${forecast.hours}h</div>
                    <div class="forecast-aqi">${forecast.aqi}</div>
                    <div class="forecast-category ${categoryClass}">${forecast.category}</div>
                </div>
            `;
        });

        return html;
    }

    /**
     * Render alert
     */
    static renderAlert(alert) {
        if (!alert) return '';

        const severityClass = alert.severity.toLowerCase();
        return `
            <div class="alert alert-${severityClass}">
                <div class="alert-title">${alert.message}</div>
                <div class="mt-sm">
                    <strong>Immediate Actions:</strong>
                    <ul class="mt-sm">
                        ${alert.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * Render policy comparison
     */
    static renderPolicyComparison(policyResult) {
        if (!policyResult.applicable) {
            return `<p class="text-muted">${policyResult.reason || 'Policy not applicable'}</p>`;
        }

        const improvementColor = policyResult.improvement.aqi > 0 ? 'var(--accent-green)' : 'var(--aqi-very-poor)';

        return `
            <div class="policy-card">
                <div class="policy-header">
                    <div>
                        <div class="policy-name">${policyResult.policy}</div>
                        <p class="text-muted" style="font-size: 0.875rem;">${policyResult.description}</p>
                    </div>
                    <div class="policy-improvement" style="color: ${improvementColor};">
                        ${policyResult.improvement.aqi > 0 ? '-' : '+'}${Math.abs(policyResult.improvement.aqi)}
                    </div>
                </div>
                
                <div class="policy-comparison">
                    <div class="before">
                        <div class="comparison-label">Before</div>
                        <div class="comparison-value">${policyResult.baseline.aqi}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${policyResult.baseline.category}</div>
                    </div>
                    <div style="display: flex; align-items: center; font-size: 1.5rem;">→</div>
                    <div class="after">
                        <div class="comparison-label">After</div>
                        <div class="comparison-value">${policyResult.afterPolicy.aqi}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${policyResult.afterPolicy.category}</div>
                    </div>
                </div>
                
                <div class="mt-sm">
                    <p><strong>Improvement:</strong> ${policyResult.improvement.percent}%</p>
                    <p><strong>Effectiveness:</strong> ${policyResult.effectiveness}</p>
                    <p><strong>Implementation Cost:</strong> ${policyResult.cost}</p>
                    <p><strong>Public Acceptance:</strong> ${policyResult.publicAcceptance}</p>
                </div>
            </div>
        `;
    }

    /**
     * Render hotspots list
     */
    static renderHotspots(hotspots) {
        if (hotspots.length === 0) {
            return '<p class="text-muted">No high-risk areas detected</p>';
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
        hotspots.slice(0, 5).forEach(hotspot => {
            const categoryClass = hotspot.category.toLowerCase().replace(/\s+/g, '-');
            html += `
                <div style="padding: 0.75rem; background: var(--glass-bg); border-radius: var(--radius-sm); border-left: 3px solid var(--aqi-${categoryClass});">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${hotspot.area}</strong>
                        <span class="aqi-badge ${categoryClass}" style="font-size: 0.875rem; padding: 0.25rem 0.75rem;">${hotspot.aqi}</span>
                    </div>
                    <div style="font-size: 0.875rem; color: var(--text-muted); margin-top: 0.25rem;">
                        Main cause: ${hotspot.mainCause.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        return html;
    }

    /**
     * Render peak hours
     */
    static renderPeakHours(peakHours) {
        if (!peakHours || peakHours.length === 0) {
            return '<p class="text-muted">Insufficient data</p>';
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 0.5rem;">';
        peakHours.forEach(peak => {
            html += `
                <div style="padding: 0.75rem; background: var(--glass-bg); border-radius: var(--radius-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>${peak.timeRange}</strong>
                        <span style="color: var(--aqi-very-poor); font-weight: 700;">AQI ${peak.averageAQI}</span>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        return html;
    }

    /**
     * Render recommendations list
     */
    static renderRecommendations(recommendations) {
        if (recommendations.length === 0) {
            return '<li class="text-muted">No specific recommendations</li>';
        }

        return recommendations.map(rec => {
            const priorityColors = {
                critical: 'var(--aqi-hazardous)',
                high: 'var(--aqi-very-poor)',
                medium: 'var(--aqi-poor)',
                low: 'var(--text-secondary)'
            };

            const color = priorityColors[rec.priority] || 'var(--text-secondary)';

            return `
                <li style="margin-bottom: 0.5rem;">
                    <span style="color: ${color}; font-weight: 700;">[${rec.priority.toUpperCase()}]</span>
                    <strong>${rec.action}:</strong> ${rec.details}
                </li>
            `;
        }).join('');
    }

    /**
     * Render protective measures
     */
    static renderProtectiveMeasures(measures) {
        return measures.map(measure => `<li>${measure}</li>`).join('');
    }

    /**
     * Format timestamp
     */
    static formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }

    /**
     * Show loading state
     */
    static showLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = '<div class="loading"></div>';
        }
    }

    /**
     * Update element text
     */
    static updateText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Update element HTML
     */
    static updateHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    /**
     * Update AQI badge
     */
    static updateAQIBadge(elementId, category) {
        const element = document.getElementById(elementId);
        if (element) {
            const categoryClass = category.toLowerCase().replace(/\s+/g, '-');
            element.className = `aqi-badge ${categoryClass}`;
            element.textContent = category;
        }
    }

    /**
     * Show/hide element
     */
    static toggleElement(elementId, show) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Populate select options
     */
    static populateSelect(selectId, options, valueKey = 'value', labelKey = 'label') {
        const select = document.getElementById(selectId);
        if (!select) return;

        select.innerHTML = '';
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option[valueKey];
            optionElement.textContent = option[labelKey];
            select.appendChild(optionElement);
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIComponents;
}
