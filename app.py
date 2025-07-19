from flask import Flask, request, render_template, jsonify
import os
import pandas as pd
import numpy as np
import plotly
import plotly.graph_objs as go
import json
from datetime import datetime
import shutil
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Helper function to validate CSV format
def validate_csv(df):
    if not all(col in df.columns for col in ['timestamp', 'sensor_value']):
        return False
    if not np.issubdtype(df['timestamp'].dtype, np.number):
        return False
    if not np.issubdtype(df['sensor_value'].dtype, np.number):
        return False
    return True

# Helper function to convert Unix timestamp to human-readable
def unix_to_datetime(unix_ts):
    return pd.to_datetime(unix_ts, unit='s')

@app.route('/')
def index():
    # Clear uploads folder on new session
    shutil.rmtree(UPLOAD_FOLDER, ignore_errors=True)
    os.makedirs(UPLOAD_FOLDER)
    return render_template('index.html')

@app.route('/upload/normal', methods=['POST'])
def upload_normal():
    if 'files' not in request.files:
        return jsonify({'error': 'No files uploaded'}), 400
    files = request.files.getlist('files')
    normal_files = []
    
    for file in files:
        if file and file.filename.endswith('.csv'):
            filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            file.save(filename)
            df = pd.read_csv(filename)
            if not validate_csv(df):
                return jsonify({'error': f'Invalid CSV format in {file.filename}'}), 400
            normal_files.append(file.filename)
    
    return jsonify({'message': f'Uploaded {len(normal_files)} normal files', 'files': normal_files})

@app.route('/upload/test', methods=['POST'])
def upload_test():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file and file.filename.endswith('.csv'):
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        df = pd.read_csv(filename)
        if not validate_csv(df):
            return jsonify({'error': 'Invalid CSV format in test file'}), 400
        return jsonify({'message': f'Uploaded test file: {file.filename}'})
    return jsonify({'error': 'Invalid file format'}), 400

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Load normal datasets (case-insensitive filtering)
        normal_files = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.lower().startswith('normal')]
        logger.debug(f"Found normal files: {normal_files}")
        if not normal_files:
            return jsonify({'error': 'No normal files found in uploads directory. Please upload normal files.'}), 400
        
        normal_dfs = []
        for file in normal_files:
            df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], file))
            df['datetime'] = unix_to_datetime(df['timestamp'])
            df = df.sort_values('timestamp')
            normal_dfs.append((file, df))
        
        # Combine normal datasets for anomaly detection
        combined_normal_df = pd.concat([df for _, df in normal_dfs], ignore_index=True)
        combined_normal_df = combined_normal_df.sort_values('timestamp')
        
        # Compute statistics for anomaly detection
        mean_values = combined_normal_df.groupby('timestamp')['sensor_value'].mean()
        std_values = combined_normal_df.groupby('timestamp')['sensor_value'].std().fillna(0)
        
        # Load test dataset
        test_file = [f for f in os.listdir(app.config['UPLOAD_FOLDER']) if f.lower().startswith('test')]
        logger.debug(f"Found test files: {test_file}")
        if not test_file:
            return jsonify({'error': 'No test file found in uploads directory. Please upload a test file.'}), 400
        
        test_df = pd.read_csv(os.path.join(app.config['UPLOAD_FOLDER'], test_file[0]))
        test_df['datetime'] = unix_to_datetime(test_df['timestamp'])
        test_df = test_df.sort_values('timestamp')
        
        # Anomaly detection (threshold-based: >2 std deviations)
        anomalies = []
        for idx, row in test_df.iterrows():
            ts = row['timestamp']
            val = row['sensor_value']
            if ts in mean_values.index:
                mean = mean_values[ts]
                std = std_values[ts]
                if abs(val - mean) > 2 * std:
                    anomalies.append({'timestamp': row['datetime'], 'value': val})
        
        # Determine if test data is anomalous
        is_anomalous = len(anomalies) > 0
        result = "Anomalous" if is_anomalous else "Normal"
        anomaly_count = len(anomalies)
        
        # Create Plotly visualization
        traces = []
        # Plot each normal time series individually
        for filename, df in normal_dfs:
            trace = go.Scatter(
                x=df['datetime'],
                y=df['sensor_value'].tolist(),
                mode='lines',
                name=f'Normal: {filename}',
                line=dict(color='blue')
            )
            traces.append(trace)
        
        # Plot test data

        logger.info("Type of test_df['sensor_value']: %s", type(test_df['sensor_value']))
        logger.info("Head of test_df['sensor_value']:\n%s", test_df['sensor_value'].head())
        logger.info("Columns of test_df: %s", test_df.columns.tolist())
        logger.info(f"y: {test_df['sensor_value'].tolist()}")

        trace_test = go.Scatter(
            x=test_df['datetime'],
            y=test_df['sensor_value'].tolist(),
            mode='lines',
            name='Test Data',
            line=dict(color='green')
        )
        traces.append(trace_test)

        
        
        # Plot anomalies
        trace_anomalies = go.Scatter(
            x=[a['timestamp'] for a in anomalies],
            y=[a['value'] for a in anomalies],
            mode='markers',
            name='Anomalies',
            marker=dict(color='red', size=10)
        )
        traces.append(trace_anomalies)
        
        layout = go.Layout(
            title='Time Series Analysis',
            xaxis=dict(title='Timestamp'),
            yaxis=dict(title='Sensor Value'),
            showlegend=True
        )
        
        fig = go.Figure(data=traces, layout=layout)
        plot_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        
        logger.info(f"Analysis complete. Result: {result}, Anomalies: {anomaly_count}")
        return render_template('results.html', result=result, anomaly_count=anomaly_count, plot_json=plot_json)
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return render_template('results.html', result="Error", anomaly_count=0, plot_json={}, error=f"Analysis error: {str(e)}")

@app.route('/window-based')
def window_based():
    return render_template('window_based.html')

if __name__ == '__main__':
    app.run(debug=True)