// ROLE SELECT
const roleBtns = document.querySelectorAll('.role-btn');
let selectedRole = 'Software Engineer';

roleBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    roleBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedRole = btn.dataset.role;
  });
});

// MAIN FUNCTION
async function analyzeResume() {

  const text = document.getElementById('resumeText').value.trim();

  if (!text || text.length < 20) {
    alert('Please paste your resume');
    return;
  }

  const loader = document.getElementById('loader');
  loader.style.display = 'block';

  try {

    const res = await fetch('http://127.0.0.1:5001/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resume: text,
        role: selectedRole
      })
    });

    const data = await res.json();

    renderResults(data);

  } catch (err) {
    console.error(err);
    alert("Error: " + err.message);
  }

  loader.style.display = 'none';
}


// 🔥 MAIN RENDER FUNCTION
function renderResults(d) {

  document.getElementById('resultsRole').textContent = selectedRole;

  // SUMMARY
  document.getElementById('summaryText').textContent = d.summary || "";

  // LISTS
  document.getElementById('strengthsList').innerHTML =
    (d.strengths || []).map(s => `<li>${s}</li>`).join('');

  document.getElementById('improvementsList').innerHTML =
    (d.improvements || []).map(s => `<li>${s}</li>`).join('');

  document.getElementById('keywordsWrap').innerHTML =
    (d.missingKeywords || []).map(k => `<span class="keyword-badge">${k}</span>`).join('');

  document.getElementById('tipsList').innerHTML =
    (d.tips || []).map((t, i) => `
      <div class="tip-item">
        <div class="tip-num">${i + 1}</div>
        <span>${t}</span>
      </div>
    `).join('');

  // 🔥 ATS SCORE CARDS
  renderScores(d);

  // 🔥 PROGRESS BARS
  renderProgressBars(d.sections);

  document.getElementById('results').style.display = 'block';
}


// 🔥 SCORE CARDS
function renderScores(d) {

  const grid = document.getElementById('scoresGrid');

  const score = d.overallScore || 70;

  let colorClass = 'col-low';
  if (score >= 80) colorClass = 'col-good';
  else if (score >= 60) colorClass = 'col-mid';

  grid.innerHTML = `
    <div class="score-card">
      <div class="score-card-label">Overall Score</div>
      <div class="score-card-val ${colorClass}">
        ${score}<span class="unit">/100</span>
      </div>
    </div>
  `;
}


// 🔥 PROGRESS BARS
function renderProgressBars(sections) {

  const container = document.getElementById('progressBars');

  if (!sections) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = Object.entries(sections).map(([key, val]) => {

    let color = 'fill-low';
    if (val >= 80) color = 'fill-good';
    else if (val >= 60) color = 'fill-mid';

    return `
      <div class="prog-row">
        <div class="prog-meta">
          <span>${key}</span>
          <span>${val}%</span>
        </div>
        <div class="prog-track">
          <div class="prog-fill ${color}" style="width:${val}%"></div>
        </div>
      </div>
    `;
  }).join('');
}


// RESET
function resetForm() {
  document.getElementById('resumeText').value = '';
  document.getElementById('results').style.display = 'none';
}