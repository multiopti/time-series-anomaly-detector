let normalFilesUploaded = false;
let testFileUploaded = false;

document.getElementById('normalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const files = document.getElementById('normalFiles').files;
    
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
            alert(data.message);
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading files');
    }
});

document.getElementById('testForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const file = document.getElementById('testFile').files[0];
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
            alert(data.message);
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error uploading file');
    }
});

document.getElementById('analyzeBtn').addEventListener('click', async () => {
    try {
        const response = await fetch('/analyze', {
            method: 'POST'
        });
        
        if (response.ok) {
            const result = await response.text();
            document.body.innerHTML = result;
        } else {
            alert('Analysis failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error