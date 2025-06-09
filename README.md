# 🧪 CTS AutoTest Dashboard

A comprehensive **Flask-based web application** for automated test generation, execution, and code review. This tool streamlines the testing workflow by providing an intuitive interface for uploading test cases, generating Python unittest code, executing tests, and generating detailed code review reports.

![Dashboard Preview](https://img.shields.io/badge/Flask-Dashboard-blue?style=for-the-badge&logo=flask)
![Python](https://img.shields.io/badge/Python-3.8+-green?style=for-the-badge&logo=python)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

## ✨ Features

### 🏠 **Home Dashboard**
- Clean, intuitive welcome interface
- Professional Cognizant-branded design
- Responsive layout for all devices

### 🧪 **AutoTest Workflow**
1. **📁 File Upload**: Support for multiple file formats (.rtf, .txt, .pdf, .docx)
2. **⚡ Test Ingestion**: Intelligent parsing and processing of test requirements
3. **🐍 Code Generation**: Automated Python unittest code generation
4. **🚀 Test Execution**: Real-time code execution with detailed output
5. **📊 Code Review**: Comprehensive code quality analysis and reporting

### 🎨 **User Experience**
- **Progress Indicators**: Real-time progress tracking for all operations
- **Interactive UI**: Smooth animations and responsive design
- **State Management**: Guided workflow with clear next steps
- **File Management**: Easy download and save functionality
- **Professional Reports**: HTML report generation with embedded styling

## 🛠️ **Technology Stack**

- **Backend**: Flask (Python web framework)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with gradient designs and animations
- **File Processing**: Support for RTF, TXT, PDF, DOCX formats
- **Code Execution**: Python subprocess management
- **Report Generation**: Dynamic HTML report creation

## 📁 **Project Structure**

```
CTS_AutoTest/
├── app.py                  # Main Flask application
├── static/
│   ├── css/
│   │   └── style.css      # Main stylesheet with responsive design
│   ├── js/
│   │   └── script.js      # Frontend JavaScript functionality
│   ├── uploads/           # User uploaded files (gitignored)
│   └── logo.png          # Cognizant branding logo
├── templates/
│   └── index.html        # Main dashboard template
├── .gitignore            # Git ignore configuration
├── .venv/                # Virtual environment (gitignored)
└── README.md             # Project documentation
```

## 🚀 **Quick Start**

### **Prerequisites**
- Python 3.8 or higher
- pip (Python package manager)
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/gourabmajumdar/CTS_AutoTest.git
   cd CTS_AutoTest
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv .venv
   .venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install flask
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the dashboard**
   Open your browser and navigate to: `http://localhost:5000`

## 📖 **Usage Guide**

### **1. Home Page**
- Welcome interface with project overview
- Navigation to AutoTest functionality

### **2. AutoTest Workflow**

#### **Step 1: Upload Files**
- Click the upload area or drag & drop files
- Supports: `.rtf`, `.txt`, `.pdf`, `.docx`
- Multiple file upload supported

#### **Step 2: Ingest Test Data**
- Click "Ingest Test" to process uploaded files
- System analyzes and extracts test requirements
- Progress indicator shows processing status

#### **Step 3: Generate Python Code**
- Click "Generate Code" to create unittest code
- Automated Python test suite generation
- Code appears in the text area

#### **Step 4: Execute Tests**
- Click "Execute Code" to run the generated tests
- Real-time execution with detailed output
- Results displayed in the interface

#### **Step 5: Review Code**
- Click "Review Code" for quality analysis
- Comprehensive code review report
- Download options for reports

## 🎨 **Features in Detail**

### **Progressive UI States**
- **Guided Workflow**: Only relevant buttons are enabled at each step
- **Visual Feedback**: Completed steps show checkmarks and are disabled
- **State Persistence**: Clear indication of current progress

### **File Management**
- **Smart Upload**: Drag & drop or click to upload
- **File Validation**: Automatic file type checking
- **Storage Management**: Uploaded files are gitignored for privacy

### **Code Generation**
- **Intelligent Parsing**: Extracts test cases from various document formats
- **Python Best Practices**: Generates clean, PEP-8 compliant code
- **Unittest Framework**: Professional test structure with proper assertions

### **Responsive Design**
- **Mobile Friendly**: Works on all device sizes
- **Professional Styling**: Cognizant-branded interface
- **Smooth Animations**: Enhanced user experience with CSS transitions

## 🔧 **Configuration**

### **Environment Variables**
Create a `.env` file for configuration:
```env
FLASK_ENV=development
DEBUG=True
SECRET_KEY=your-secret-key-here
UPLOAD_FOLDER=static/uploads
MAX_CONTENT_LENGTH=16777216  # 16MB max file size
```

### **Customization**
- **Logo**: Replace `static/logo.png` with your custom logo
- **Styling**: Modify `static/css/style.css` for custom themes
- **Functionality**: Extend `app.py` for additional features

## 📊 **API Endpoints**

- `GET /` - Main dashboard
- `POST /ingest` - Process uploaded files
- `POST /generate` - Generate Python test code
- `POST /execute` - Execute Python code
- `POST /review` - Generate code review

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Author**

**Gourab Majumdar**
- Email: gourab.majumder@gmail.com
- GitHub: [@gourabmajumdar](https://github.com/gourabmajumdar)

## 🙏 **Acknowledgments**

- **Cognizant** - For the inspiration and branding
- **Flask Community** - For the excellent web framework
- **Open Source Contributors** - For various tools and libraries used

## 📞 **Support**

If you encounter any issues or have questions:

1. **Check the Issues**: Look through existing GitHub issues
2. **Create New Issue**: Describe your problem with details
3. **Documentation**: Refer to this README for common solutions

---

### 🌟 **Star this repository if you find it helpful!**

**Made with ❤️ for automated testing and code quality improvement**
