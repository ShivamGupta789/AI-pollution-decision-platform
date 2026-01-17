// Global Alert System - Shows critical pollution alerts
class GlobalAlertSystem {
    constructor() {
        this.alertBanner = null;
        this.alertIcon = null;
        this.alertMessage = null;
        this.closeBtn = null;
        this.isVisible = false;
    }

    init() {
        this.alertBanner = document.getElementById('globalAlertBanner');
        this.alertIcon = document.getElementById('globalAlertIcon');
        this.alertMessage = document.getElementById('globalAlertMessage');
        this.closeBtn = document.getElementById('closeAlert');

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hide());
        }

        // Check for high risk conditions periodically
        this.checkAlerts();
        setInterval(() => this.checkAlerts(), 300000); // Check every 5 minutes
    }

    checkAlerts() {
        if (!window.AirQualityAPI) return;

        const currentData = window.AirQualityAPI.generateCurrentData();
        const aqi = currentData.aqi;

        if (aqi > 200) {
            const category = window.AirQualityAPI.getAQICategory(aqi);
            let message = '';
            let icon = '🚨';

            if (aqi > 300) {
                icon = '☢️';
                message = `Health Emergency! AQI is ${aqi} (${category.name}). Everyone should avoid all outdoor activities. Stay indoors and use air purifiers.`;
            } else if (aqi > 200) {
                icon = '⚠️';
                message = `Health Alert! AQI is ${aqi} (${category.name}). Everyone may experience serious health effects. Limit outdoor activities.`;
            }

            this.show(message, icon, '#ef4444');
        } else {
            // Hide alert if AQI improves
            if (this.isVisible && aqi <= 200) {
                this.hide();
            }
        }
    }

    show(message, icon = '🚨', color = '#ef4444') {
        if (!this.alertBanner) return;

        if (this.alertIcon) this.alertIcon.textContent = icon;
        if (this.alertMessage) this.alertMessage.textContent = message;

        this.alertBanner.style.display = 'block';
        this.alertBanner.style.background = `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color)} 100%)`;
        this.isVisible = true;
    }

    hide() {
        if (this.alertBanner) {
            this.alertBanner.style.display = 'none';
            this.isVisible = false;
        }
    }

    darkenColor(color) {
        // Simple color darkening
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 30);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 30);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 30);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // Manual alert trigger
    triggerAlert(message, icon, color) {
        this.show(message, icon, color);
    }
}

// Initialize global alert system
window.GlobalAlert = new GlobalAlertSystem();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.GlobalAlert.init();
    });
} else {
    window.GlobalAlert.init();
}
