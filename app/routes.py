from flask import Blueprint, request, render_template, redirect, url_for
import os
import pandas as pd
from app.anomaly import analyze_anomalies

routes = Blueprint('routes', __name__)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@routes.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        normal_files = request.files.getlist('normal_files')
        test_file = request.files.get('test_file')

        if not normal_files or not test_file:
            return "Please upload normal datasets and a test dataset.", 400

        normal_dataframes = []
        for file in normal_files:
            if file and allowed_file(file.filename):
                filepath = os.path.join(UPLOAD_FOLDER, file.filename)
                file.save(filepath)
                normal_dataframes.append(pd.read_csv(filepath))

        if test_file and allowed_file(test_file.filename):
            test_filepath = os.path.join(UPLOAD_FOLDER, test_file.filename)
            test_file.save(test_filepath)
            test_dataframe = pd.read_csv(test_filepath)

            results = analyze_anomalies(normal_dataframes, test_dataframe)
            return render_template('results.html', results=results)

    return render_template('index.html')

@routes.route('/upload', methods=['POST'])
def upload():
    return redirect(url_for('routes.index'))