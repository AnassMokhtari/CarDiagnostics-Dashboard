from flask import Flask, render_template, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import time
import threading
import random

# Initialize Flask with explicit paths
app = Flask(__name__, 
            static_url_path='/static',
            static_folder='static',
            template_folder='templates')
CORS(app)

# Car data storage
car_data = {
    "engine_temp": 92.0,
    "oil_pressure": 2.8,
    "battery_voltage": 11.8,
    "last_update": int(time.time()),
    "humidity": 50.0,
    "engine_load": 68,
    "intake_air_temp": 42,
    "fuel_pressure": 3.2,
    "throttle_position": 22,
    "oil_temp": 94,
    "coolant_level": "OK"
}

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/data')
def api_data():
    return jsonify(car_data)

@app.route('/api/update', methods=['POST'])
def api_update():
    global car_data
    data = request.get_json()
    
    if 'temperature' in data:
        car_data['engine_temp'] = float(data['temperature'])
    if 'humidity' in data:
        car_data['humidity'] = float(data['humidity'])
    
    car_data['last_update'] = int(time.time())
    return jsonify({"status": "success"})

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(app.static_folder, filename)

def background_updater():
    while True:
        time.sleep(5)
        car_data['engine_temp'] += random.uniform(-0.5, 0.5)
        car_data['battery_voltage'] = round(11.5 + random.random(), 1)

if __name__ == '__main__':
    # Create required directories
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/images', exist_ok=True)

    # Start background thread
    threading.Thread(target=background_updater, daemon=True).start()
    
    # Run server
    app.run(host='0.0.0.0', port=5000, debug=True)