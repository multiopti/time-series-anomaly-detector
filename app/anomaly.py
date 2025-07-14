def detect_anomalies(normal_datasets, test_dataset):
    import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt

    # Combine normal datasets
    combined_normal_data = pd.concat(normal_datasets, ignore_index=True)

    # Compute statistical properties
    mean = combined_normal_data.mean()
    std_dev = combined_normal_data.std()

    # Analyze test dataset for anomalies
    test_data = pd.read_csv(test_dataset)
    anomalies = (test_data - mean).abs() > (3 * std_dev)

    # Plotting results
    plt.figure(figsize=(12, 6))
    plt.plot(test_data, label='Test Data', color='blue')
    plt.scatter(test_data.index[anomalies], test_data[anomalies], color='red', label='Anomalies')
    plt.title('Anomaly Detection in Time Series Data')
    plt.xlabel('Time')
    plt.ylabel('Value')
    plt.legend()
    plt.savefig('static/anomaly_plot.png')
    plt.close()

    return anomalies