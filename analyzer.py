import ast
import re

def get_grade(score):
    if score >= 95: return 'A+'
    elif score >= 90: return 'A'
    elif score >= 85: return 'A-'
    elif score >= 80: return 'B+'
    elif score >= 75: return 'B'
    elif score >= 70: return 'B-'
    elif score >= 65: return 'C+'
    elif score >= 60: return 'C'
    elif score >= 55: return 'C-'
    elif score >= 50: return 'D+'
    elif score >= 45: return 'D'
    elif score >= 40: return 'D-'
    else: return 'F'

def get_grade_color(grade):
    if grade.startswith('A'): return '#4ade80'
    elif grade.startswith('B'): return '#4f8ef7'
    elif grade.startswith('C'): return '#f59e0b'
    elif grade.startswith('D'): return '#f97316'
    else: return '#e94560'

def analyze_code(code, language='python'):
    result = {
        'health_score': 0,
        'grade':        'F',
        'grade_color':  '#e94560',
        'lines':        0,
        'issues':       [],
        'metrics': {
            'architecture':  0,
            'code_quality':  0,
            'documentation': 0,
            'security':      0,
            'complexity':    0,
        },
        'summary': '',
    }

    lines = code.strip().split('\n')
    result['lines'] = len(lines)

    if language == 'python':
        analyze_python(code, lines, result)
    elif language == 'javascript':
        analyze_javascript(code, lines, result)
    elif language == 'java':
        analyze_java(code, lines, result)
    elif language in ('c', 'cpp'):
        analyze_c_cpp(code, lines, result)
    elif language == 'php':
        analyze_php(code, lines, result)
    elif language == 'swift':
        analyze_swift(code, lines, result)
    else:
        analyze_generic(code, lines, result)

    scores = result['metrics']
    result['health_score'] = int(sum(scores.values()) / len(scores))
    result['grade']        = get_grade(result['health_score'])
    result['grade_color']  = get_grade_color(result['grade'])
    result['summary']      = generate_summary(result)
    return result


def analyze_python(code, lines, result):
    issues  = result['issues']
    metrics = result['metrics']

    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        issues.append({'severity': 'critical', 'title': 'Syntax Error', 'desc': str(e), 'line': e.lineno or 0})
        for key in metrics: metrics[key] = 20
        return

    quality_score = 100

    for node in ast.walk(tree):
        if isinstance(node, ast.ExceptHandler) and node.type is None:
            issues.append({'severity': 'warning', 'title': 'Bare except clause', 'desc': 'Use except ValueError as e: instead of bare except.', 'line': node.lineno})
            quality_score -= 10

    for i, line in enumerate(lines, 1):
        if len(line) > 100:
            issues.append({'severity': 'info', 'title': 'Long line detected', 'desc': f'Line {i} has {len(line)} characters. Keep under 100.', 'line': i})
            quality_score -= 3

    for i, line in enumerate(lines, 1):
        if re.search(r'#\s*(TODO|FIXME|HACK|XXX)', line, re.IGNORECASE):
            issues.append({'severity': 'info', 'title': 'Unresolved TODO/FIXME', 'desc': f'Found: {line.strip()}', 'line': i})
            quality_score -= 3

    metrics['code_quality'] = max(quality_score, 30)

    doc_score = 50
    functions = [n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)]
    classes   = [n for n in ast.walk(tree) if isinstance(n, ast.ClassDef)]
    documented_funcs = sum(1 for f in functions if ast.get_docstring(f))
    documented_class = sum(1 for c in classes  if ast.get_docstring(c))

    if functions:
        ratio      = documented_funcs / len(functions)
        doc_score += int(ratio * 40)
        if ratio < 0.5:
            issues.append({'severity': 'warning', 'title': 'Missing docstrings', 'desc': f'Only {documented_funcs}/{len(functions)} functions documented.', 'line': 0})

    if classes: doc_score += int((documented_class / len(classes)) * 10)
    if ast.get_docstring(tree): doc_score += 10
    metrics['documentation'] = min(doc_score, 100)

    sec_score = 100
    dangerous = {
        'eval':       ('critical', 'eval() executes arbitrary code — use ast.literal_eval().'),
        'exec':       ('critical', 'exec() executes arbitrary code — refactor into functions.'),
        'pickle':     ('warning',  'pickle is unsafe with untrusted data — use json.'),
        'shell=True': ('warning',  'shell=True can lead to shell injection.'),
        'md5':        ('info',     'MD5 is weak — use hashlib.sha256().'),
        'password':   ('info',     'Possible hardcoded password — use os.environ.get().'),
        'api_key':    ('info',     'Possible hardcoded API key — use environment variables.'),
        'secret':     ('info',     'Possible hardcoded secret — use environment variables.'),
    }

    for i, line in enumerate(lines, 1):
        for keyword, (severity, desc) in dangerous.items():
            if keyword.lower() in line.lower():
                issues.append({'severity': severity, 'title': f'Security: {keyword} detected', 'desc': desc, 'line': i})
                sec_score -= {'critical': 25, 'warning': 15, 'info': 5}.get(severity, 5)

    metrics['security'] = max(sec_score, 0)

    complexity_score = 100
    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            complexity = 1
            for child in ast.walk(node):
                if isinstance(child, (ast.If, ast.While, ast.For, ast.ExceptHandler, ast.With, ast.Assert)):
                    complexity += 1
            if complexity > 10:
                issues.append({'severity': 'warning', 'title': f'High complexity in {node.name}()', 'desc': f'Complexity is {complexity}. Break into smaller functions.', 'line': node.lineno})
                complexity_score -= 15
            elif complexity > 5:
                complexity_score -= 5

    metrics['complexity'] = max(complexity_score, 20)

    arch_score = 70
    if len(functions) > 0: arch_score += 10
    if len(classes) > 0:   arch_score += 10

    if len(lines) > 500:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines. Consider splitting.', 'line': 0})
        arch_score -= 15
    elif len(lines) > 200:
        arch_score -= 5

    line_counts = {}
    for line in lines:
        stripped = line.strip()
        if len(stripped) > 20:
            line_counts[stripped] = line_counts.get(stripped, 0) + 1

    if any(v > 2 for v in line_counts.values()):
        issues.append({'severity': 'info', 'title': 'Duplicate code', 'desc': 'Some lines repeat more than twice.', 'line': 0})
        arch_score -= 10

    metrics['architecture'] = min(max(arch_score, 20), 100)


def analyze_javascript(code, lines, result):
    issues  = result['issues']
    metrics = result['metrics']

    quality_score    = 100
    security_score   = 100
    doc_score        = 60
    arch_score       = 70
    complexity_score = 100

    js_dangerous = {
        'eval(':          ('critical', 'eval() executes arbitrary code — avoid it.'),
        'innerHTML':      ('warning',  'innerHTML can cause XSS — use textContent.'),
        'document.write': ('warning',  'document.write() is insecure.'),
        'localStorage':   ('info',     'Sensitive data in localStorage is not encrypted.'),
        'console.log':    ('info',     'Remove console.log() before production.'),
    }

    for i, line in enumerate(lines, 1):
        for keyword, (severity, desc) in js_dangerous.items():
            if keyword.lower() in line.lower():
                issues.append({'severity': severity, 'title': f'JS: {keyword.strip("(")} detected', 'desc': desc, 'line': i})
                security_score -= {'critical': 25, 'warning': 15, 'info': 5}.get(severity, 5)

    for i, line in enumerate(lines, 1):
        if len(line) > 120:
            issues.append({'severity': 'info', 'title': 'Long line', 'desc': f'Line {i} has {len(line)} chars.', 'line': i})
            quality_score -= 3

    for i, line in enumerate(lines, 1):
        if re.search(r'\bvar\b', line):
            issues.append({'severity': 'info', 'title': 'Use of var', 'desc': f'Line {i}: Use let or const instead.', 'line': i})
            quality_score -= 5
            break

    comment_lines = sum(1 for l in lines if l.strip().startswith('//') or l.strip().startswith('/*'))
    if len(lines) > 20 and comment_lines / len(lines) < 0.1:
        issues.append({'severity': 'info', 'title': 'Low documentation', 'desc': 'Less than 10% comments.', 'line': 0})
        doc_score -= 20

    if len(lines) > 500:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines.', 'line': 0})
        arch_score -= 15

    metrics['code_quality']  = max(quality_score, 30)
    metrics['security']      = max(security_score, 0)
    metrics['documentation'] = max(doc_score, 20)
    metrics['architecture']  = min(max(arch_score, 20), 100)
    metrics['complexity']    = max(complexity_score, 20)


def analyze_java(code, lines, result):
    issues  = result['issues']
    metrics = result['metrics']

    quality_score    = 100
    security_score   = 100
    doc_score        = 60
    arch_score       = 70
    complexity_score = 100

    java_dangerous = {
        'Runtime.exec':        ('critical', 'Runtime.exec() can lead to command injection.'),
        'System.exit':         ('warning',  'System.exit() can be abused — avoid in libraries.'),
        'printStackTrace':     ('info',     'Avoid printStackTrace() — use a logger instead.'),
        'MD5':                 ('warning',  'MD5 is weak — use SHA-256.'),
        'password':            ('info',     'Possible hardcoded password detected.'),
        'catch (Exception e)': ('warning',  'Catching generic Exception is too broad.'),
        'catch (Throwable':    ('critical', 'Catching Throwable is dangerous.'),
    }

    for i, line in enumerate(lines, 1):
        for keyword, (severity, desc) in java_dangerous.items():
            if keyword.lower() in line.lower():
                issues.append({'severity': severity, 'title': f'Java: {keyword}', 'desc': desc, 'line': i})
                security_score -= {'critical': 25, 'warning': 15, 'info': 5}.get(severity, 5)

    for i, line in enumerate(lines, 1):
        if re.search(r'//\s*(TODO|FIXME|HACK)', line, re.IGNORECASE):
            issues.append({'severity': 'info', 'title': 'TODO/FIXME found', 'desc': f'Found: {line.strip()}', 'line': i})
            quality_score -= 3

    if '/**' not in code:
        issues.append({'severity': 'info', 'title': 'No Javadoc', 'desc': 'Add /** */ Javadoc to classes and methods.', 'line': 0})
        doc_score -= 20

    for i, line in enumerate(lines, 1):
        if len(line) > 120:
            issues.append({'severity': 'info', 'title': 'Long line', 'desc': f'Line {i} has {len(line)} chars.', 'line': i})
            quality_score -= 2

    if len(lines) > 500:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines.', 'line': 0})
        arch_score -= 15

    if re.search(r'\bclass\b', code) or re.search(r'\binterface\b', code):
        arch_score += 15

    metrics['code_quality']  = max(quality_score, 30)
    metrics['security']      = max(security_score, 0)
    metrics['documentation'] = max(doc_score, 20)
    metrics['architecture']  = min(max(arch_score, 20), 100)
    metrics['complexity']    = max(complexity_score, 20)


def analyze_c_cpp(code, lines, result):
    issues  = result['issues']
    metrics = result['metrics']

    quality_score    = 100
    security_score   = 100
    doc_score        = 50
    arch_score       = 70
    complexity_score = 100

    cpp_dangerous = {
        'gets(':    ('critical', 'gets() is dangerous — use fgets() instead.'),
        'strcpy(':  ('warning',  'strcpy() can overflow — use strncpy().'),
        'strcat(':  ('warning',  'strcat() can overflow — use strncat().'),
        'sprintf(': ('warning',  'sprintf() can overflow — use snprintf().'),
        'scanf(':   ('warning',  'scanf() without width limits can overflow.'),
        'malloc(':  ('info',     'Check malloc() return for NULL.'),
        'system(':  ('critical', 'system() can lead to command injection.'),
        'password': ('info',     'Possible hardcoded password.'),
    }

    for i, line in enumerate(lines, 1):
        for keyword, (severity, desc) in cpp_dangerous.items():
            if keyword in line:
                issues.append({'severity': severity, 'title': f'C/C++: {keyword}', 'desc': desc, 'line': i})
                security_score -= {'critical': 25, 'warning': 15, 'info': 5}.get(severity, 5)

    comment_lines = sum(1 for l in lines if l.strip().startswith('//') or l.strip().startswith('/*'))
    if len(lines) > 20 and comment_lines / len(lines) < 0.1:
        issues.append({'severity': 'info', 'title': 'Low documentation', 'desc': 'Add more comments.', 'line': 0})
        doc_score -= 20

    for i, line in enumerate(lines, 1):
        if re.search(r'//\s*(TODO|FIXME|HACK)', line, re.IGNORECASE):
            issues.append({'severity': 'info', 'title': 'TODO/FIXME found', 'desc': f'Found: {line.strip()}', 'line': i})

    if len(lines) > 500:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines.', 'line': 0})
        arch_score -= 15

    if any(line.strip().startswith('#include') for line in lines):
        arch_score += 10

    if '#pragma once' in code or '#ifndef' in code:
        doc_score += 20

    metrics['code_quality']  = max(quality_score, 30)
    metrics['security']      = max(security_score, 0)
    metrics['documentation'] = max(doc_score, 20)
    metrics['architecture']  = min(max(arch_score, 20), 100)
    metrics['complexity']    = max(complexity_score, 20)


def analyze_php(code, lines, result):
    issues  = result['issues']
    metrics = result['metrics']

    quality_score    = 100
    security_score   = 100
    doc_score        = 60
    arch_score       = 70
    complexity_score = 100

    php_dangerous = {
        'eval(':       ('critical', 'eval() executes arbitrary PHP — avoid it.'),
        'exec(':       ('critical', 'exec() can lead to command injection.'),
        'system(':     ('critical', 'system() is dangerous — sanitize inputs.'),
        'shell_exec(': ('critical', 'shell_exec() is dangerous.'),
        'mysql_query': ('critical', 'mysql_query() is deprecated — use PDO.'),
        '$_GET':       ('warning',  'Sanitize $_GET input before use.'),
        '$_POST':      ('warning',  'Sanitize $_POST input before use.'),
        'md5(':        ('warning',  'MD5 is weak — use password_hash().'),
        'echo $_':     ('critical', 'Direct echo of user input is XSS vulnerable.'),
        'password':    ('info',     'Possible hardcoded password.'),
    }

    for i, line in enumerate(lines, 1):
        for keyword, (severity, desc) in php_dangerous.items():
            if keyword.lower() in line.lower():
                issues.append({'severity': severity, 'title': f'PHP: {keyword}', 'desc': desc, 'line': i})
                security_score -= {'critical': 25, 'warning': 15, 'info': 5}.get(severity, 5)

    if '/**' not in code:
        issues.append({'severity': 'info', 'title': 'No PHPDoc', 'desc': 'Add /** */ PHPDoc comments.', 'line': 0})
        doc_score -= 15

    for i, line in enumerate(lines, 1):
        if re.search(r'//\s*(TODO|FIXME)', line, re.IGNORECASE):
            issues.append({'severity': 'info', 'title': 'TODO/FIXME found', 'desc': f'Found: {line.strip()}', 'line': i})
            quality_score -= 3

    for i, line in enumerate(lines, 1):
        if len(line) > 120:
            issues.append({'severity': 'info', 'title': 'Long line', 'desc': f'Line {i} has {len(line)} chars.', 'line': i})
            quality_score -= 2

    if len(lines) > 500:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines.', 'line': 0})
        arch_score -= 15

    metrics['code_quality']  = max(quality_score, 30)
    metrics['security']      = max(security_score, 0)
    metrics['documentation'] = max(doc_score, 20)
    metrics['architecture']  = min(max(arch_score, 20), 100)
    metrics['complexity']    = max(complexity_score, 20)


def analyze_swift(code, lines, result):
    issues  = result['issues']
    metrics = result['metrics']

    quality_score    = 100
    security_score   = 100
    doc_score        = 60
    arch_score       = 70
    complexity_score = 100

    swift_dangerous = {
        'try!':       ('warning', 'try! force-throws — use do/try/catch instead.'),
        'as!':        ('warning', 'Force cast as! can crash — use as? instead.'),
        'fatalError': ('warning', 'fatalError() crashes the app — handle errors gracefully.'),
        'password':   ('info',    'Possible hardcoded password.'),
        'print(':     ('info',    'Remove print() before production.'),
        'TODO':       ('info',    'Unresolved TODO found.'),
        'FIXME':      ('info',    'Unresolved FIXME found.'),
    }

    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        for keyword, (severity, desc) in swift_dangerous.items():
            if keyword in stripped:
                issues.append({'severity': severity, 'title': f'Swift: {keyword}', 'desc': desc, 'line': i})
                security_score -= {'critical': 25, 'warning': 15, 'info': 5}.get(severity, 5)
                break

    comment_lines = sum(1 for l in lines if l.strip().startswith('///') or l.strip().startswith('//'))
    if len(lines) > 20 and comment_lines / len(lines) < 0.1:
        issues.append({'severity': 'info', 'title': 'Low documentation', 'desc': 'Add /// comments for public APIs.', 'line': 0})
        doc_score -= 20

    if 'struct ' in code or 'class ' in code: arch_score += 10
    if 'enum '  in code: arch_score += 5
    if 'protocol ' in code: arch_score += 10

    if len(lines) > 400:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines.', 'line': 0})
        arch_score -= 15

    for i, line in enumerate(lines, 1):
        if len(line) > 110:
            issues.append({'severity': 'info', 'title': 'Long line', 'desc': f'Line {i} has {len(line)} chars.', 'line': i})
            quality_score -= 2

    metrics['code_quality']  = max(quality_score, 30)
    metrics['security']      = max(security_score, 0)
    metrics['documentation'] = max(doc_score, 20)
    metrics['architecture']  = min(max(arch_score, 20), 100)
    metrics['complexity']    = max(complexity_score, 20)


def analyze_generic(code, lines, result):
    metrics = result['metrics']
    issues  = result['issues']
    base    = 70

    if len(lines) > 500:
        issues.append({'severity': 'info', 'title': 'Large file', 'desc': f'{len(lines)} lines.', 'line': 0})
        base -= 10

    for i, line in enumerate(lines, 1):
        if re.search(r'(TODO|FIXME|HACK)', line, re.IGNORECASE):
            issues.append({'severity': 'info', 'title': 'TODO/FIXME found', 'desc': f'Line {i}: {line.strip()}', 'line': i})

    for key in metrics:
        metrics[key] = base


def generate_summary(result):
    score = result['health_score']
    grade = result['grade']
    count = len(result['issues'])

    if score >= 90: return f"Grade {grade} — Excellent code! {count} minor suggestion(s)."
    elif score >= 75: return f"Grade {grade} — Good code with room for improvement. {count} issue(s)."
    elif score >= 60: return f"Grade {grade} — Decent code but needs attention. {count} issue(s)."
    elif score >= 40: return f"Grade {grade} — Needs significant improvement. {count} issue(s)."
    else: return f"Grade {grade} — Critical issues detected. {count} issue(s) need attention."