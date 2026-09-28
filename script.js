// ── Theme ──
let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light",
  );
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.textContent = isDark ? "🌙" : "☀️";
  });
  if (lastResult) setTimeout(() => drawRadarChart(lastResult.metrics), 100);
}

// ── Navigation ──
function goToApp() {
  document.getElementById("landing").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
}

function goToLanding() {
  document.getElementById("app").classList.add("hidden");
  document.getElementById("landing").classList.remove("hidden");
}

// ── Tabs ──
function switchTab(tab) {
  document
    .getElementById("tab-analyze-content")
    .classList.toggle("hidden", tab !== "analyze");
  document
    .getElementById("tab-compare-content")
    .classList.toggle("hidden", tab !== "compare");
  document
    .getElementById("tab-analyze")
    .classList.toggle("active", tab === "analyze");
  document
    .getElementById("tab-compare")
    .classList.toggle("active", tab === "compare");
}

// ── Editor ──
const codeInput = document.getElementById("code-input");
const lineNumbers = document.getElementById("line-numbers");

function updateEditor() {
  const lines = codeInput.value.split("\n");
  lineNumbers.textContent = lines.map((_, i) => i + 1).join("\n");
  document.getElementById("char-count").textContent =
    `${codeInput.value.length} characters`;
  document.getElementById("line-count").textContent = `${lines.length} lines`;
  lineNumbers.scrollTop = codeInput.scrollTop;
}

codeInput.addEventListener("scroll", () => {
  lineNumbers.scrollTop = codeInput.scrollTop;
});
codeInput.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = codeInput.selectionStart;
    const end = codeInput.selectionEnd;
    codeInput.value =
      codeInput.value.substring(0, start) +
      "    " +
      codeInput.value.substring(end);
    codeInput.selectionStart = codeInput.selectionEnd = start + 4;
    updateEditor();
  }
});

updateEditor();

// ── File Upload ──
function handleFileUpload(file, targetId) {
  if (!file) return;
  const ext = file.name.split(".").pop().toLowerCase();
  const reader = new FileReader();
  reader.onload = (ev) => {
    if (targetId === "code-input") {
      codeInput.value = ev.target.result;
      updateEditor();
      document.getElementById("file-name").textContent = `📄 ${file.name}`;
      const sel = document.getElementById("language-select");
      if (ext === "py") sel.value = "python";
      else if (["js", "ts", "jsx", "tsx"].includes(ext))
        sel.value = "javascript";
      else if (ext === "java") sel.value = "java";
      else if (["cpp", "c", "h"].includes(ext)) sel.value = "cpp";
      else if (ext === "php") sel.value = "php";
      else if (ext === "swift") sel.value = "swift";
      else sel.value = "other";
    } else {
      document.getElementById(targetId).value = ev.target.result;
    }
  };
  reader.readAsText(file);
}

document.getElementById("file-upload").addEventListener("change", (e) => {
  handleFileUpload(e.target.files[0], "code-input");
});

document.getElementById("compare-upload-a").addEventListener("change", (e) => {
  handleFileUpload(e.target.files[0], "compare-a");
});

document.getElementById("compare-upload-b").addEventListener("change", (e) => {
  handleFileUpload(e.target.files[0], "compare-b");
});

// ── Sample ──
const SAMPLE = `import os
import hashlib

# TODO: Add proper error handling here
def calculate_average(numbers):
    """Calculate the average of a list of numbers."""
    return sum(numbers) / len(numbers)

def get_user_data(user_id):
    query = eval("'SELECT * FROM users WHERE id = ' + str(user_id)")
    return query

class DataProcessor:
    """Process data from various sources."""

    def __init__(self):
        self.api_key = "sk-hardcoded-secret-key-12345"
        self.data = []

    def process(self, input_data):
        result = []
        for item in input_data:
            if item > 0:
                if item < 100:
                    if item % 2 == 0:
                        if item % 3 == 0:
                            result.append(item * 2)
                        else:
                            result.append(item)
                    else:
                        result.append(item * 3)
                else:
                    result.append(item)
            else:
                result.append(0)
        return result

    def hash_password(self, password):
        return hashlib.md5(password.encode()).hexdigest()

def undocumented_function(x, y, z):
    return x * y + z / (x - y)
`;

function loadSample() {
  codeInput.value = SAMPLE;
  document.getElementById("file-name").textContent = "📄 sample.py";
  document.getElementById("language-select").value = "python";
  updateEditor();
}

function clearCode() {
  codeInput.value = "";
  document.getElementById("file-name").textContent = "";
  updateEditor();
  resetResults();
}

function resetResults() {
  document.getElementById("results").classList.add("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ── Live Analysis ──
let liveEnabled = false;
let liveTimer = null;

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "l") {
    e.preventDefault();
    liveEnabled = !liveEnabled;
    const indicator = document.getElementById("live-indicator");
    if (liveEnabled) {
      indicator.className = "live-on";
      indicator.textContent = "⚡ Live: ON";
      showToast("⚡ Live analysis enabled!");
    } else {
      indicator.className = "live-off";
      indicator.textContent = "⚡ Live: OFF";
      showToast("⏹️ Live analysis disabled");
    }
  }
});

codeInput.addEventListener("input", () => {
  updateEditor();
  if (!liveEnabled) return;
  clearTimeout(liveTimer);
  liveTimer = setTimeout(async () => {
    const code = codeInput.value.trim();
    if (code.length < 50) return;
    const language = document.getElementById("language-select").value;
    try {
      const res = await fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, filename: "live" }),
      });
      const data = await res.json();
      if (!data.error) {
        lastResult = data;
        lastCode = code;
        renderResults(data);
      }
    } catch (e) {}
  }, 1500);
});

// ── Toast ──
function showToast(msg) {
  let toast = document.getElementById("devlens-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "devlens-toast";
    toast.style.cssText = `
      position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
      background:#4f8ef7; color:#fff; padding:10px 24px; border-radius:50px;
      font-size:0.82rem; font-weight:600; z-index:200; pointer-events:none;
      transition: opacity 0.3s;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = "1";
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);
}

// ── History ──
let historyVisible = false;

function toggleHistory() {
  const panel = document.getElementById("history-panel");
  historyVisible = !historyVisible;
  panel.classList.toggle("hidden", !historyVisible);
  if (historyVisible) loadHistory();
}

async function loadHistory() {
  try {
    const res = await fetch("/history");
    const data = await res.json();
    const list = document.getElementById("history-list");

    if (data.length === 0) {
      list.innerHTML = '<div class="no-history">No analyses yet!</div>';
      return;
    }

    list.innerHTML = "";
    data.reverse().forEach((item) => {
      const div = document.createElement("div");
      div.classList.add("history-item");
      const color =
        item.score >= 80 ? "#4ade80" : item.score >= 60 ? "#f59e0b" : "#e94560";
      div.innerHTML = `
        <div class="history-item-top">
          <span class="history-filename">📄 ${item.filename}</span>
          <span>
            <span class="history-score" style="color:${color}">${item.score}</span>
            <span class="history-grade" style="color:${color}">${item.grade || ""}</span>
          </span>
        </div>
        <div class="history-meta">${item.language} · ${item.lines} lines · ${item.issues} issues</div>
      `;
      div.addEventListener("click", () => loadHistoryItem(item.id));
      list.appendChild(div);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadHistoryItem(id) {
  const res = await fetch(`/history/${id}`);
  const data = await res.json();
  renderResults(data);
  toggleHistory();
}

// ── Analyze ──
let lastResult = null;
let lastCode = "";
let previousScore = null;

async function analyzeCode() {
  const code = codeInput.value.trim();
  const language = document.getElementById("language-select").value;
  const filename =
    document.getElementById("file-name").textContent.replace("📄 ", "") ||
    "untitled";

  if (!code) {
    alert("Please paste some code first!");
    return;
  }

  const btn = document.getElementById("analyze-btn");
  const btnText = document.getElementById("btn-text");
  btn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> Analyzing...';

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, filename }),
    });
    const data = await res.json();
    if (data.error) {
      alert("Error: " + data.error);
      return;
    }
    lastResult = data;
    lastCode = code;
    renderResults(data);
  } catch (err) {
    alert("Could not connect to server!");
  } finally {
    btn.disabled = false;
    btnText.innerHTML = "🔬 Analyze";
  }
}

async function reanalyze() {
  if (!lastCode) return;
  previousScore = lastResult?.health_score ?? null;
  await analyzeCode();
}

// ── Auto Fix ──
async function autoFix() {
  if (!lastCode) return;
  const language = document.getElementById("language-select").value;

  try {
    const res = await fetch("/auto-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: lastCode, language }),
    });
    const data = await res.json();
    const fixCard = document.getElementById("fix-card");
    fixCard.classList.remove("hidden");
    document.getElementById("fix-content").innerHTML =
      `<pre class="fixed-code">${escHtml(data.fixed_code)}</pre>`;
    fixCard.scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    alert("Auto-fix failed!");
  }
}

function copyFixedCode() {
  const code = document.getElementById("fix-content").textContent;
  navigator.clipboard.writeText(code);
  const btn = document.querySelector(".copy-fix-btn");
  btn.textContent = "✅ Copied!";
  setTimeout(() => {
    btn.textContent = "📋 Copy";
  }, 2000);
}

// ── Render Results ──
function renderResults(data) {
  const results = document.getElementById("results");
  results.classList.remove("hidden");
  results.scrollIntoView({ behavior: "smooth" });

  // Improvement Banner
  const banner = document.getElementById("improvement-banner");
  const impText = document.getElementById("improvement-text");

  if (previousScore !== null) {
    const diff = data.health_score - previousScore;
    banner.classList.remove("hidden", "positive", "negative", "neutral");
    if (diff > 0) {
      banner.classList.add("positive");
      impText.textContent = `🎉 Improvement! Score went up ${diff} points (${previousScore} → ${data.health_score})`;
    } else if (diff < 0) {
      banner.classList.add("negative");
      impText.textContent = `📉 Score dropped ${Math.abs(diff)} points (${previousScore} → ${data.health_score})`;
    } else {
      banner.classList.add("neutral");
      impText.textContent = `Score unchanged at ${data.health_score}/100`;
    }
  } else {
    banner.classList.add("hidden");
  }

  // Score animation
  const score = data.health_score;
  const scoreArc = document.getElementById("score-arc");
  const offset = 314 - (score / 100) * 314;

  let current = 0;
  const timer = setInterval(() => {
    current += 2;
    if (current >= score) {
      current = score;
      clearInterval(timer);
    }
    document.getElementById("score-num").textContent = current;
  }, 20);

  setTimeout(() => {
    scoreArc.style.strokeDashoffset = offset;
    scoreArc.style.stroke =
      score >= 80 ? "#4ade80" : score >= 60 ? "#f59e0b" : "#e94560";
  }, 100);

  // Grade badge
  const gradeBadge = document.getElementById("grade-badge");
  if (gradeBadge && data.grade) {
    gradeBadge.textContent = data.grade;
    gradeBadge.style.background = (data.grade_color || "#e94560") + "22";
    gradeBadge.style.color = data.grade_color || "#e94560";
    gradeBadge.style.border = `1px solid ${data.grade_color || "#e94560"}44`;
  }

  document.getElementById("score-summary").textContent = data.summary;
  document.getElementById("score-meta").textContent =
    `${data.lines} lines · ${data.language || "Python"} · ${data.filename || "untitled"}`;

  // Performance
  const perfSection = document.getElementById("perf-section");
  const perfs = estimatePerformance(data);
  perfSection.innerHTML = perfs
    .map(
      (p) => `
    <div class="perf-item">
      <div class="perf-dot" style="background:${p.color}"></div>
      <span>${p.label}</span>
    </div>
  `,
    )
    .join("");

  // Metrics
  const metricsGrid = document.getElementById("metrics-grid");
  metricsGrid.innerHTML = "";

  const metricConfig = {
    architecture: { label: "🏗 Architecture", color: "#4f8ef7" },
    code_quality: { label: "🧹 Code Quality", color: "#4ade80" },
    documentation: { label: "📚 Docs", color: "#8b5cf6" },
    security: { label: "🔐 Security", color: "#f59e0b" },
    complexity: { label: "🧠 Complexity", color: "#e94560" },
  };

  Object.entries(data.metrics).forEach(([key, value]) => {
    const config = metricConfig[key] || { label: key, color: "#4f8ef7" };
    const item = document.createElement("div");
    item.classList.add("metric-item");
    item.innerHTML = `
      <div class="metric-label">${config.label}</div>
      <div class="metric-score" style="color:${config.color}">${value}</div>
      <div class="metric-bar">
        <div class="metric-fill" style="background:${config.color};width:0%" data-width="${value}"></div>
      </div>
    `;
    metricsGrid.appendChild(item);
  });

  setTimeout(() => {
    document.querySelectorAll(".metric-fill").forEach((bar) => {
      bar.style.width = bar.dataset.width + "%";
    });
  }, 200);

  // Issues
  const issuesList = document.getElementById("issues-list");
  const issuesCount = document.getElementById("issues-count");
  issuesList.innerHTML = "";
  issuesCount.textContent = data.issues.length;

  if (data.issues.length === 0) {
    issuesList.innerHTML = `
      <div class="no-issues">
        <div class="no-issues-emoji">🎉</div>
        <h4>No issues found!</h4>
        <p>Your code is clean and well-written.</p>
      </div>
    `;
  } else {
    data.issues.forEach((issue) => {
      const icons = { critical: "🔴", warning: "🟡", info: "🔵" };
      const item = document.createElement("div");
      item.classList.add("issue-item");
      item.innerHTML = `
        <div class="issue-icon ${issue.severity}">${icons[issue.severity] || "🔵"}</div>
        <div class="issue-content">
          <div class="issue-title">${issue.title}</div>
          <div class="issue-desc">${issue.desc}</div>
          <div class="issue-fix">💡 ${getFixHint(issue)}</div>
        </div>
        <div class="issue-actions">
          ${issue.line > 0 ? `<div class="issue-line" onclick="jumpToLine(${issue.line})">📍 Line ${issue.line}</div>` : ""}
          <button class="ai-btn" onclick="askAI('${escHtml(issue.title)}')">🤖 Explain</button>
        </div>
      `;
      issuesList.appendChild(item);
    });
  }

  renderDiff(data.issues);

  // Radar chart
  setTimeout(() => drawRadarChart(data.metrics), 300);
}

// ── Performance Estimator ──
function estimatePerformance(data) {
  const m = data.metrics;
  const s = data.health_score;
  return [
    {
      label: `Maintainability: ${Math.round((m.code_quality + m.documentation + m.architecture) / 3) >= 70 ? "Good ✓" : "Needs Work ✗"}`,
      color:
        Math.round((m.code_quality + m.documentation + m.architecture) / 3) >=
        70
          ? "#4ade80"
          : "#e94560",
    },
    {
      label: `Security Level: ${m.security >= 80 ? "Strong ✓" : m.security >= 60 ? "Moderate" : "Weak ✗"}`,
      color:
        m.security >= 80 ? "#4ade80" : m.security >= 60 ? "#f59e0b" : "#e94560",
    },
    {
      label: `Readability: ${Math.round((m.documentation + m.code_quality) / 2) >= 70 ? "Clear ✓" : "Hard to Read ✗"}`,
      color:
        Math.round((m.documentation + m.code_quality) / 2) >= 70
          ? "#4ade80"
          : "#e94560",
    },
    {
      label: `Production Ready: ${s >= 80 ? "Yes ✓" : s >= 60 ? "Almost" : "Not Yet ✗"}`,
      color: s >= 80 ? "#4ade80" : s >= 60 ? "#f59e0b" : "#e94560",
    },
  ];
}

// ── Radar Chart ──
function drawRadarChart(metrics) {
  const canvas = document.getElementById("radar-chart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 40;
  const labels = ["Architecture", "Quality", "Docs", "Security", "Complexity"];
  const values = [
    metrics.architecture / 100,
    metrics.code_quality / 100,
    metrics.documentation / 100,
    metrics.security / 100,
    metrics.complexity / 100,
  ];
  const n = labels.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const darkMode =
    document.documentElement.getAttribute("data-theme") !== "light";
  const ringColor = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textColor = darkMode ? "#888899" : "#64748b";

  // Rings
  for (let r = 1; r <= 5; r++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * ((radius * r) / 5);
      const y = cy + Math.sin(angle) * ((radius * r) / 5);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Axis lines
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (radius * values[i]);
    const y = cy + Math.sin(angle) * (radius * values[i]);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(79,142,247,0.18)";
  ctx.fill();
  ctx.strokeStyle = "#4f8ef7";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Points
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * (radius * values[i]);
    const y = cy + Math.sin(angle) * (radius * values[i]);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#4f8ef7";
    ctx.fill();
  }

  // Labels
  ctx.font = "11px -apple-system, sans-serif";
  ctx.textAlign = "center";

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const lx = cx + Math.cos(angle) * (radius + 22);
    const ly = cy + Math.sin(angle) * (radius + 22);
    ctx.fillStyle = textColor;
    ctx.fillText(labels[i], lx, ly);
    ctx.fillStyle = "#4f8ef7";
    ctx.fillText(`${Math.round(values[i] * 100)}`, lx, ly + 13);
  }
}

// ── Jump to Line ──
function jumpToLine(lineNum) {
  const lines = codeInput.value.split("\n");
  let charPos = 0;
  for (let i = 0; i < lineNum - 1; i++) charPos += lines[i].length + 1;

  goToApp();
  switchTab("analyze");

  setTimeout(() => {
    codeInput.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      codeInput.focus();
      codeInput.setSelectionRange(
        charPos,
        charPos + (lines[lineNum - 1] || "").length,
      );
      codeInput.scrollTop = (lineNum - 5) * 24;
      codeInput.style.outline = "2px solid #e94560";
      setTimeout(() => {
        codeInput.style.outline = "";
      }, 1500);
    }, 400);
  }, 100);
}

// ── AI Explain ──
async function askAI(issueTitle) {
  const modal = document.getElementById("ai-modal");
  const body = document.getElementById("ai-explanation");
  modal.classList.remove("hidden");
  body.innerHTML =
    '<div class="ai-loading"><div class="spinner"></div><span>AI is thinking...</span></div>';

  try {
    const res = await fetch("/ai-explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        issue: issueTitle,
        code: codeInput.value.substring(0, 500),
      }),
    });
    const data = await res.json();
    body.textContent = data.explanation;
  } catch (err) {
    body.textContent = "AI unavailable. Check GROQ_API_KEY in .env";
  }
}

function closeAIModal() {
  document.getElementById("ai-modal").classList.add("hidden");
}

document.getElementById("ai-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeAIModal();
});

// ── Compare ──
async function compareFiles() {
  const codeA = document.getElementById("compare-a").value.trim();
  const codeB = document.getElementById("compare-b").value.trim();
  const language = document.getElementById("compare-lang").value;

  if (!codeA || !codeB) {
    alert("Please paste code in both editors!");
    return;
  }

  const btn = document.getElementById("compare-btn");
  const btnText = document.getElementById("compare-btn-text");
  btn.disabled = true;
  btnText.innerHTML = '<span class="spinner"></span> Comparing...';

  try {
    const [resA, resB] = await Promise.all([
      fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeA, language, filename: "File A" }),
      }),
      fetch("/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeB, language, filename: "File B" }),
      }),
    ]);
    const dataA = await resA.json();
    const dataB = await resB.json();
    renderCompare(dataA, dataB);
  } catch (err) {
    alert("Compare failed!");
  } finally {
    btn.disabled = false;
    btnText.innerHTML = "📊 Compare Files";
  }
}

function renderCompare(a, b) {
  const results = document.getElementById("compare-results");
  results.classList.remove("hidden");
  results.scrollIntoView({ behavior: "smooth" });

  const winner = document.getElementById("compare-winner");
  const diff = a.health_score - b.health_score;

  if (diff > 0) {
    winner.className = "compare-winner a-wins";
    winner.textContent = `🏆 File A wins! Grade ${a.grade} (${a.health_score}) vs Grade ${b.grade} (${b.health_score}) — ${diff} points better`;
  } else if (diff < 0) {
    winner.className = "compare-winner b-wins";
    winner.textContent = `🏆 File B wins! Grade ${b.grade} (${b.health_score}) vs Grade ${a.grade} (${a.health_score}) — ${Math.abs(diff)} points better`;
  } else {
    winner.className = "compare-winner tie";
    winner.textContent = `🤝 It's a tie! Both scored ${a.health_score}/100 (Grade ${a.grade})`;
  }

  const colorA =
    a.health_score >= 80
      ? "#4ade80"
      : a.health_score >= 60
        ? "#f59e0b"
        : "#e94560";
  const colorB =
    b.health_score >= 80
      ? "#4ade80"
      : b.health_score >= 60
        ? "#f59e0b"
        : "#e94560";

  document.getElementById("score-a").innerHTML = `
    <div class="compare-score-num" style="color:${colorA}">${a.health_score}</div>
    <div style="color:${colorA};font-size:1.5rem;font-weight:900;margin-bottom:4px">${a.grade}</div>
    <div class="compare-score-label">File A · ${a.lines} lines</div>
    <div style="font-size:0.78rem;color:var(--text2)">${a.issues.length} issues</div>
  `;

  document.getElementById("score-b").innerHTML = `
    <div class="compare-score-num" style="color:${colorB}">${b.health_score}</div>
    <div style="color:${colorB};font-size:1.5rem;font-weight:900;margin-bottom:4px">${b.grade}</div>
    <div class="compare-score-label">File B · ${b.lines} lines</div>
    <div style="font-size:0.78rem;color:var(--text2)">${b.issues.length} issues</div>
  `;

  if (diff > 0) document.getElementById("score-a").classList.add("winner");
  else if (diff < 0) document.getElementById("score-b").classList.add("winner");

  const detail = document.getElementById("compare-detail");
  const metricConfig = {
    architecture: "🏗 Architecture",
    code_quality: "🧹 Code Quality",
    documentation: "📚 Documentation",
    security: "🔐 Security",
    complexity: "🧠 Complexity",
  };

  detail.innerHTML = `
    <div class="compare-detail-row" style="background:var(--bg3);font-size:0.72rem;color:var(--text2);font-weight:600">
      <div>Metric</div><div>File A</div><div>File B</div>
    </div>
    ${Object.entries(metricConfig)
      .map(([key, label]) => {
        const va = a.metrics[key] || 0;
        const vb = b.metrics[key] || 0;
        return `
        <div class="compare-detail-row">
          <div class="compare-detail-label">${label}</div>
          <div class="compare-detail-val ${va > vb ? "better" : va < vb ? "worse" : ""}">${va}</div>
          <div class="compare-detail-val ${vb > va ? "better" : vb < va ? "worse" : ""}">${vb}</div>
        </div>
      `;
      })
      .join("")}
  `;
}

// ── Diff ──
function renderDiff(issues) {
  const diffContent = document.getElementById("diff-content");
  diffContent.innerHTML = "";
  const fixable = issues.filter((i) => getDiff(i));

  if (fixable.length === 0) {
    diffContent.innerHTML =
      '<div class="no-diff">✅ No automatic fixes needed!</div>';
    return;
  }

  fixable.forEach((issue) => {
    const diff = getDiff(issue);
    if (!diff) return;
    const item = document.createElement("div");
    item.classList.add("diff-item");
    item.innerHTML = `
      <div class="diff-issue-title">⚠️ ${issue.title}</div>
      <div class="diff-cols">
        <div>
          <div class="diff-col-label before">❌ Before</div>
          <div class="diff-code before">${escHtml(diff.before)}</div>
        </div>
        <div>
          <div class="diff-col-label after">✅ After</div>
          <div class="diff-code after">${escHtml(diff.after)}</div>
        </div>
      </div>
    `;
    diffContent.appendChild(item);
  });
}

function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function getDiff(issue) {
  const diffs = {
    "Bare except": {
      before: `try:\n    do_something()\nexcept:\n    pass`,
      after: `try:\n    do_something()\nexcept ValueError as e:\n    print(f"Error: {e}")`,
    },
    eval: {
      before: `result = eval(user_input)`,
      after: `import ast\nresult = ast.literal_eval(user_input)`,
    },
    md5: {
      before: `hash = hashlib.md5(password.encode()).hexdigest()`,
      after: `hash = hashlib.sha256(password.encode()).hexdigest()`,
    },
    docstring: {
      before: `def calculate(x, y):\n    return x + y`,
      after: `def calculate(x, y):\n    """Add two numbers.\n    Args:\n        x: First\n        y: Second\n    Returns: Sum\n    """\n    return x + y`,
    },
    api_key: {
      before: `api_key = "sk-abc123"`,
      after: `import os\napi_key = os.environ.get("API_KEY")`,
    },
    password: {
      before: `password = "mypassword"`,
      after: `import os\npassword = os.environ.get("DB_PASSWORD")`,
    },
    innerHTML: {
      before: `element.innerHTML = userInput`,
      after: `element.textContent = userInput`,
    },
    var: {
      before: `var x = 10`,
      after: `const x = 10`,
    },
  };

  for (const [key, diff] of Object.entries(diffs)) {
    if (
      issue.title.toLowerCase().includes(key.toLowerCase()) ||
      issue.desc.toLowerCase().includes(key.toLowerCase())
    ) {
      return diff;
    }
  }
  return null;
}

function getFixHint(issue) {
  const hints = {
    "Bare except": "Use except ValueError as e: instead",
    eval: "Replace with ast.literal_eval()",
    md5: "Use hashlib.sha256() instead",
    api_key: 'Move to os.environ.get("API_KEY")',
    password: "Move to environment variable",
    secret: "Move to environment variable",
    docstring: 'Add docstring: """Description."""',
    TODO: "Resolve or create a tracking ticket",
    "Long line": "Break into multiple lines",
    complexity: "Split into smaller functions",
    Duplicate: "Extract into a reusable function",
    innerHTML: "Use textContent to prevent XSS",
    "console.log": "Remove before production",
    var: "Use const or let instead",
    "Runtime.exec": "Use ProcessBuilder instead",
    "gets(": "Use fgets() instead",
    "strcpy(": "Use strncpy() instead",
    mysql_query: "Use PDO or MySQLi instead",
    "try!": "Use do/try/catch instead",
    "as!": "Use as? for safe casting",
  };

  for (const [key, hint] of Object.entries(hints)) {
    if (
      issue.title.toLowerCase().includes(key.toLowerCase()) ||
      issue.desc.toLowerCase().includes(key.toLowerCase())
    ) {
      return hint;
    }
  }
  return "Review and apply the suggested fix";
}

// ── Export PDF ──
function exportPDF() {
  if (!lastResult) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const score = lastResult.health_score;

  doc.setFontSize(22);
  doc.setTextColor(79, 142, 247);
  doc.text("DevLens AI — Code Health Report", 20, 25);

  doc.setFontSize(10);
  doc.setTextColor(136, 136, 153);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 35);
  doc.text(
    `File: ${lastResult.filename || "untitled"} · Language: ${lastResult.language || "Python"}`,
    20,
    43,
  );

  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(17, 17, 24);
  doc.roundedRect(20, 50, 170, 35, 5, 5, "F");
  doc.text(`Score: ${score}/100  Grade: ${lastResult.grade || ""}`, 30, 72);

  doc.setFontSize(11);
  doc.setTextColor(136, 136, 153);
  doc.text(lastResult.summary, 20, 96);

  let y = 112;
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("Metrics", 20, y);
  y += 10;

  Object.entries(lastResult.metrics).forEach(([key, value]) => {
    const label = key
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`${label}: ${value}/100`, 25, y);
    y += 8;
  });

  y += 8;
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(`Issues (${lastResult.issues.length})`, 20, y);
  y += 10;

  lastResult.issues.forEach((issue) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    const sev = issue.severity.toUpperCase();
    doc.setFontSize(10);
    doc.setTextColor(
      issue.severity === "critical"
        ? 233
        : issue.severity === "warning"
          ? 245
          : 79,
      issue.severity === "critical"
        ? 69
        : issue.severity === "warning"
          ? 158
          : 142,
      issue.severity === "critical"
        ? 96
        : issue.severity === "warning"
          ? 11
          : 247,
    );
    doc.text(
      `[${sev}] ${issue.title}${issue.line > 0 ? ` — Line ${issue.line}` : ""}`,
      25,
      y,
    );
    y += 6;
    doc.setTextColor(136, 136, 153);
    const descLines = doc.splitTextToSize(issue.desc, 160);
    doc.text(descLines, 25, y);
    y += descLines.length * 6 + 4;
  });

  doc.save("devlens-report.pdf");
}
