from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from analyzer import analyze_code
from groq_helper import get_ai_explanation
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

history = []

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/style.css')
def css():
    return send_file('style.css')

@app.route('/script.js')
def js():
    return send_file('script.js')

@app.route('/analyze', methods=['POST'])
def analyze():
    data     = request.get_json()
    code     = data.get('code', '')
    language = data.get('language', 'python')
    filename = data.get('filename', 'untitled')

    if not code.strip():
        return jsonify({'error': 'No code provided'}), 400
    if len(code) > 50000:
        return jsonify({'error': 'Code too long. Max 50,000 characters.'}), 400

    result           = analyze_code(code, language)
    result['filename'] = filename
    result['language'] = language

    history.append({
        'id':       len(history) + 1,
        'filename': filename,
        'language': language,
        'score':    result['health_score'],
        'grade':    result['grade'],
        'issues':   len(result['issues']),
        'lines':    result['lines'],
        'summary':  result['summary'],
        'result':   result,
    })

    if len(history) > 10:
        history.pop(0)

    return jsonify(result)

@app.route('/history', methods=['GET'])
def get_history():
    return jsonify([{
        'id':       h['id'],
        'filename': h['filename'],
        'language': h['language'],
        'score':    h['score'],
        'grade':    h['grade'],
        'issues':   h['issues'],
        'lines':    h['lines'],
        'summary':  h['summary'],
    } for h in history])

@app.route('/history/<int:history_id>', methods=['GET'])
def get_history_item(history_id):
    for h in history:
        if h['id'] == history_id:
            return jsonify(h['result'])
    return jsonify({'error': 'Not found'}), 404

@app.route('/ai-explain', methods=['POST'])
def ai_explain():
    data        = request.get_json()
    issue       = data.get('issue', '')
    code        = data.get('code', '')
    explanation = get_ai_explanation(issue, code)
    return jsonify({'explanation': explanation})

@app.route('/auto-fix', methods=['POST'])
def auto_fix():
    data     = request.get_json()
    code     = data.get('code', '')
    language = data.get('language', 'python')
    fixed    = apply_auto_fixes(code, language)
    return jsonify({'fixed_code': fixed})

def apply_auto_fixes(code, language):
    import re
    fixed = code

    if language == 'python':
        fixed = re.sub(
            r'except:\s*\n(\s*)pass',
            'except Exception as e:\n\\1print(f"Error: {e}")',
            fixed
        )
        fixed = fixed.replace('hashlib.md5(', 'hashlib.sha256(')
        fixed = fixed.replace('shell=True', 'shell=False  # Fixed: shell=True is a security risk')

    elif language == 'javascript':
        fixed = re.sub(r'\bvar\b', 'let', fixed)
        fixed = fixed.replace('.innerHTML =', '.textContent =  // Fixed: use textContent to prevent XSS')

    elif language == 'php':
        fixed = fixed.replace('md5(', 'password_hash(  // Fixed: use password_hash() instead')

    return fixed

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, port=port)