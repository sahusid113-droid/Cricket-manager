// main.js

// Globals
let squads = {}; // Will hold IPL + ICC squads data (to be loaded)
let selectedTeam = null;
let matchHistory = JSON.parse(localStorage.getItem('matchHistory') || '[]');

// Navigation buttons
const navButtons = document.querySelectorAll('.nav-btn');
const sections = {
  'nav-team-select': document.getElementById('team-select-section'),
  'nav-simulation': document.getElementById('simulation-section'),
  'nav-data': document.getElementById('data-section')
};

// UI Elements
const teamListDiv = document.getElementById('team-list');
const startMatchBtn = document.getElementById('start-match-btn');
const simulationStatus = document.getElementById('simulation-status');
const matchLog = document.getElementById('match-log');
const talkCoachBtn = document.getElementById('talk-coach-btn');
const coachAdviceDiv = document.getElementById('coach-advice');
const teamStatsDiv = document.getElementById('team-stats');

// Simple helper: clear children
function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

// Switch nav and sections
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    Object.values(sections).forEach(s => s.classList.add('hidden-section'));
    sections[btn.id].classList.remove('hidden-section');
    if (btn.id === 'nav-data') {
      updateDataTab();
      coachAdviceDiv.textContent = '';
    }
  });
});

// Load squads data (placeholder - real JSON will be loaded later)
async function loadSquads() {
  try {
    const response = await fetch('data/squads.json');
    squads = await response.json();
    renderTeamList();
  } catch (err) {
    teamListDiv.textContent = 'Failed to load squads data.';
    console.error(err);
  }
}

// Render team cards for selection
function renderTeamList() {
  clearChildren(teamListDiv);
  for (const teamName in squads) {
    const card = document.createElement('div');
    card.className = 'team-card';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-pressed', 'false');
    // Team logo placeholder or real img
    const logo = document.createElement('img');
    logo.className = 'team-logo';
    logo.src = squads[teamName].logo || 'assets/placeholder-team.svg';
    logo.alt = `${teamName} logo`;
    card.appendChild(logo);
    const name = document.createElement('div');
    name.textContent = teamName;
    card.appendChild(name);
    card.addEventListener('click', () => {
      selectTeam(teamName, card);
    });
    card.addEventListener('keypress', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        selectTeam(teamName, card);
      }
    });
    teamListDiv.appendChild(card);
  }
}

// Select team handler
function selectTeam(teamName, card) {
  selectedTeam = teamName;
  // Deselect others
  document.querySelectorAll('.team-card').forEach(c => {
    c.setAttribute('aria-pressed', 'false');
    c.style.borderColor = 'transparent';
  });
  card.setAttribute('aria-pressed', 'true');
  card.style.borderColor = '#004080';
  simulationStatus.textContent = `Selected team: ${teamName}`;
  matchLog.textContent = '';
}

// Basic random match simulation (very simple for demo)
function simulateMatch() {
  if (!selectedTeam) {
    alert('Please select a team first!');
    return;
  }
  simulationStatus.textContent = `Simulating match for ${selectedTeam}...`;
  matchLog.textContent = '';
  
  // Simulate basic runs and wickets randomly
  let runs = Math.floor(Math.random() * 301) + 120; // 120 to 420 runs
  let wickets = Math.floor(Math.random() * 11); // 0 to 10 wickets
  
  // Log summary
  let result = `Match result for ${selectedTeam}:\nRuns scored: ${runs}\nWickets lost: ${wickets}\n`;
  matchLog.textContent = result;

  // Store in match history with timestamp
  const matchRecord = {
    team: selectedTeam,
    runs,
    wickets,
    date: new Date().toISOString(),
    won: runs > 200 // Arbitrary win condition
  };
  matchHistory.push(matchRecord);
  localStorage.setItem('matchHistory', JSON.stringify(matchHistory));
  
  // Update simulation status
  simulationStatus.textContent = result.split('\n')[0];

  // Clear coach advice on new match
  coachAdviceDiv.textContent = '';
}

// Update Data tab with team stats and coach advice placeholder
function updateDataTab() {
  clearChildren(teamStatsDiv);
  if (!selectedTeam) {
    teamStatsDiv.textContent = 'Select a team first in the Team Select tab.';
    return;
  }
  // Show match history summary for selected team
  const teamMatches = matchHistory.filter(m => m.team === selectedTeam);
  if (teamMatches.length === 0) {
    teamStatsDiv.textContent = 'No matches played yet for this team.';
    return;
  }
  
  // Create table of matches
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  ['Date', 'Runs', 'Wickets', 'Result'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  teamMatches.forEach(match => {
    const tr = document.createElement('tr');
    const d = new Date(match.date);
    const cells = [
      d.toLocaleDateString(),
      match.runs,
      match.wickets,
      match.won ? 'Win' : 'Loss'
    ];
    cells.forEach(c => {
      const td = document.createElement('td');
      td.textContent = c;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  teamStatsDiv.appendChild(table);
}

// Coach Edge AI assistant logic
function getCoachAdvice() {
  if (!selectedTeam) {
    coachAdviceDiv.textContent = 'Select a team first to get advice.';
    return;
  }
  
  const teamMatches = matchHistory.filter(m => m.team === selectedTeam);
  if (teamMatches.length === 0) {
    coachAdviceDiv.textContent = 'No match data yet. Play a match to get advice.';
    return;
  }
  
  const lastMatch = teamMatches[teamMatches.length - 1];
  let advice = '';
  
  if (lastMatch.won) {
    // Win messages (some variation)
    const winLines = [
      "Told you they’d crumble like a stale samosa.",
      "Job done. Let’s keep the trophy cabinet dust-free.",
      "That was cricket poetry in motion!"
    ];
    advice = winLines[Math.floor(Math.random() * winLines.length)];
  } else {
    // Loss messages (light sarcasm)
    const lossLines = [
      "I’ve seen better fielding in street cricket.",
      "We didn’t lose, we just gave them practice… now let’s fix it.",
      "Time to rethink the batting order, captain."
    ];
    advice = lossLines[Math.floor(Math.random() * lossLines.length)];
  }
  
  coachAdviceDiv.textContent = advice;
}

// Event listeners
startMatchBtn.addEventListener('click', simulateMatch);
talkCoachBtn.addEventListener('click', getCoachAdvice);

// Initialize
window.addEventListener('load', () => {
  loadSquads();
});