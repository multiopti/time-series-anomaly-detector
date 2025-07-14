def read_csv(file_path):
    import pandas as pd
    try:
        data = pd.read_csv(file_path)
        return data
    except Exception as e:
        raise ValueError(f"Error reading the CSV file: {e}")

def validate_timestamps(data, timestamp_column):
    if timestamp_column not in data.columns:
        raise ValueError(f"Timestamp column '{timestamp_column}' not found in the data.")
    
    if not pd.to_datetime(data[timestamp_column], errors='coerce').notnull().all():
        raise ValueError("Invalid timestamps found in the specified column.")

def convert_unix_to_human(unix_time):
    from datetime import datetime
    return datetime.utcfromtimestamp(unix_time).strftime('%Y-%m-%d %H:%M:%S')