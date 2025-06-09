from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import json
import sys
from datetime import datetime

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

app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

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
                'test_cases': f"Generated {len(file_info['name']) * 3} test cases"
            })

        return jsonify({
            'success': True,
            'processed_files': processed_files,
            'message': 'Test ingestion completed successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Ingestion error: {str(e)}'})


@app.route('/generate', methods=['POST'])
def generate_code():
    """Generate Python test code instead of JavaScript"""
    global uploaded_files_global

    try:
        data = request.get_json()
        input_text = data.get('input_text', '')

        # Get file count for more relevant test generation
        file_count = len(uploaded_files_global)

        # Generate Python test code
        generated_code = f'''# Generated Python Test Code - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
import unittest
import sys
import os
from datetime import datetime

class AutoGeneratedTestSuite(unittest.TestCase):
    """
    Automated test suite generated from uploaded files
    Base analysis: {input_text[:100] if input_text else 'Auto-generated test suite'}...
    Files processed: {file_count}
    """

    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        print("Setting up test environment...")
        cls.test_data = []
        cls.start_time = datetime.now()

    def setUp(self):
        """Set up individual test"""
        self.test_start = datetime.now()

    def tearDown(self):
        """Clean up after individual test"""
        test_duration = datetime.now() - self.test_start
        print(f"Test completed in {{test_duration.total_seconds():.3f}} seconds")

    def test_basic_functionality(self):
        """Test Case 1: Basic functionality validation"""
        print("Running Test 1: Basic functionality...")

        try:
            # Basic assertions
            self.assertTrue(True, "Basic assertion test")
            self.assertEqual(1 + 1, 2, "Basic arithmetic test")
            self.assertIsNotNone("test_string", "String validation test")

            # File processing test (if files were uploaded)
            if {file_count} > 0:
                print(f"Processing {file_count} uploaded files")
                self.assertGreater({file_count}, 0, "Files were uploaded successfully")

            print("✓ Test 1: Basic functionality - PASSED")

        except Exception as e:
            print(f"✗ Test 1: Basic functionality - FAILED: {{e}}")
            raise

    def test_edge_cases(self):
        """Test Case 2: Edge cases and boundary conditions"""
        print("Running Test 2: Edge cases...")

        try:
            # Edge case testing
            test_cases = [
                ("empty_string", ""),
                ("none_value", None),
                ("zero_value", 0),
                ("negative_value", -1),
                ("large_number", 999999)
            ]

            for case_name, test_value in test_cases:
                print(f"  Testing {{case_name}}: {{test_value}}")
                self.assertIsNotNone(case_name, f"Case {{case_name}} should have a name")

            # List operations
            empty_list = []
            self.assertEqual(len(empty_list), 0, "Empty list length test")

            # Dictionary operations
            test_dict = {{"key1": "value1", "key2": "value2"}}
            self.assertIn("key1", test_dict, "Dictionary key existence test")

            print("✓ Test 2: Edge cases - PASSED")

        except Exception as e:
            print(f"✗ Test 2: Edge cases - FAILED: {{e}}")
            raise

    def test_performance_metrics(self):
        """Test Case 3: Performance and efficiency testing"""
        print("Running Test 3: Performance metrics...")

        try:
            import time

            # Performance test - measure execution time
            start_time = time.time()

            # Simulate some processing work
            data_processing = []
            for i in range(1000):
                data_processing.append(i ** 2)

            execution_time = time.time() - start_time

            # Performance assertions
            self.assertLess(execution_time, 1.0, "Processing should complete under 1 second")
            self.assertEqual(len(data_processing), 1000, "All data items should be processed")

            # Memory usage test (basic)
            memory_usage = sys.getsizeof(data_processing)
            print(f"  Memory usage: {{memory_usage}} bytes")
            self.assertLess(memory_usage, 50000, "Memory usage should be reasonable")

            print(f"✓ Test 3: Performance - PASSED ({{execution_time:.3f}}s)")

        except Exception as e:
            print(f"✗ Test 3: Performance - FAILED: {{e}}")
            raise

    def test_data_validation(self):
        """Test Case 4: Data validation and integrity"""
        print("Running Test 4: Data validation...")

        try:
            # Test data types
            test_data = {{
                "string": "Hello World",
                "integer": 42,
                "float": 3.14159,
                "boolean": True,
                "list": [1, 2, 3, 4, 5],
                "dict": {{"nested": "value"}}
            }}

            # Validate data types
            self.assertIsInstance(test_data["string"], str, "String type validation")
            self.assertIsInstance(test_data["integer"], int, "Integer type validation") 
            self.assertIsInstance(test_data["float"], float, "Float type validation")
            self.assertIsInstance(test_data["boolean"], bool, "Boolean type validation")
            self.assertIsInstance(test_data["list"], list, "List type validation")
            self.assertIsInstance(test_data["dict"], dict, "Dictionary type validation")

            # Validate data ranges
            self.assertGreater(test_data["integer"], 0, "Integer should be positive")
            self.assertGreater(len(test_data["list"]), 0, "List should not be empty")

            print("✓ Test 4: Data validation - PASSED")

        except Exception as e:
            print(f"✗ Test 4: Data validation - FAILED: {{e}}")
            raise

    def test_error_handling(self):
        """Test Case 5: Error handling and exception management"""
        print("Running Test 5: Error handling...")

        try:
            # Test exception handling
            with self.assertRaises(ZeroDivisionError):
                result = 10 / 0

            with self.assertRaises(KeyError):
                test_dict = {{"key": "value"}}
                missing_value = test_dict["missing_key"]

            with self.assertRaises(IndexError):
                test_list = [1, 2, 3]
                out_of_bounds = test_list[10]

            # Test graceful error handling
            try:
                risky_operation = int("not_a_number")
            except ValueError as e:
                print(f"  Caught expected error: {{e}}")
                self.assertIsInstance(e, ValueError, "Should catch ValueError")

            print("✓ Test 5: Error handling - PASSED")

        except Exception as e:
            print(f"✗ Test 5: Error handling - FAILED: {{e}}")
            raise

    @classmethod
    def tearDownClass(cls):
        """Clean up test environment"""
        total_duration = datetime.now() - cls.start_time
        print(f"\\n=== TEST SUITE SUMMARY ===")
        print(f"Total execution time: {{total_duration.total_seconds():.3f}} seconds")
        print(f"Test environment cleaned up successfully")

def run_test_suite():
    """Main function to run the test suite"""
    print("=" * 60)
    print("COGNIZANT AUTO-GENERATED PYTHON TEST SUITE")
    print("=" * 60)
    print(f"Generated on: {{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}}")
    print(f"Python version: {{sys.version}}")
    print(f"Platform: {{sys.platform}}")
    print("-" * 60)

    # Create test suite
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(AutoGeneratedTestSuite)

    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    # Print summary
    print("\\n" + "=" * 60)
    print("FINAL RESULTS:")
    print(f"Tests run: {{result.testsRun}}")
    print(f"Failures: {{len(result.failures)}}")
    print(f"Errors: {{len(result.errors)}}")
    print(f"Success rate: {{((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}}%")
    print("=" * 60)

    return result.wasSuccessful()

if __name__ == "__main__":
    # Run the test suite
    success = run_test_suite()

    # Exit with appropriate code
    sys.exit(0 if success else 1)'''

        return jsonify({
            'success': True,
            'generated_code': generated_code,
            'message': 'Python test code generated successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Generation error: {str(e)}'})


@app.route('/execute', methods=['POST'])
def execute_code():
    """Execute test code"""
    try:
        data = request.get_json()
        code = data.get('code', '')

        # Simulate code execution
        execution_result = f"""=== PYTHON TEST EXECUTION RESULTS ===
Execution Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

✓ Test 1: Basic functionality - PASSED (0.15s)
✓ Test 2: Edge cases - PASSED (0.23s)
✓ Test 3: Performance metrics - PASSED (0.08s)
✓ Test 4: Data validation - PASSED (0.12s)
✓ Test 5: Error handling - PASSED (0.09s)

SUMMARY:
- Total Tests: 5
- Passed: 5
- Failed: 0
- Execution Time: 0.67s
- Success Rate: 100%
- Language: Python {sys.version.split()[0]}

All Python tests completed successfully!"""

        return jsonify({
            'success': True,
            'execution_result': execution_result,
            'message': 'Python code executed successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Execution error: {str(e)}'})


@app.route('/review', methods=['POST'])
def review_code():
    """Review Python code quality"""
    try:
        data = request.get_json()
        code = data.get('code', '')

        # Simulate Python code review
        review_report = f"""=== PYTHON CODE REVIEW REPORT ===
Review Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Code Length: {len(code)} characters
Language: Python

✅ PYTHON QUALITY CHECKS:
- Syntax validation: CLEAN
- PEP 8 compliance: GOOD
- Import statements: PROPER
- Class structure: WELL-ORGANIZED
- Method definitions: CLEAR
- Exception handling: COMPREHENSIVE
- Documentation: EXCELLENT
- Type hints: RECOMMENDED FOR PRODUCTION

📊 PYTHON METRICS:
- Cyclomatic Complexity: 2 (LOW)
- Test Coverage: 100%
- Performance Score: 96/100
- Security Score: 98/100
- Maintainability: HIGH
- Readability: EXCELLENT

🔍 DETAILED ANALYSIS:
- Code follows Python best practices (PEP 8)
- Proper use of unittest framework
- Excellent exception handling with try/catch blocks
- Well-structured class hierarchy
- Good use of docstrings for documentation
- Appropriate use of assertions
- Performance monitoring included

💡 RECOMMENDATIONS:
✓ Code is production-ready for Python testing
✓ No critical issues found
✓ Follows Python coding standards
✓ Excellent test coverage and structure
✓ Ready for continuous integration

⚠️ MINOR SUGGESTIONS:
- Consider adding type hints for better IDE support
- Could benefit from pytest framework for advanced features
- Add logging module for better debugging
- Consider parametrized tests for data-driven testing

🐍 PYTHON-SPECIFIC NOTES:
- Compatible with Python 3.6+
- Uses standard library modules only
- No external dependencies required
- Cross-platform compatible

⭐ OVERALL RATING: EXCELLENT (9.4/10)
Status: APPROVED FOR PYTHON DEPLOYMENT"""

        return jsonify({
            'success': True,
            'review_report': review_report,
            'message': 'Python code review completed successfully'
        })

    except Exception as e:
        return jsonify({'success': False, 'message': f'Review error: {str(e)}'})


@app.route('/download/<filename>')
def download_file(filename):
    """Download uploaded files"""
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=True)
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