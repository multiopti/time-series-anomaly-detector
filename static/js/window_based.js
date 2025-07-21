let trainingData = null;
let selectedWindows = [];
let testFileUploaded = false;
let trainingFileUploaded = false;

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

document.getElementById('trainingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = document.getElementById('trainingFile').files[0];
    if (!file) {
        showStatus('Please select a training data file.', 'warning');
        return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload/training', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (response.ok) {
            trainingFileUploaded = true;
            trainingData = data;
            showStatus('Training data uploaded. Select anomaly windows.', 'success');
            document.getElementById('plotContainer').style.display = 'block';
            plotTrainingData(data);
            updateAnalyzeButton();
        } else {
            showStatus(data.error || 'Error uploading training data.', 'danger');
        }
    } catch (error) {
        showStatus('Error uploading training data.', 'danger');
    }
});

function plotTrainingData(data) {
    Plotly.newPlot('timeSeriesPlot', [{
        x: data.timestamps,
        y: data.values,
        type: 'scatter',
        mode: 'lines+markers', // <-- this is the key change
        name: 'Training Data'
    }], {
        title: 'Training Time Series',
        dragmode: 'select',
        xaxis: { title: 'Timestamp' },
        yaxis: { title: 'Sensor Value' }
    }).then(function (plotDiv) {
        plotDiv.on('plotly_selected', function (eventData) {
            console.log('plotly_selected event fired', eventData);
            if (eventData && eventData.points.length > 0) {
                const startIdx = eventData.points[0].pointNumber;
                const endIdx = eventData.points[eventData.points.length - 1].pointNumber;
                selectedWindows.push({ start_idx: startIdx, end_idx: endIdx });
                showStatus(`Selected window: ${startIdx} to ${endIdx}`, 'info');
                updateSelectedWindowsList();
                updateAnalyzeButton();
            }
        });
    });
}
document.getElementById('clearWindowsBtn').addEventListener('click', () => {
    selectedWindows = [];
    updateSelectedWindowsList();
    showStatus('Cleared selected windows.', 'info');
    updateAnalyzeButton();
});

function updateSelectedWindowsList() {
    const container = document.querySelector('.selected-windows-list');
    if (!container) return;
    container.innerHTML = selectedWindows.map((w, i) =>
        `<div>Window ${i + 1}: Points ${w.start_idx} to ${w.end_idx}</div>`
    ).join('');
}

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
            showStatus('Test data uploaded.', 'success');
            updateAnalyzeButton();
        } else {
            showStatus(data.error || 'Error uploading test data.', 'danger');
        }
    } catch (error) {
        showStatus('Error uploading test data.', 'danger');
    }
});

function updateAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    analyzeBtn.disabled = !(trainingFileUploaded && testFileUploaded && selectedWindows.length > 0);
}

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    showStatus('Analyzing test data, please wait...', 'info');
    try {
        const response = await fetch('/analyze/window', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                selected_windows: selectedWindows,
                window_size: 50 // or let user choose
            })
        });
        const data = await response.json();
        if (response.ok) {
            document.getElementById('results').innerHTML = `
                <div class="container">
                    <h1 class="mt-5">Window-based Analysis Results</h1>
                    <p><strong>Number of Anomalies:</strong> ${data.anomaly_count}</p>
                    <div id="plot"></div>
                </div>
            `;
            // Render Plotly plot
            if (data.plot && window.Plotly) {
                const plotData = JSON.parse(data.plot);
                Plotly.newPlot('plot', plotData.data, plotData.layout);
            }
            showStatus('Analysis complete.', 'success');
        } else {
            showStatus(data.error || 'Analysis failed.', 'danger');
        }
    } catch (error) {
        showStatus('Error during analysis.', 'danger');
    }
});