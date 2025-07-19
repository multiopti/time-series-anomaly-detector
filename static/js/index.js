let normalFilesUploaded = false;
let testFileUploaded = false;

function showStatus(message, type = "info") {
    let statusDiv = document.getElementById('statusMessage');
    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'statusMessage';
        statusDiv.className = 'alert mt-3';
        document.querySelector('.container').prepend(statusDiv);
    }
    statusDiv.className = `alert alert-${type} mt-3`;
    statusDiv.textContent = message;
}

document.getElementById('normalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const files = document.getElementById('normalFiles').files;
    if (!files.length) {
        showStatus('Please select at least one normal data file.', 'warning');
        return;
    }
    const formData = new FormData();
    for (let file of files) {
        formData.append('files', file);
    }

    try {
        const response = await fetch('/upload/normal', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            normalFilesUploaded = true;
            updateAnalyzeButton();
            showStatus(data.message || 'Normal files uploaded successfully.', 'success');
        } else {
            showStatus(data.error || 'Error uploading normal files.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error uploading files', 'danger');
    }
});

document.getElementById('testForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('testFile').files[0];
    if (!file) {
        showStatus('Please select a test data file.', 'warning');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload/test', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            testFileUploaded = true;
            updateAnalyzeButton();
            showStatus(data.message || 'Test file uploaded successfully.', 'success');
        } else {
            showStatus(data.error || 'Error uploading test file.', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error uploading file', 'danger');
    }
});

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    showStatus('Analyzing data, please wait...', 'info');
    try {
        const response = await fetch('/analyze', {
            method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
            // Show results
            document.getElementById('results').innerHTML = `
                <div class="container">
                    <h1 class="mt-5">Analysis Results</h1>
                    <p><strong>Result:</strong> ${data.result}</p>
                    <p><strong>Number of Anomalies:</strong> ${data.anomaly_count}</p>
                    <div id="plot"></div>
                    <a href="/" class="btn btn-primary mt-3">Back to Upload</a>
                </div>
            `;
            // Render Plotly plot
            if (data.plot_json && window.Plotly) {
                const plotData = JSON.parse(data.plot_json);
                Plotly.newPlot('plot', plotData.data, plotData.layout);
            }
        } else {
            showStatus('Analysis failed', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showStatus('Error during analysis', 'danger');
    }
});

function updateAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = !(normalFilesUploaded && testFileUploaded);
}