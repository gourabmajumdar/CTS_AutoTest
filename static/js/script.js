// Global variables
let uploadedFiles = [];
let currentOperation = null;

// DOM elements
const uploadArea = document.querySelector('.upload-area');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const textArea = document.getElementById('textArea');
const charCount = document.getElementById('charCount');
const codeActions = document.getElementById('codeActions');
const progressContainer = document.getElementById('progressContainer');
const progressTitle = document.getElementById('progressTitle');
const progressStatus = document.getElementById('progressStatus');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const progressSteps = document.getElementById('progressSteps');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeEventListeners();
    updateCharCount();
    // Initialize to Home page by default
    initializeHomePage();
});

function initializeHomePage() {
    // Make sure Home is active and AutoTest content is hidden
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active'); // First nav item (Home)

    // Set title and content states
    const dashboardTitle = document.getElementById('dashboardTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const autoTestContent = document.getElementById('autoTestContent');

    if (dashboardTitle) dashboardTitle.textContent = 'Home';
    if (welcomeMessage) welcomeMessage.classList.add('show');
    if (autoTestContent) autoTestContent.classList.add('hide');

    console.log('Initialized to Home page');
}

// Initialize all event listeners
function initializeEventListeners() {
    console.log('Setting up event listeners...');

    // File upload events
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Textarea events
    if (textArea) {
        textArea.addEventListener('input', handleTextAreaInput);
    }

    // Prevent default drag behaviors on document
    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);

    console.log('Event listeners initialized');
}

// Utility functions
function preventDefault(e) {
    e.preventDefault();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': '📄', 'rtf': '📄',
        'doc': '📝', 'docx': '📝',
        'xls': '📊', 'xlsx': '📊',
        'csv': '📈',
        'txt': '📄',
        'js': '💻', 'py': '🐍', 'html': '🌐', 'css': '🎨',
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
        'zip': '📦', 'rar': '📦'
    };
    return iconMap[ext] || '📄';
}

// Toast notification functions
function showToast(message, type = 'info') {
    console.log('Toast:', message, type);
    if (toastMessage && toast) {
        toastMessage.textContent = message;
        toast.className = `toast show ${type}`;

        // Auto-hide after 5 seconds
        setTimeout(() => {
            hideToast();
        }, 5000);
    }
}

function hideToast() {
    if (toast) {
        toast.classList.remove('show');
    }
}

// Progress indicator functions
function showProgress(title, steps) {
    if (!progressContainer || !progressTitle || !progressSteps) return;

    progressTitle.textContent = title;
    progressContainer.classList.add('show');

    // Create step elements
    progressSteps.innerHTML = '';
    steps.forEach((step, index) => {
        const stepElement = document.createElement('div');
        stepElement.className = 'progress-step';
        stepElement.innerHTML = `
            <div class="step-icon pending" id="step-${index}">●</div>
            <span>${step}</span>
        `;
        progressSteps.appendChild(stepElement);
    });
}

function updateProgress(percentage, status, activeStepIndex = -1) {
    if (!progressBar || !progressPercentage || !progressStatus) return;

    progressBar.style.width = percentage + '%';
    progressPercentage.textContent = Math.round(percentage) + '%';
    progressStatus.textContent = status;

    // Update step states
    const stepElements = progressSteps.querySelectorAll('.progress-step');
    stepElements.forEach((step, index) => {
        const icon = step.querySelector('.step-icon');
        step.classList.remove('active', 'completed');
        icon.classList.remove('active', 'completed', 'pending');

        if (index < activeStepIndex) {
            step.classList.add('completed');
            icon.classList.add('completed');
            icon.textContent = '✓';
        } else if (index === activeStepIndex) {
            step.classList.add('active');
            icon.classList.add('active');
            icon.textContent = '●';
        } else {
            icon.classList.add('pending');
            icon.textContent = '●';
        }
    });
}

function hideProgress() {
    setTimeout(() => {
        if (progressContainer) {
            progressContainer.classList.remove('show');
        }
    }, 1000);
}

// Navigation functions
function showHome() {
    console.log('Showing Home page');

    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[0].classList.add('active');

    // Update content
    const dashboardTitle = document.getElementById('dashboardTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const autoTestContent = document.getElementById('autoTestContent');

    if (dashboardTitle) dashboardTitle.textContent = 'Home';
    if (welcomeMessage) welcomeMessage.classList.add('show');
    if (autoTestContent) autoTestContent.classList.add('hide');
}

function showAutoTest() {
    console.log('Showing AutoTest page');

    // Update navigation state
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.nav-item')[1].classList.add('active');

    // Update content
    const dashboardTitle = document.getElementById('dashboardTitle');
    const welcomeMessage = document.getElementById('welcomeMessage');
    const autoTestContent = document.getElementById('autoTestContent');

    if (dashboardTitle) dashboardTitle.textContent = 'Auto Test';
    if (welcomeMessage) welcomeMessage.classList.remove('show');
    if (autoTestContent) autoTestContent.classList.remove('hide');
}

// File handling functions
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave() {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    console.log('Files dropped:', files.length);
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    console.log('Files selected:', files.length);
    handleFiles(files);
}

async function handleFiles(files) {
    if (files.length === 0) {
        console.log('No files to handle');
        return;
    }

    console.log('Handling files:', Array.from(files).map(f => f.name));

    try {
        showProgress('Uploading Files', ['Preparing files', 'Uploading to server', 'Processing files']);

        const formData = new FormData();
        Array.from(files).forEach(file => {
            console.log('Adding file to FormData:', file.name, file.size);
            formData.append('files', file);
        });

        updateProgress(30, 'Uploading files to server', 1);

        console.log('Sending upload request...');
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        console.log('Upload response status:', response.status);
        updateProgress(70, 'Processing uploaded files', 2);

        const result = await response.json();
        console.log('Upload result:', result);

        if (result.success) {
            uploadedFiles = result.files;
            displayFileInfo(result.files, result.total_size);
            resetButtonStates();
            updateProgress(100, 'Upload completed successfully', 2);
            showToast(result.message, 'success');
        } else {
            console.error('Upload failed:', result.message);
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed: ' + error.message, 'error');
    } finally {
        hideProgress();
    }
}

function displayFileInfo(files, totalSize) {
    if (!fileInfo) return;

    let fileListHtml = '<div class="file-preview">';
    files.forEach(file => {
        fileListHtml += `
            <div class="file-item">
                <span class="file-icon">${getFileIcon(file.name)}</span>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
        `;
    });
    fileListHtml += '</div>';

    fileInfo.innerHTML = `
        <strong>Files Selected:</strong> ${files.length} file(s)<br>
        <strong>Total Size:</strong> ${formatFileSize(totalSize)}
        ${fileListHtml}
    `;
    fileInfo.style.display = 'block';
}

function resetButtonStates() {
    const generateBtn = document.getElementById('generateBtn');
    const executeBtn = document.getElementById('executeBtn');
    const reviewBtn = document.getElementById('reviewBtn');
    const ingestBtn = document.getElementById('ingestBtn');
    const reportButtons = document.getElementById('reportButtons');

    // Reset Generate Code button (only enabled after successful ingest)
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generate Code';
        generateBtn.style.opacity = '0.6';
        generateBtn.style.cursor = 'not-allowed';
    }

    // Reset Execute Code button (disabled until code is generated)
    if (executeBtn) {
        executeBtn.disabled = true;
        executeBtn.textContent = 'Execute Code';
        executeBtn.style.opacity = '0.6';
        executeBtn.style.cursor = 'not-allowed';
    }

    // Reset Review Code button (disabled until code is executed)
    if (reviewBtn) {
        reviewBtn.disabled = true;
        reviewBtn.textContent = 'Review Code';
        reviewBtn.style.opacity = '0.6';
        reviewBtn.style.cursor = 'not-allowed';
    }

    // Reset Ingest button (enabled when files are uploaded)
    if (ingestBtn) {
        ingestBtn.disabled = false;
        ingestBtn.textContent = 'Ingest Test';
        ingestBtn.style.opacity = '1';
        ingestBtn.style.cursor = 'pointer';
    }

    if (textArea) textArea.value = '';
    updateCharCount();
    if (codeActions) codeActions.classList.remove('show');
    if (reportButtons) reportButtons.classList.remove('show');
}

// Text area functions
function handleTextAreaInput() {
    updateCharCount();
    autoResizeTextarea();
}

function updateCharCount() {
    if (!textArea || !charCount) return;

    const count = textArea.value.length;
    charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
}

function autoResizeTextarea() {
    if (!textArea) return;

    textArea.style.height = 'auto';
    textArea.style.height = Math.max(180, textArea.scrollHeight) + 'px';
}

// Main functionality functions
async function ingestTest() {
    if (uploadedFiles.length === 0) {
        showToast('Please upload files first!', 'warning');
        return;
    }

    const ingestBtn = document.getElementById('ingestBtn');
    if (!ingestBtn) return;

    ingestBtn.disabled = true;
    ingestBtn.textContent = 'Ingesting...';

    try {
        showProgress('Ingesting Test Data', [
            'Reading uploaded files',
            'Parsing file contents',
            'Extracting test requirements',
            'Generating test metadata'
        ]);

        updateProgress(25, 'Reading uploaded files', 0);
        await delay(500);

        updateProgress(50, 'Parsing file contents', 1);
        await delay(700);

        updateProgress(75, 'Extracting test requirements', 2);

        const response = await fetch('/ingest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files: uploadedFiles })
        });

        const result = await response.json();

        updateProgress(100, 'Test data ingested successfully', 3);

        if (result.success) {
            if (textArea) {
                textArea.value = `Test ingestion completed!\n\nFiles processed: ${uploadedFiles.length}\n${result.processed_files.map(f => `- ${f.name}: ${f.test_cases}`).join('\n')}\n\nReady for Python test code generation.`;
                updateCharCount();
                autoResizeTextarea();
            }

            // Enable Generate Code button after successful ingestion
            const generateBtn = document.getElementById('generateBtn');
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.style.opacity = '1';
                generateBtn.style.cursor = 'pointer';
            }

            showToast(result.message, 'success');
        } else {
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('Ingestion error:', error);
        showToast('Ingestion failed: ' + error.message, 'error');
    } finally {
        ingestBtn.disabled = false;
        ingestBtn.textContent = 'Ingest Test';
        hideProgress();
    }
}

async function generateCode() {
    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;

    generateBtn.disabled = true;
    generateBtn.classList.add('btn-loading');

    try {
        const steps = [
            'Analyzing test requirements',
            'Creating Python test structure',
            'Generating unittest test cases',
            'Optimizing Python code',
            'Finalizing test suite'
        ];

        showProgress('Generating Python Test Code', steps);

        for (let i = 0; i < steps.length; i++) {
            const progress = ((i + 1) / steps.length) * 100;
            updateProgress(progress, steps[i], i);
            await delay(300 + Math.random() * 200);
        }

        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input_text: textArea ? textArea.value : '' })
        });

        const result = await response.json();

        if (result.success) {
            if (textArea) {
                // Clear previous content and show only the generated code
                textArea.value = result.generated_code;
                updateCharCount();
                autoResizeTextarea();
            }

            // Button state management after code generation
            const executeBtn = document.getElementById('executeBtn');
            const ingestBtn = document.getElementById('ingestBtn');
            const reviewBtn = document.getElementById('reviewBtn');

            // Disable Generate Code button permanently after generation
            generateBtn.disabled = true;
            generateBtn.classList.remove('btn-loading');
            generateBtn.textContent = 'Code Generated ✓';
            generateBtn.style.opacity = '0.6';
            generateBtn.style.cursor = 'not-allowed';

            // Enable only Execute Code button
            if (executeBtn) {
                executeBtn.disabled = false;
                executeBtn.style.opacity = '1';
                executeBtn.style.cursor = 'pointer';
            }

            // Keep other buttons disabled
            if (ingestBtn) {
                ingestBtn.disabled = true;
                ingestBtn.style.opacity = '0.6';
            }
            if (reviewBtn) {
                reviewBtn.disabled = true;
                reviewBtn.style.opacity = '0.6';
            }

            // Show code actions (save/download buttons)
            if (codeActions) codeActions.classList.add('show');

            showToast(result.message + ' - Ready for execution!', 'success');
        } else {
            // Reset button state if generation failed
            generateBtn.disabled = false;
            generateBtn.classList.remove('btn-loading');
            generateBtn.textContent = 'Generate Code';
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('Generation error:', error);
        // Reset button state if error occurred
        generateBtn.disabled = false;
        generateBtn.classList.remove('btn-loading');
        generateBtn.textContent = 'Generate Code';
        generateBtn.style.opacity = '1';
        generateBtn.style.cursor = 'pointer';
        showToast('Code generation failed: ' + error.message, 'error');
    } finally {
        hideProgress();
    }
}

async function executeCode() {
    console.log('Execute code function called');

    if (!textArea || !textArea.value.trim()) {
        showToast('Please generate Python test code first!', 'warning');
        return;
    }

    // Check if we have Python code
    const hasGeneratedCode = textArea.value.includes('# Generated Python Test Code') ||
                           textArea.value.includes('import unittest') ||
                           textArea.value.includes('class AutoGeneratedTestSuite');

    if (!hasGeneratedCode) {
        showToast('Please generate Python test code first!', 'warning');
        return;
    }

    const executeBtn = document.getElementById('executeBtn');
    if (!executeBtn) return;

    console.log('Starting code execution...');
    executeBtn.disabled = true;
    executeBtn.classList.add('btn-loading');

    try {
        const steps = [
            'Preparing Python execution environment',
            'Validating Python test code',
            'Running Python test cases',
            'Collecting test results',
            'Generating execution output'
        ];

        showProgress('Executing Python Test Code', steps);

        for (let i = 0; i < steps.length; i++) {
            const progress = ((i + 1) / steps.length) * 100;
            updateProgress(progress, steps[i], i);
            await delay(200 + Math.random() * 150);
        }

        console.log('Sending execute request...');
        const response = await fetch('/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: textArea.value })
        });

        console.log('Execute response status:', response.status);
        const result = await response.json();
        console.log('Execute result:', result);

        if (result.success) {
            if (textArea) {
                textArea.value = result.execution_result;
                updateCharCount();
                autoResizeTextarea();
            }

            // Button state management after code execution
            const generateBtn = document.getElementById('generateBtn');
            const reviewBtn = document.getElementById('reviewBtn');

            // Disable Execute Code button permanently after execution
            executeBtn.disabled = true;
            executeBtn.classList.remove('btn-loading');
            executeBtn.textContent = 'Code Executed ✓';
            executeBtn.style.opacity = '0.6';
            executeBtn.style.cursor = 'not-allowed';

            // Keep Generate Code button disabled
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';
            }

            // Enable only Review Code button
            if (reviewBtn) {
                reviewBtn.disabled = false;
                reviewBtn.style.opacity = '1';
                reviewBtn.style.cursor = 'pointer';
            }

            // Hide code actions since we're now in execution results mode
            if (codeActions) codeActions.classList.remove('show');

            showToast(result.message + ' - Ready for code review!', 'success');
        } else {
            console.error('Execute failed:', result.message);
            // Reset button state if execution failed
            executeBtn.disabled = false;
            executeBtn.classList.remove('btn-loading');
            executeBtn.textContent = 'Execute Code';
            executeBtn.style.opacity = '1';
            executeBtn.style.cursor = 'pointer';
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('Execution error:', error);
        // Reset button state if error occurred
        executeBtn.disabled = false;
        executeBtn.classList.remove('btn-loading');
        executeBtn.textContent = 'Execute Code';
        executeBtn.style.opacity = '1';
        executeBtn.style.cursor = 'pointer';
        showToast('Code execution failed: ' + error.message, 'error');
    } finally {
        hideProgress();
    }
}

async function reviewCode() {
    if (!textArea || !textArea.value.trim()) {
        showToast('No code to review. Please execute Python code first!', 'warning');
        return;
    }

    const reviewBtn = document.getElementById('reviewBtn');
    if (!reviewBtn) return;

    reviewBtn.disabled = true;
    reviewBtn.classList.add('btn-loading');

    try {
        const steps = [
            'Scanning Python code structure',
            'Analyzing syntax and PEP 8 compliance',
            'Checking Python best practices',
            'Evaluating test framework usage',
            'Generating Python recommendations',
            'Compiling final review report'
        ];

        showProgress('Reviewing Python Code Quality', steps);

        for (let i = 0; i < steps.length; i++) {
            const progress = ((i + 1) / steps.length) * 100;
            updateProgress(progress, steps[i], i);
            await delay(350 + Math.random() * 200);
        }

        const response = await fetch('/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: textArea.value })
        });

        const result = await response.json();

        if (result.success) {
            if (textArea) {
                textArea.value = result.review_report;
                updateCharCount();
                autoResizeTextarea();
            }

            // Final button state management after review
            const generateBtn = document.getElementById('generateBtn');
            const executeBtn = document.getElementById('executeBtn');
            const ingestBtn = document.getElementById('ingestBtn');
            const reportButtons = document.getElementById('reportButtons');

            // Disable all main buttons permanently after review
            if (generateBtn) {
                generateBtn.disabled = true;
                generateBtn.style.opacity = '0.6';
            }
            if (executeBtn) {
                executeBtn.disabled = true;
                executeBtn.style.opacity = '0.6';
            }
            if (ingestBtn) {
                ingestBtn.disabled = true;
                ingestBtn.style.opacity = '0.6';
            }

            // Disable and mark Review button as completed
            reviewBtn.disabled = true;
            reviewBtn.classList.remove('btn-loading');
            reviewBtn.textContent = 'Review Completed ✓';
            reviewBtn.style.opacity = '0.6';
            reviewBtn.style.cursor = 'not-allowed';

            // Show report download buttons
            if (reportButtons) reportButtons.classList.add('show');

            showToast(result.message + ' - Report ready for download!', 'success');
        } else {
            // Reset button state if review failed
            reviewBtn.disabled = false;
            reviewBtn.classList.remove('btn-loading');
            reviewBtn.textContent = 'Review Code';
            reviewBtn.style.opacity = '1';
            reviewBtn.style.cursor = 'pointer';
            showToast(result.message, 'error');
        }

    } catch (error) {
        console.error('Review error:', error);
        // Reset button state if error occurred
        reviewBtn.disabled = false;
        reviewBtn.classList.remove('btn-loading');
        reviewBtn.textContent = 'Review Code';
        reviewBtn.style.opacity = '1';
        reviewBtn.style.cursor = 'pointer';
        showToast('Code review failed: ' + error.message, 'error');
    } finally {
        hideProgress();
    }
}

// Code action functions
function saveCode() {
    if (!textArea) return;

    const code = textArea.value.trim();

    if (!code) {
        showToast('No code to save!', 'warning');
        return;
    }

    // Save to localStorage as backup
    localStorage.setItem('dashboard_code', code);
    localStorage.setItem('dashboard_code_timestamp', new Date().toISOString());

    showToast('Python code saved successfully!', 'success');
}

function downloadCode() {
    if (!textArea) return;

    const fullText = textArea.value.trim();

    if (!fullText) {
        showToast('No code to download!', 'warning');
        return;
    }

    // Look for Python code marker instead of JavaScript
    const codeMarker = '# Generated Python Test Code';
    let codeToDownload = fullText;
    const codeStartIndex = fullText.indexOf(codeMarker);

    if (codeStartIndex !== -1) {
        codeToDownload = fullText.substring(codeStartIndex);
    }

    const element = document.createElement('a');
    const file = new Blob([codeToDownload], { type: 'text/x-python' });
    element.href = URL.createObjectURL(file);
    // Save as .py file instead of .js
    element.download = `generated-test-suite-${new Date().toISOString().slice(0,10)}.py`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast('Python test code downloaded successfully!', 'success');
}

// Report functions
function downloadReport() {
    if (!textArea) return;

    const reportContent = textArea.value.trim();

    if (!reportContent) {
        showToast('No report to download!', 'warning');
        return;
    }

    // Convert plain text report to HTML format
    const htmlReport = generateHTMLReport(reportContent);

    const element = document.createElement('a');
    const file = new Blob([htmlReport], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `python-code-review-report-${new Date().toISOString().slice(0,10)}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast('HTML report downloaded successfully!', 'success');
}

function generateHTMLReport(reportContent) {
    // Get current date and time
    const now = new Date();
    const reportDate = now.toLocaleDateString();
    const reportTime = now.toLocaleTimeString();

    // Process the report content to add HTML formatting
    let formattedContent = reportContent
        // Convert headers
        .replace(/=== (.*?) ===/g, '<h2 class="section-header">$1</h2>')
        // Convert checkmarks and X marks
        .replace(/✅/g, '<span class="check-icon">✅</span>')
        .replace(/✓/g, '<span class="success-icon">✓</span>')
        .replace(/✗/g, '<span class="error-icon">✗</span>')
        .replace(/⭐/g, '<span class="star-icon">⭐</span>')
        .replace(/📊/g, '<span class="chart-icon">📊</span>')
        .replace(/🔍/g, '<span class="search-icon">🔍</span>')
        .replace(/💡/g, '<span class="idea-icon">💡</span>')
        .replace(/⚠️/g, '<span class="warning-icon">⚠️</span>')
        .replace(/🐍/g, '<span class="python-icon">🐍</span>')
        // Convert bullet points
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        // Convert sections with colons
        .replace(/^([A-Z][A-Z\s]+):$/gm, '<h3 class="subsection-header">$1</h3>')
        // Convert key-value pairs
        .replace(/^- ([^:]+): (.+)$/gm, '<div class="metric-item"><span class="metric-key">$1:</span> <span class="metric-value">$2</span></div>')
        // Convert status indicators
        .replace(/PASSED/g, '<span class="status-passed">PASSED</span>')
        .replace(/FAILED/g, '<span class="status-failed">FAILED</span>')
        .replace(/EXCELLENT/g, '<span class="rating-excellent">EXCELLENT</span>')
        .replace(/GOOD/g, '<span class="rating-good">GOOD</span>')
        .replace(/HIGH/g, '<span class="rating-high">HIGH</span>')
        .replace(/LOW/g, '<span class="rating-low">LOW</span>')
        // Convert line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    // Wrap orphaned <li> tags in <ul>
    formattedContent = formattedContent.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');

    // Create the complete HTML document
    const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Python Code Review Report - ${reportDate}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
            opacity: 0.3;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        .report-meta {
            background: #f8fafc;
            padding: 20px 30px;
            border-bottom: 1px solid #e5e7eb;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .meta-label {
            font-weight: 600;
            color: #374151;
        }
        
        .meta-value {
            color: #6b7280;
        }
        
        .content {
            padding: 40px;
        }
        
        .section-header {
            color: #1e40af;
            font-size: 1.5rem;
            margin: 30px 0 20px 0;
            padding-bottom: 10px;
            border-bottom: 2px solid #3b82f6;
            position: relative;
        }
        
        .section-header:first-child {
            margin-top: 0;
        }
        
        .subsection-header {
            color: #374151;
            font-size: 1.2rem;
            margin: 25px 0 15px 0;
            font-weight: 600;
        }
        
        .metric-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f3f4f6;
        }
        
        .metric-key {
            font-weight: 500;
            color: #374151;
        }
        
        .metric-value {
            color: #6b7280;
            font-weight: 600;
        }
        
        .status-passed {
            background: #10b981;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-failed {
            background: #ef4444;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .rating-excellent {
            background: #059669;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
        }
        
        .rating-good {
            background: #0d9488;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
        }
        
        .rating-high {
            background: #3b82f6;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
        }
        
        .rating-low {
            background: #6b7280;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-weight: 600;
        }
        
        .check-icon, .success-icon {
            color: #10b981;
            font-weight: bold;
        }
        
        .error-icon {
            color: #ef4444;
            font-weight: bold;
        }
        
        .warning-icon {
            color: #f59e0b;
        }
        
        .star-icon {
            color: #fbbf24;
        }
        
        .python-icon {
            color: #3776ab;
        }
        
        ul {
            margin: 15px 0;
            padding-left: 20px;
        }
        
        li {
            margin: 5px 0;
            color: #374151;
        }
        
        p {
            margin: 15px 0;
            color: #374151;
            line-height: 1.8;
        }
        
        .footer {
            background: #f8fafc;
            padding: 20px 30px;
            text-align: center;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer .logo {
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 5px;
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
            
            .header {
                background: #1e40af !important;
                -webkit-print-color-adjust: exact;
                color-adjust: exact;
            }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 10px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .content {
                padding: 20px;
            }
            
            .report-meta {
                padding: 15px 20px;
                grid-template-columns: 1fr;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🐍 Python Code Review Report</h1>
            <div class="subtitle">Generated by Cognizant Auto Test Dashboard</div>
        </div>
        
        <div class="report-meta">
            <div class="meta-item">
                <span class="meta-label">📅 Generated:</span>
                <span class="meta-value">${reportDate} at ${reportTime}</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">🐍 Language:</span>
                <span class="meta-value">Python</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">🔧 Framework:</span>
                <span class="meta-value">unittest</span>
            </div>
            <div class="meta-item">
                <span class="meta-label">📊 Report Type:</span>
                <span class="meta-value">Code Quality Analysis</span>
            </div>
        </div>
        
        <div class="content">
            <p>${formattedContent}</p>
        </div>
        
        <div class="footer">
            <div class="logo">cognizant</div>
            <div>Auto Test Generation — Execution — Code Review</div>
            <div style="margin-top: 10px; font-size: 0.9rem;">
                This report was automatically generated and should be reviewed by a qualified developer.
            </div>
        </div>
    </div>
</body>
</html>`;

    return htmlTemplate;
}

function openReport() {
    if (!textArea) return;

    const reportContent = textArea.value.trim();

    if (!reportContent) {
        showToast('No report to open!', 'warning');
        return;
    }

    // Generate the same HTML content as download
    const htmlReport = generateHTMLReport(reportContent);

    // Open in new window
    const newWindow = window.open('', '_blank');
    newWindow.document.write(htmlReport);
    newWindow.document.close();
}

// Utility function for delays
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize everything when page loads
console.log('Script loaded, waiting for DOM...');