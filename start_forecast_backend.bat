@echo off
echo ==========================================
echo   XGBoost PM2.5 Forecast Backend
echo ==========================================
echo.
echo AQI Range: 100 - 1000
echo Starting server on http://localhost:5000
echo.
echo Keep this window open while using the dashboard.
echo Press Ctrl+C to stop the server.
echo ==========================================
echo.

python forecast_backend.py
