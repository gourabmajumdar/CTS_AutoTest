import paramiko
from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import json
import sys
import subprocess
import re
import time
from datetime import datetime

#RPI SSH Credentials
#RPI_HOST = "71.185.253.158"
#RPI_HOST = "65.78.96.246"
#RPI_USER = "root"
#RPI_PASS = ""

# Initialize Flask with explicit static folder configuration
app = Flask(__name__,
            static_folder='static',
            static_url_path='/static',
            template_folder='templates')

# Production configuration
if os.environ.get('FLASK_ENV') == 'production':
    app.config['DEBUG'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'fallback-secret-key')
else:
    app.config['DEBUG'] = True
    app.config['SECRET_KEY'] = 'dev-secret-key'

app.config['UPLOAD_FOLDER'] = '/home/azureuser/Gourab/CTS_AutoTest/test_case'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['GENERATED_SCRIPTS_FOLDER'] = '/home/azureuser/Gourab/CTS_AutoTest/generated-scripts'
app.config['REPORT_FOLDER'] = '/home/azureuser/Gourab/CTS_AutoTest/reports'

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Updated allowed file extensions - includes RTF and many more
ALLOWED_EXTENSIONS = {
    # Text files
    'txt', 'rtf', 'md', 'log',
    # Documents
    'pdf', 'doc', 'docx', 'odt', 'pages',
}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# Security headers
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    if os.environ.get('FLASK_ENV') == 'production':
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response


# Add this route to serve static files explicitly (for debugging)
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)


@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('index.html')


# Global variable to store uploaded files info
uploaded_files_global = []


@app.route('/upload', methods=['POST'])
def upload_files():
    """Handle file uploads"""
    global uploaded_files_global

    try:
        if 'files' not in request.files:
            return jsonify({'success': False, 'message': 'No files selected'})

        files = request.files.getlist('files')
        uploaded_files = []
        total_size = 0

        for file in files:
            if file.filename == '':
                continue

            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                # Add timestamp to avoid conflicts
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                filename = timestamp + filename
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)

                file_size = os.path.getsize(file_path)
                total_size += file_size

                uploaded_files.append({
                    'name': file.filename,
                    'size': file_size,
                    'path': filename
                })
            else:
                print(f"File not allowed: {file.filename}")

        # Store uploaded files globally
        uploaded_files_global = uploaded_files

        if uploaded_files:
            return jsonify({
                'success': True,
                'files': uploaded_files,
                'total_size': total_size,
                'message': f'Successfully uploaded {len(uploaded_files)} file(s)'
            })
        else:
            return jsonify({'success': False, 'message': 'No valid files uploaded. Please check file types.'})

    except Exception as e:
        print(f"Upload error: {str(e)}")
        return jsonify({'success': False, 'message': f'Upload error: {str(e)}'})


@app.route('/ingest', methods=['POST'])
def ingest_test():
    """Process ingested test files"""
    try:
        data = request.get_json()
        files = data.get('files', [])

        # Simulate test ingestion processing
        processed_files = []
        for file_info in files:
            processed_files.append({
                'name': file_info['name'],
                'status': 'processed',
                'test_cases': f"Test case Ingested!"
            })

        return jsonify({
            'success': True,
            'processed_files': processed_files,
            'message': 'Test ingestion completed successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Ingestion error: {str(e)}'})

generated_script_name = ''
@app.route('/generate', methods=['POST'])
def generate_code():
   """Generate Python test code instead of JavaScript"""
   global uploaded_files_global
   global generated_script_name

   try:
       data = request.get_json()
       print(f"data : {data}")
       input_text = data.get('input_text', '')
       print(f"input_text : {input_text}")

       # Get file count for more relevant test generation
       file_count = len(uploaded_files_global)
       
       # Clear old scripts
       folder_path = app.config['GENERATED_SCRIPTS_FOLDER']
       if os.path.isdir(folder_path):  # Only proceed if the folder exists
           for filename in os.listdir(folder_path):
               file_path = os.path.join(folder_path, filename)
               try:
                   if os.path.isfile(file_path):
                       os.remove(file_path)
                       print(f"[INFO] Deleted old script: {file_path}")
               except Exception as e:
                   print(f"[ERROR] Failed to delete {file_path}: {e}")
           os.rmdir(folder_path)
           print(f"[INFO] Deleted : {folder_path}")
       else:
           print(f"[INFO] Folder '{folder_path}' does not exist. Skipping cleanup.")

       print(f"Execute Auto-test-gen.py")
       output = subprocess.run(["python3", "/home/azureuser/Gourab/CTS_AutoTest/Backend/Auto_test_gen.py"],capture_output=True,text=True)
       print(f"RUN COMPLETED Auto-test-gen.py")
       print("STDOUT:", output.stdout)

       match = re.search(r"Script generated\s*:\s*(\S+\.py)", output.stdout)
       if not match:
            return jsonify({'success': False, 'message': 'Could not extract generated script name.'})
       global generated_script_name
       generated_script_name = match.group(1).strip()

       #folder_path =  '/home/azureuser/Gourab/CTS_AutoTest/generated-scripts'
       file_path = os.path.join(app.config['GENERATED_SCRIPTS_FOLDER'], generated_script_name)

       if not os.path.isfile(file_path):
            return jsonify({'success': False, 'message': 'Generated script not found!'})
       generated_code = f'''# Generated Python Test Code - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n'''
       try:
           with open(file_path, 'r', encoding='utf-8') as f:
               generated_code += f.read()
       except Exception as e:
           generated_code = f"Error reading file: {str(e)}"

       return jsonify({
           'success': True,
           'generated_code': generated_code,
           'message': 'Python test code generated successfully'
       })

   except Exception as e:
       return jsonify({'success': False, 'message': f'Generation error: {str(e)}'})

#@app.route('/generate', methods=['POST'])
#def generate_code():
#    """Generate Python test code from uploaded files"""
#    global uploaded_files_global
#
#    try:
#        data = request.get_json()
#        print(f"data : {data}")
#        input_text = data.get('input_text', '')
#        print(f"input_text : {input_text}")
#
#        # Clear old scripts
#        folder_path = app.config['GENERATED_SCRIPTS_FOLDER']
#        if os.path.isdir(folder_path):  # Only proceed if the folder exists
#            for filename in os.listdir(folder_path):
#                file_path = os.path.join(folder_path, filename)
#                try:
#                    if os.path.isfile(file_path):
#                        os.remove(file_path)
#                        print(f"[INFO] Deleted old script: {file_path}")
#                except Exception as e:
#                    print(f"[ERROR] Failed to delete {file_path}: {e}")
#            os.rmdir(folder_path)
#            print(f"[INFO] Deleted : {folder_path}")
#        else:
#            print(f"[INFO] Folder '{folder_path}' does not exist. Skipping cleanup.")
#
#        print(f"Execute Auto-test-gen.py")
#        output = subprocess.run(
#            ["python3", "/home/azureuser/Gourab/CTS_AutoTest/Backend/Auto_test_gen.py"],
#            capture_output=True,
#            text=True
#        )
#        print(f"RUN COMPLETED Auto-test-gen.py")
#        print("STDOUT:", output.stdout)
#
#        # Match multiple script generation lines
#        matches = re.findall(r"Script generated\s*:\s*(\S+\.py)", output.stdout)
#
#        if not matches:
#            return jsonify({'success': False, 'message': 'No scripts were generated.'})
#
#        all_generated_scripts = []
#
#        for script_name in matches:
#            file_path = os.path.join(folder_path, script_name)
#            if os.path.isfile(file_path):
#                try:
#                    with open(file_path, 'r', encoding='utf-8') as f:
#                        generated_code = f'''# Generated Python Test Code - {script_name} - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n''' + f.read()
#                        all_generated_scripts.append({
#                            'script_name': script_name,
#                            'code': generated_code
#                        })
#                except Exception as e:
#                    all_generated_scripts.append({
#                        'script_name': script_name,
#                        'code': f"Error reading file {script_name}: {str(e)}"
#                    })
#            else:
#                all_generated_scripts.append({
#                    'script_name': script_name,
#                    'code': f"Script {script_name} was listed but not found on disk."
#                })
#
#        return jsonify({
#            'success': True,
#            'generated_scripts': all_generated_scripts,
#            'message': 'Python test scripts generated successfully'
#        })
#
#    except Exception as e:
#        return jsonify({'success': False, 'message': f'Generation error: {str(e)}'})
@app.route('/save_code', methods=['POST'])
def save_code():
    global generated_script_name
    print(f"DEBUG -----{generated_script_name}")
    try:
        # Get the code from the request
        data = request.get_json()
        code = data.get('code', '').strip()

        if not code:
            return jsonify({'success': False, 'message': 'No code to save!'})

        # Generate filename with timestamp
        filepath = os.path.join(app.config['GENERATED_SCRIPTS_FOLDER'], generated_script_name)
        print(f"DEBUG {filepath}")

        # Write the code to file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(code)

        return jsonify({
            'success': True,
            'message': f'Python code saved as {generated_script_name}',
            'filename': generated_script_name,
            'filepath': filepath
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Error saving file: {str(e)}'})

# Function to strip ANSI escape codes (color codes) from terminal output
def remove_ansi_codes(text):
    ansi_escape = re.compile(r'\x1B\[[0-?]*[ -/]*[@-~]')
    return ansi_escape.sub('', text)


#@app.route('/execute', methods=['POST'])
#def execute_code():
#    """Execute test code"""
#    global generated_script_name
#    print(f"[DEBUG] Script to execute: {generated_script_name}")

    #local_folder = '/home/azureuser/Gourab/CTS_AutoTest/generated-scripts'
#    local_script_path = os.path.join(app.config['GENERATED_SCRIPTS_FOLDER'], generated_script_name)
#    print(f"DEBUG {local_script_path}")

#    if not os.path.isfile(local_script_path):
#        return jsonify({'success': False, 'message': 'Generated script file does not exist.'})

#    try:
#        data = request.get_json()
#        code = data.get('code', '')

#        print("[INFO] Connecting to Raspberry Pi...")
#        ssh = paramiko.SSHClient()
#        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
#        ssh.connect(RPI_HOST, username=RPI_USER, password=RPI_PASS)
#        print("[INFO] SSH connection established.")

        # Upload script content via echo (avoids SFTP)
#        with open(local_script_path, 'r') as f:
#            script_content = f.read()

#        remote_path = f"/tmp/{generated_script_name}"
#        print(f"[INFO] Uploading script to: {remote_path}")
#        escaped_script = script_content.replace("'", "'\"'\"'")
#        command = f"echo '{escaped_script}' > {remote_path} && chmod +x {remote_path}"
#        ssh.exec_command(command)
#        print("[INFO] Script uploaded and permission set.")

        # Execute script
#        print(f"[INFO] Executing script: python3 {remote_path}")
#        stdin, stdout, stderr = ssh.exec_command(f"python3 {remote_path}")
#        execution_result = stdout.read().decode()
#        error = stderr.read().decode()
#        ssh.close()
        # --- NEW: Strip ANSI escape codes from output and error ---
#        execution_result = remove_ansi_codes(execution_result)
#        error = remove_ansi_codes(error)

#        return jsonify({
#            'success': True,
#            'execution_result': execution_result,
#            'message': 'Python code executed successfully'
#        })

#    except Exception as e:
#        return jsonify({'success': False, 'message': f'Execution error: {str(e)}'})


@app.route('/execute', methods=['POST'])
def execute_code():
    """Execute all generated test scripts on a remote RPI via SSH"""
    folder_path = app.config['GENERATED_SCRIPTS_FOLDER']
 
    if not os.path.isdir(folder_path):
        return jsonify({'success': False, 'message': 'Script folder does not exist.'})
 
    try:
        rpi_list = [
            {"host": "71.185.253.158", "user": "root", "pass": ""},
            {"host": "65.78.96.246", "user": "root", "pass": ""}
        ]
 
        MAX_RETRIES = 3
        RETRY_DELAY = 3
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        connected = False
        connected_host = None
 
        # Retry logic
        for attempt in range(MAX_RETRIES):
            print(f"[INFO] Attempt {attempt + 1}")
            for rpi in rpi_list:
                try:
                    print(f"[INFO] Connecting to {rpi['host']}...")
                    ssh.connect(rpi["host"], username=rpi["user"], password=rpi["pass"], timeout=5)
                    connected = True
                    connected_host = rpi["host"]
                    print(f"[INFO] Connected to {rpi['host']}")
                    break
                except Exception as e:
                    print(f"[ERROR] Connection to {rpi['host']} failed: {e}")
            if connected:
                break
            time.sleep(RETRY_DELAY)
 
        if not connected:
            return jsonify({'success': False, 'message': 'Failed to connect to any Raspberry Pi.'})
 
        results = []
 
        # Loop over .py files in the folder
        for filename in os.listdir(folder_path):
            if filename.endswith('.py'):
                local_path = os.path.join(folder_path, filename)
                with open(local_path, 'r') as f:
                    script_content = f.read()
 
                remote_path = f"/tmp/{filename}"
                print(f"[INFO] Uploading {filename} to {remote_path}")
                escaped_script = script_content.replace("'", "'\"'\"'")
                command = f"echo '{escaped_script}' > {remote_path} && chmod +x {remote_path}"
                ssh.exec_command(command)
 
                # Run the script
                print(f"[INFO] Executing {filename}")
                stdin, stdout, stderr = ssh.exec_command(f"python3 {remote_path}")
                execution_result = stdout.read().decode()
                error_output = stderr.read().decode()
 
                results.append({
                    'filename': filename,
                    'stdout': remove_ansi_codes(execution_result),
                    'stderr': remove_ansi_codes(error_output)
                })
 
        ssh.close()
 
        return jsonify({
            'success': True,
            'connected_host': connected_host,
            'results': results,
            'message': 'All scripts executed.'
        })
 
    except Exception as e:
        return jsonify({'success': False, 'message': f'Execution error: {str(e)}'})

@app.route('/review', methods=['POST'])
def review_code():
    """Review Python code quality"""
    try:
        data = request.get_json()
        code = data.get('code', '')

        run_tox = subprocess.run(["tox"], capture_output=True, text=True, check=True)
        with open('/home/azureuser/Gourab/CTS_AutoTest/reports/summary.txt', 'r')  as f:
            summary = f.read()
        if run_tox:
            # Simulate Python code review
            review_report = f"""Language: Python

{summary}

Status: Please Click on Open Report/Download report for the actual results!!"""
        else:
            review_report = "FAIL"
        return jsonify({
            'success': True,
            'review_report': review_report,
            'message': 'Python code review completed successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Review error: {str(e)}'})


#@app.route('/download/<filename>')
#def download_file(filename):
#    """Download uploaded files"""
#    try:
#        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
#    except Exception as e:
#        return jsonify({'success': False, 'message': f'Download error: {str(e)}'})
#

@app.route('/open-report')
def open_report():
    try:
        return send_from_directory(app.config['REPORT_FOLDER'], 'combinedreport.html')
    except Exception as e:
        return jsonify({'success': False, 'message': f'View report error: {str(e)}'})

@app.route('/download-report')
def download_report():
    try:
        return send_from_directory(app.config['REPORT_FOLDER'], 'combinedreport.html', as_attachment=True)
    except Exception as e:
        return jsonify({'success': False, 'message': f'Download error: {str(e)}'})

@app.errorhandler(413)
def too_large(e):
    return jsonify({'success': False, 'message': 'File too large. Maximum size is 16MB.'}), 413


@app.errorhandler(404)
def not_found(e):
    return render_template('index.html'), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'success': False, 'message': 'Internal server error'}), 500


if __name__ == '__main__':
    # Use environment PORT for deployment platforms
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config['DEBUG'])
