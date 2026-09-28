import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions'

def get_ai_explanation(issue_title, code_snippet):
    if not GROQ_API_KEY:
        return "AI explanations unavailable — add GROQ_API_KEY to your .env file."

    prompt = f"""You are a helpful code reviewer. Explain this code issue in simple terms for a beginner developer.

Issue: {issue_title}

Code context:
{code_snippet[:500]}

Explain:
1. What the problem is (in simple terms)
2. Why it matters
3. How to fix it (with a code example)

Keep it concise and beginner-friendly."""

    try:
        response = requests.post(
            GROQ_URL,
            headers={
                'Authorization': f'Bearer {GROQ_API_KEY}',
                'Content-Type':  'application/json',
            },
            json={
                'model':       'llama3-8b-8192',
                'messages':    [{'role': 'user', 'content': prompt}],
                'max_tokens':  400,
                'temperature': 0.7,
            },
            timeout=15
        )
        data = response.json()
        return data['choices'][0]['message']['content']
    except Exception as e:
        return f"AI explanation unavailable: {str(e)}"