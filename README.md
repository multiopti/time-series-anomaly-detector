# Time Series Anomaly Detector

This project is a web application designed for Time Series Anomaly Detection. It allows users to upload multiple CSV files containing normal datasets and a single test CSV file to analyze for anomalies. The application provides visualizations of the results, including mandatory line plots.

## Features

- Upload multiple normal CSV files and a single test CSV file.
- Analyze the test data for anomalies based on the uploaded normal datasets.
- Display results with visualizations, including line plots.
- User-friendly interface for easy interaction.

## Project Structure

```
time-series-anomaly-detector
├── app
│   ├── __init__.py
│   ├── routes.py
│   ├── anomaly.py
│   └── utils.py
├── static
│   └── style.css
├── templates
│   ├── index.html
│   └── results.html
├── uploads
├── requirements.txt
└── README.md
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd time-series-anomaly-detector
   ```

2. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Run the application:
   ```
   python -m app
   ```

4. Open your web browser and navigate to `http://127.0.0.1:5000` to access the application.

## Usage Guidelines

- Navigate to the home page to upload your normal datasets and test dataset.
- After uploading, click on the analyze button to process the data.
- View the results on the results page, which includes visualizations of the anomalies detected.

## Dependencies

- Flask or FastAPI
- Pandas
- Scikit-learn
- Matplotlib (for plotting)
- Any other necessary libraries listed in `requirements.txt`

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.