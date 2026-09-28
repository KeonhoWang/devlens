# 🔬 DevLens AI

### AI-Powered Code Health Analyzer

> **Analyze your code. Understand the problems. Improve with AI.**

DevLens AI is a multi-language code health analyzer that detects **security vulnerabilities, code-quality issues, complexity problems, architecture concerns, and documentation gaps**.

It transforms the analysis into an easy-to-understand **health score, letter grade, radar chart, AI explanations, and automated fixes**.

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/AI-Groq%20LLaMA-F55036" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E" />
</p>

---

## 🌟 What is DevLens?

Software developers often know that something is wrong with their code, but identifying **what is wrong, why it matters, and how to fix it** can take time.

DevLens combines traditional code analysis with AI to make this process easier.

### 🔍 Analyze

Scan your source code for common problems.

### 📊 Understand

See your code's health through five different metrics.

### 🤖 Learn

Ask AI to explain detected issues in beginner-friendly language.

### 🔧 Improve

Apply supported automatic fixes and compare your code before and after.

---

## ✨ Features

| Feature                  | Description                                                |
| ------------------------ | ---------------------------------------------------------- |
| 🌐 **6 Languages**       | Python, JavaScript, Java, C/C++, PHP, Swift                |
| 📊 **5 Health Metrics**  | Architecture, Quality, Documentation, Security, Complexity |
| 🏆 **Letter Grades**     | A+ to F based on overall health                            |
| 📈 **Radar Chart**       | Visualize all five metrics                                 |
| 🤖 **AI Explanations**   | Get beginner-friendly explanations using Groq LLaMA        |
| 🔧 **Auto-Fix**          | Automatically fix supported common issues                  |
| 🔍 **Code Diff**         | Compare code before and after a fix                        |
| 📊 **File Comparison**   | Analyze two files side by side                             |
| 🔁 **Re-Analysis**       | Compare your score before and after improvements           |
| ⚡ **Live Analysis**      | Analyze code while you type                                |
| 📄 **PDF Export**        | Export complete analysis reports                           |
| 📈 **Analysis History**  | Save and reload your latest 10 analyses                    |
| 🌙 **Dark / Light Mode** | Switch between themes                                      |
| 📁 **File Upload**       | Upload supported source files directly                     |

---

## 🧠 Five Code Health Metrics

DevLens evaluates your code across five areas:

### 🏗️ Architecture

Checks structural characteristics such as:

* File size
* Function and class structure
* Code duplication
* Overall organization

### 🧹 Code Quality

Detects issues such as:

* Excessive line length
* TODO / FIXME comments
* Common coding patterns
* Potential maintainability problems

### 📚 Documentation

Checks for:

* Comments
* Docstrings
* Module documentation
* Missing documentation

### 🔐 Security

Looks for common security risks including:

* Hardcoded secrets
* Dangerous functions
* Injection risks
* XSS-related patterns
* Unsafe code execution

### 🧠 Complexity

Analyzes:

* Function size
* Nested structures
* Nested loops
* Cyclomatic complexity

---

# 🤖 AI-Powered Code Understanding

When a problem is detected, DevLens can use **Groq's LLaMA models** to explain the issue.

Instead of simply reporting:

```text
⚠️ Dangerous use of eval()
```

DevLens can explain:

* What the issue means
* Why it is dangerous
* Where it occurs
* How it could affect the application
* How to fix it
* What a safer approach looks like

> AI explanations are optional. The core analyzer works without an API key.

---

# 🔧 Auto-Fix & Code Diff

DevLens can automatically fix supported issues.

Every fix can be reviewed through a **Before vs After** comparison.

```text
┌──────────────────┐       ┌──────────────────┐
│     BEFORE       │  →    │      AFTER       │
│                  │       │                  │
│ Problematic Code │       │ Improved Code    │
└──────────────────┘       └──────────────────┘
```

This makes the tool useful not only for fixing code, but also for **learning why the change matters**.

---

# 📊 Health Score

Every analysis produces an overall score from **0–100** and a corresponding letter grade.

The score is calculated from the five health dimensions:

```text
🏗️ Architecture
🧹 Code Quality
📚 Documentation
🔐 Security
🧠 Complexity
```

The results are also visualized through an interactive radar chart so you can quickly identify areas that need improvement.

---

# 🌐 Supported Languages

| Language      | Analysis | Security | Documentation | Complexity |
| ------------- | :------: | :------: | :-----------: | :--------: |
| 🐍 Python     |   ✅ AST  |     ✅    |       ✅       |      ✅     |
| 📜 JavaScript |     ✅    |     ✅    |       ✅       |      ✅     |
| ☕ Java        |     ✅    |     ✅    |       ✅       |      ✅     |
| ⚙️ C / C++    |     ✅    |     ✅    |       ✅       |      ✅     |
| 🐘 PHP        |     ✅    |     ✅    |       ✅       |      ✅     |
| 🍎 Swift      |     ✅    |     ✅    |       ✅       |      ✅     |

### Python

Python receives deeper structural analysis using Python's built-in `ast` module.

### Other Languages

JavaScript, Java, C/C++, PHP, and Swift currently use pattern-based and regex-based analysis.

---

# 🛠️ Tech Stack

| Technology               | Purpose                          |
| ------------------------ | -------------------------------- |
| 🐍 **Python 3.12**       | Backend & analysis engine        |
| 🌶️ **Flask**            | Web server & API                 |
| 🧩 **Python AST**        | Python source-code analysis      |
| 🔎 **Regex**             | Multi-language pattern detection |
| 🤖 **Groq LLaMA**        | AI-powered explanations          |
| 📄 **jsPDF**             | PDF report generation            |
| 📊 **Canvas API**        | Radar chart visualization        |
| ⚡ **Vanilla JavaScript** | Frontend logic                   |
| 🎨 **HTML / CSS**        | User interface                   |

---

# 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │   User / Browser│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Flask Backend  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Analysis Engine │
                    │                 │
                    │ AST + Regex     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         Security        Quality       Complexity
              │              │              │
              └──────────────┼──────────────┘
                             ▼
                    ┌─────────────────┐
                    │ Health Scoring  │
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              Radar Chart        AI Analysis
                                  (Groq LLaMA)
```

---

# 📁 Project Structure

```text
devlens/
│
├── app.py
├── analyzer.py
├── groq_helper.py
│
├── index.html
├── style.css
├── script.js
│
├── .env
├── .gitignore
└── README.md
```

### Main Components

**`app.py`**

Flask server, API routes, history management, and application logic.

**`analyzer.py`**

Core code-analysis engine responsible for detecting issues and calculating metrics.

**`groq_helper.py`**

Handles communication with the Groq API for AI-powered explanations.

**`index.html`**

Main application interface.

**`style.css`**

Application styling and dark/light themes.

**`script.js`**

Frontend functionality, API communication, radar chart, live analysis, and UI interactions.

---

# 🚀 Getting Started

## Prerequisites

* Python 3.8+
* pip
* Modern web browser

Python 3.12 is recommended.

---

## 1. Clone the Repository

```bash
git clone https://github.com/KeonhoWang/devlens.git
cd devlens
```

---

## 2. Install Dependencies

```bash
pip3 install flask flask-cors python-dotenv requests
```

> If your Python environment requires it, you may need to use `--break-system-packages`.

---

## 3. Configure AI

Create a `.env` file in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from the [Groq Console](https://console.groq.com/).

> DevLens works without a Groq API key. Only AI-powered explanations require the API.

---

## 4. Run the Application

```bash
python3 app.py
```

---

## 5. Open in Your Browser

```text
http://localhost:5000
```

If necessary:

```text
http://127.0.0.1:5000
```

---

# ⌨️ Keyboard Shortcuts

| Shortcut   | Action               |
| ---------- | -------------------- |
| `Ctrl + L` | Toggle live analysis |
| `Esc`      | Close AI explanation |

---

# 🔌 API Endpoints

| Endpoint       | Method | Description                  |
| -------------- | :----: | ---------------------------- |
| `/`            |  `GET` | Serve the application        |
| `/analyze`     | `POST` | Analyze source code          |
| `/history`     |  `GET` | Retrieve recent analyses     |
| `/history/:id` |  `GET` | Retrieve a specific analysis |
| `/ai-explain`  | `POST` | Generate AI explanation      |
| `/auto-fix`    | `POST` | Apply supported fixes        |

---

# 🔬 How It Works

### 1. Submit Code

The frontend sends the source code to the Flask backend.

```http
POST /analyze
```

### 2. Detect Language

DevLens determines which analysis strategy to use.

### 3. Analyze

Python uses the built-in AST parser, while other supported languages use pattern-based detection.

### 4. Calculate Metrics

Five metrics are calculated:

```text
Architecture
Code Quality
Documentation
Security
Complexity
```

### 5. Generate Health Score

The individual metrics are combined into an overall **0–100 health score** and letter grade.

### 6. Generate Issues

Detected issues include information such as:

* Severity
* Description
* Line number
* Category
* Fix suggestion

### 7. AI Explanation

If a Groq API key is configured, users can request a detailed AI explanation for individual issues.

---

# 🧪 Example

### Input

```python
password = "admin123"

def calculate(x):
    if x > 10:
        if x > 20:
            if x > 30:
                return eval("x + 1")

    return x
```

### DevLens can detect

🔐 **Hardcoded sensitive information**

⚠️ **Potentially dangerous `eval()` usage**

🧠 **Excessive nesting**

📚 **Missing documentation**

🧹 **Code-quality issues**

The result is then converted into a health score with recommendations for improvement.

---

# 📄 PDF Reports

DevLens can generate a PDF report containing:

* Overall health score
* Letter grade
* Metric breakdown
* Detected issues
* Severity
* Recommendations

Useful for keeping a record of analysis results or sharing code-quality reports.

---

# 📈 Analysis History

DevLens keeps the latest **10 analyses**, allowing users to:

* Review previous analyses
* Reload previous results
* Track improvements
* Compare different versions

---

# ⚡ Live Analysis

Enable live analysis with:

```text
Ctrl + L
```

Once enabled, DevLens automatically analyzes the code as you edit it.

This provides immediate feedback during development.

---

# 🔐 Security Notice

DevLens is designed as a **developer-assistance and educational tool**.

Its security analysis focuses on detecting common patterns and should not be considered a replacement for:

* Professional security audits
* Dedicated SAST tools
* Dependency vulnerability scanners
* Penetration testing

---

# 🚧 Future Improvements

Planned or potential improvements include:

* [ ] GitHub repository analysis
* [ ] Pull Request code review
* [ ] VS Code extension
* [ ] CI/CD integration
* [ ] More programming languages
* [ ] Deeper AST analysis
* [ ] Dependency vulnerability scanning
* [ ] AI-generated refactoring
* [ ] Automated unit-test generation
* [ ] Code smell detection
* [ ] Persistent database storage
* [ ] Team dashboards

---

# 🎯 Why I Built This

DevLens AI was built as a **software engineering portfolio project** to explore how traditional code analysis and modern AI can work together.

The project combines:

* Backend development
* REST API design
* Static code analysis
* AI / LLM integration
* Frontend development
* Data visualization
* Security analysis
* Automated code transformation

The goal was to build more than a simple AI wrapper — **DevLens combines its own code-analysis engine with AI to help developers understand and improve their code.**

---



# 📜 License

This project is licensed under the **MIT License**.

See [`LICENSE`](LICENSE) for details.

---

<div align="center">

## 🔬 DevLens AI

**Analyze • Understand • Improve**

Built with ❤️ using Python, Flask, JavaScript & AI

⭐ If you found this project interesting, consider giving it a star!

</div>
