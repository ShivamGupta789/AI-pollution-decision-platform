"""
XGBoost PM2.5 Forecast Backend
Loads the trained model and provides predictions for the forecast dashboard
AQI Range: 100 - 1000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# Load model
print("Loading XGBoost PM2.5 Forecast Model...")
try:
    with open('xgboost_pm25_forecast (model1).pkl', 'rb') as f:
        model = pickle.load(f)
    print(f"✅ Model loaded: {type(model).__name__}, Features: {model.n_features_in_}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    model = None

# Category to AQI mapping (100-1000 range)
CATEGORY_TO_AQI = {
    0: (100, 200),   # Good
    1: (200, 350),   # Moderate
    2: (350, 500),   # Unhealthy for Sensitive
    3: (500, 700),   # Unhealthy
    4: (700, 900),   # Very Unhealthy
    5: (900, 1000)   # Hazardous
}

def map_category_to_aqi(category):
    """Map prediction category to AQI value in 100-1000 range"""
    min_aqi, max_aqi = CATEGORY_TO_AQI.get(category, (100, 200))
    # Random value within the range
    aqi = np.random.randint(min_aqi, max_aqi + 1)
    return aqi

def generate_forecast_features(base_pm25, base_temp, base_humidity, base_wind, hours_ahead):
    """Generate features for future predictions with realistic variations"""
    # Use consistent patterns instead of pure randomness
    # This makes predictions stable across refreshes
    
    # Daily cycle (sine wave for natural variation)
    hour_factor = np.sin(hours_ahead / 12 * np.pi) * 0.15
    
    # PM2.5 varies with time (less random)
    pm25_variation = hour_factor * base_pm25 * 0.2  # 20% variation
    pm25 = base_pm25 * (1 + hour_factor) + pm25_variation
    
    # Temperature follows daily cycle
    temp_cycle = np.cos(hours_ahead / 12 * np.pi) * 3  # +/- 3 degrees
    temp = base_temp + temp_cycle
    
    # Humidity varies inversely with temperature (less random)
    humidity = base_humidity - (temp_cycle * 2)  # inverse relationship
    
    # Wind speed has slight variation
    wind_cycle = np.sin(hours_ahead / 8 * np.pi) * base_wind * 0.2
    wind = base_wind + wind_cycle
    
    return [
        max(0, pm25),
        max(-20, min(50, temp)),
        max(0, min(100, humidity)),
        max(0.1, wind)
    ]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'aqi_range': [100, 1000]
    })

@app.route('/forecast', methods=['POST'])
def forecast():
    """Generate forecast predictions using the XGBoost model"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.json
        
        # Extract current conditions
        current_pm25 = data.get('pm25', 150)
        current_temp = data.get('temperature', 20)
        current_humidity = data.get('humidity', 60)
        current_wind = data.get('wind_speed', 5)
        forecast_type = data.get('type', 'hourly')  # hourly, daily, extended
        
        forecasts = []
        
        if forecast_type == 'hourly':
            # 48 hours, hourly
            hours_to_predict = 48
            interval_hours = 1
        elif forecast_type == 'daily':
            # 7 days, daily
            hours_to_predict = 7 * 24
            interval_hours = 24
        else:  # extended
            # 14 days, daily
            hours_to_predict = 14 * 24
            interval_hours = 24
        
        for i in range(0, hours_to_predict, interval_hours):
            # Generate features for this time point
            features = generate_forecast_features(
                current_pm25, current_temp, current_humidity, current_wind, i
            )
            
            # Predict category
            features_array = np.array([features])
            category = int(model.predict(features_array)[0])
            
            # Map to AQI (100-1000)
            aqi = map_category_to_aqi(category)
            
            # Calculate timestamp
            forecast_time = datetime.now() + timedelta(hours=i)
            
            forecast_point = {
                'time': forecast_time.isoformat(),
                'aqi': aqi,
                'hour': forecast_time.hour if interval_hours == 1 else None,
                'day': forecast_time.strftime('%a') if interval_hours == 24 else None,
                'date': forecast_time.strftime('%b %d') if interval_hours == 24 else None,
                'category': category,
                'pm25': round(features[0], 1)
            }
            
            forecasts.append(forecast_point)
        
        return jsonify({
            'status': 'success',
            'forecast_type': forecast_type,
            'forecasts': forecasts,
            'aqi_range': [100, 1000],
            'model_used': 'xgboost_pm25_classifier'
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🌬️  XGBoost PM2.5 Forecast Service")
    print("="*60)
    print(f"AQI Range: 100 - 1000")
    print(f"Server: http://localhost:5000")
    print(f"Endpoints:")
    print(f"  GET  /health   - Health check")
    print(f"  POST /forecast - Get forecast predictions")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5000, host='0.0.0.0')
