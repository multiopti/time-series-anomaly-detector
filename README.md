# Time Series Anomaly Detection Web App

## 🚀 Overview
This is a Flask-based web application for detecting anomalies in time series data. Users can upload CSV files containing Unix timestamps and sensor values. The app compares test data against normal datasets and visualizes anomalies using interactive Plotly charts.

## 📂 Features
- Upload multiple "normal" CSV files and one "test" file.
- Detect anomalies based on statistical deviation (mean ± 2×std).
- Visualize normal, test, and anomalous data on an interactive plot.
- Simple web interface for uploading and analyzing data.

## 🛠️ Setup Instructions

### 1. Clone the Repository
bash
git clone https://github.com/multiopti/time-series-anomaly-detector.git
cd time-series-anomaly-detector

## 2. Access the App
Open your browser and go to: http://localhost:5000

## 3. 📁 File Structure
app.py: Main Flask application.
templates/: HTML templates.
uploads/: Temporary folder for uploaded files.
static/: Static assets (if any).
requirements.txt: Python dependencies.

## 4. 📊 Data Format
Each CSV file must contain:

timestamp: Unix timestamp (integer or float)
sensor_value: Numeric value
Example:

timestamp,sensor_value
1625097600,0.45
1625097660,0.47


## 5. 📈 Anomaly Detection Logic
Aggregates normal data by timestamp.
Calculates mean and standard deviation.
Flags test values that deviate more than 2×std from the mean.

## 6. 📌 Future Improvements
Add model-based anomaly detection (e.g., LSTM, Isolation Forest).
Support sliding window analysis.
Add user authentication and session tracking.
Dockerize for deployment.

## 7.🧑‍💻 Author
Gustavo Sánchez