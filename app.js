/**
 * FIFA World Cup 2026 — Application Controller
 * Handles UI rendering, event binding, tab navigation, and bracket visualization
 * Supports two modes: Ranking Mode (drag to rank) and Score Mode (enter scores)
 */

// ─── GLOBALS ────────────────────────────────────────────────────
const engine = new SimulationEngine();
let currentTab = 'groups';

// ─── INITIALIZATION ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateModeToggleUI();
  renderAllGroups();
  renderThirdPlace();
  renderKnockoutBracket();
  renderSummary();
  bindGlobalEvents();
  applyGroupAnimationDelays();
});

// ─── MODE TOGGLE ────────────────────────────────────────────────
function setMode(mode) {
  engine.setMode(mode);
  updateModeToggleUI();
  renderAllGroups();
  renderThirdPlace();
  renderKnockoutBracket();
  renderSummary();
  showToast(mode === 'ranking' ? '📋 Ranking Mode — rank teams by your analysis' : '⚽ Score Mode — enter match scores');
}

function updateModeToggleUI() {
  const toggle = document.getElementById('mode-toggle');
  if (!toggle) return;
  toggle.querySelectorAll('.mode-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.mode === engine.mode);
  });

  // Update subtitle text
  const subtitle = document.querySelector('.section-subtitle');
  if (subtitle && currentTab === 'groups') {
    subtitle.textContent = engine.mode === 'ranking'
      ? 'Drag teams up or down to rank them 1st → 4th in each group'
      : 'Enter scores for each match or auto-simulate groups';
  }

  // Show/hide simulate buttons based on mode
  const simGroups = document.getElementById('btn-simulate-groups');
  const simAll = document.getElementById('btn-simulate-all');
  const heroSim = document.getElementById('btn-hero-simulate');
  if (simGroups) simGroups.style.display = engine.mode === 'ranking' ? 'none' : '';
  if (simAll) simAll.style.display = engine.mode === 'ranking' ? 'none' : '';
  if (heroSim) heroSim.style.display = engine.mode === 'ranking' ? 'none' : '';
}

// ─── TAB NAVIGATION ─────────────────────────────────────────────
function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    tc.classList.toggle('active', tc.dataset.tab === tabName);
  });

  // Refresh tab content
  if (tabName === 'groups') updateModeToggleUI();
  if (tabName === 'third') renderThirdPlace();
  if (tabName === 'knockout') renderKnockoutBracket();
  if (tabName === 'summary') renderSummary();
}

// ─── GLOBAL EVENT BINDINGS ──────────────────────────────────────
function bindGlobalEvents() {
  // Tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Mode toggle buttons
  document.querySelectorAll('.mode-option').forEach(opt => {
    opt.addEventListener('click', () => setMode(opt.dataset.mode));
  });

  // Hero buttons
  document.getElementById('btn-hero-simulate').addEventListener('click', () => {
    engine.simulateAllGroups();
    renderAllGroups();
    simulateFullKnockout();
    showToast('⚡ Full tournament simulated!');
  });

  document.getElementById('btn-hero-start').addEventListener('click', () => {
    switchTab('groups');
    document.getElementById('groups-grid').scrollIntoView({ behavior: 'smooth' });
  });

  // Navbar buttons
  document.getElementById('btn-simulate-all').addEventListener('click', () => {
    engine.simulateAllGroups();
    renderAllGroups();
    simulateFullKnockout();
    showToast('⚡ Full tournament simulated!');
  });

  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('Reset all predictions? This cannot be undone.')) {
      engine.reset();
      renderAllGroups();
      renderThirdPlace();
      renderKnockoutBracket();
      renderSummary();
      showToast('↻ All predictions reset');
    }
  });

  // Group stage buttons
  document.getElementById('btn-simulate-groups').addEventListener('click', () => {
    engine.simulateAllGroups();
    renderAllGroups();
    showToast('⚡ All groups simulated!');
  });

  document.getElementById('btn-reset-groups').addEventListener('click', () => {
    GROUP_NAMES.forEach(g => engine.resetGroup(g));
    engine.resetKnockout();
    renderAllGroups();
    showToast('↻ Groups reset');
  });

  // Knockout buttons
  document.getElementById('btn-simulate-knockout').addEventListener('click', () => {
    if (!engine.areAllGroupsComplete()) {
      showToast('⚠️ Complete all group stage first');
      return;
    }
    simulateFullKnockout();
    showToast('⚡ Knockout stage simulated!');
  });

  document.getElementById('btn-reset-knockout').addEventListener('click', () => {
    engine.resetKnockout();
    renderKnockoutBracket();
    showToast('↻ Knockout reset');
  });
}

// ─── RENDER ALL GROUPS ──────────────────────────────────────────
function renderAllGroups() {
  const grid = document.getElementById('groups-grid');
  grid.innerHTML = '';

  GROUP_NAMES.forEach((groupName, index) => {
    const card = engine.mode === 'ranking'
      ? createRankingGroupCard(groupName, index)
      : createScoreGroupCard(groupName, index);
    grid.appendChild(card);
  });
}

function applyGroupAnimationDelays() {
  document.querySelectorAll('.group-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.05}s`;
  });
}

// ═══════════════════════════════════════════════════════════════
//  RANKING MODE — Group Card with draggable team ranking
// ═══════════════════════════════════════════════════════════════

function createRankingGroupCard(groupName, index) {
  const ranking = engine.getGroupRanking(groupName) || GROUPS[groupName];
  const isRanked = engine.isGroupRanked(groupName);

  const card = document.createElement('div');
  card.className = 'group-card';
  card.style.animationDelay = `${index * 0.05}s`;
  card.id = `group-${groupName}`;

  const bestThird = engine.mode === 'ranking' ? engine.getRankingBestThird() : engine.getBestThirdPlaced();
  const thirdCode = ranking[2];
  const thirdQualifies = bestThird.find(t => t.code === thirdCode && t.qualifies);

  card.innerHTML = `
    <div class="group-card-header">
      <div class="group-label">
        <span class="group-letter">Group ${groupName}</span>
        <span class="group-status ${isRanked ? 'complete' : ''}">
          ${isRanked ? '✓ Ranked' : 'Drag to rank'}
        </span>
      </div>
      <div class="group-card-actions">
        <button class="btn btn-icon btn-sm" onclick="resetGroup('${groupName}')" title="Reset to default">↻</button>
      </div>
    </div>

    <div class="ranking-list" id="ranking-list-${groupName}" data-group="${groupName}">
      ${ranking.map((code, pos) => {
        const team = TEAMS[code];
        let posClass = '';
        if (pos <= 1) posClass = 'rank-qualified';
        else if (pos === 2 && thirdQualifies) posClass = 'rank-third-qualified';
        else if (pos === 2) posClass = 'rank-third';
        else posClass = 'rank-eliminated';

        return `
        <div class="rank-item ${posClass}" data-code="${code}" data-group="${groupName}" draggable="true">
          <div class="rank-position">
            <span class="rank-number">${pos + 1}</span>
          </div>
          <div class="rank-team-info">
            <span class="team-flag">${team.flag}</span>
            <span class="team-name">${team.name}</span>
            <span class="rank-strength" title="FIFA Strength Rating">${team.strength}</span>
          </div>
          <div class="rank-arrows">
            <button class="rank-arrow up" onclick="moveTeamUp('${groupName}', '${code}'); event.stopPropagation();" ${pos === 0 ? 'disabled' : ''} title="Move up">▲</button>
            <button class="rank-arrow down" onclick="moveTeamDown('${groupName}', '${code}'); event.stopPropagation();" ${pos === 3 ? 'disabled' : ''} title="Move down">▼</button>
          </div>
          <div class="rank-badge">
            ${pos === 0 ? '🥇' : pos === 1 ? '🥈' : pos === 2 ? '🥉' : '❌'}
          </div>
        </div>`;
      }).join('')}
    </div>

    <div class="rank-legend-row">
      <span class="rank-legend-item qual">● 1st / 2nd — Qualify</span>
      <span class="rank-legend-item third">● 3rd — Possible</span>
      <span class="rank-legend-item elim">● 4th — Out</span>
    </div>
  `;

  // Setup drag-and-drop
  setupDragAndDrop(card, groupName);

  return card;
}

// ─── RANKING INTERACTIONS ───────────────────────────────────────
function moveTeamUp(groupName, code) {
  const ranking = engine.getGroupRanking(groupName) || [...GROUPS[groupName]];
  const idx = ranking.indexOf(code);
  if (idx <= 0) return;
  [ranking[idx - 1], ranking[idx]] = [ranking[idx], ranking[idx - 1]];
  engine.setGroupRanking(groupName, ranking);
  engine.resetKnockout(); // Rankings changed, knockout is stale
  refreshGroupCard(groupName);
}

function moveTeamDown(groupName, code) {
  const ranking = engine.getGroupRanking(groupName) || [...GROUPS[groupName]];
  const idx = ranking.indexOf(code);
  if (idx >= ranking.length - 1) return;
  [ranking[idx + 1], ranking[idx]] = [ranking[idx], ranking[idx + 1]];
  engine.setGroupRanking(groupName, ranking);
  engine.resetKnockout();
  refreshGroupCard(groupName);
}

function setupDragAndDrop(card, groupName) {
  const list = card.querySelector('.ranking-list');
  if (!list) return;

  let draggedItem = null;

  list.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.rank-item');
    if (!item) return;
    draggedItem = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', (e) => {
    const item = e.target.closest('.rank-item');
    if (item) item.classList.remove('dragging');
    list.querySelectorAll('.rank-item').forEach(el => el.classList.remove('drag-over'));
    draggedItem = null;
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('.rank-item');
    if (target && target !== draggedItem) {
      list.querySelectorAll('.rank-item').forEach(el => el.classList.remove('drag-over'));
      target.classList.add('drag-over');
    }
  });

  list.addEventListener('dragleave', (e) => {
    const target = e.target.closest('.rank-item');
    if (target) target.classList.remove('drag-over');
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.rank-item');
    if (!target || !draggedItem || target === draggedItem) return;

    const items = [...list.querySelectorAll('.rank-item')];
    const fromIdx = items.indexOf(draggedItem);
    const toIdx = items.indexOf(target);

    // Reorder in data
    const ranking = engine.getGroupRanking(groupName) || [...GROUPS[groupName]];
    const [moved] = ranking.splice(fromIdx, 1);
    ranking.splice(toIdx, 0, moved);
    engine.setGroupRanking(groupName, ranking);
    engine.resetKnockout();

    refreshGroupCard(groupName);
  });
}

function refreshGroupCard(groupName) {
  const card = document.getElementById(`group-${groupName}`);
  if (!card) return;
  const index = GROUP_NAMES.indexOf(groupName);
  const newCard = engine.mode === 'ranking'
    ? createRankingGroupCard(groupName, index)
    : createScoreGroupCard(groupName, index);
  card.replaceWith(newCard);
}

// ═══════════════════════════════════════════════════════════════
//  SCORE MODE — Group Card with match score inputs (original)
// ═══════════════════════════════════════════════════════════════

function createScoreGroupCard(groupName, index) {
  const standings = engine.calculateGroupStandings(groupName);
  const matches = generateGroupMatches(groupName);
  const isComplete = engine.isGroupComplete(groupName);
  const bestThird = engine.getBestThirdPlaced();
  const thirdQualifies = bestThird.find(t => t.group === groupName && t.qualifies);

  const card = document.createElement('div');
  card.className = 'group-card';
  card.style.animationDelay = `${index * 0.05}s`;
  card.id = `group-${groupName}`;

  const playedMatches = matches.filter(m => engine.getMatchResult(groupName, m.home, m.away)).length;

  card.innerHTML = `
    <div class="group-card-header">
      <div class="group-label">
        <span class="group-letter">Group ${groupName}</span>
        <span class="group-status ${isComplete ? 'complete' : ''}">${isComplete ? '✓ Complete' : `${playedMatches}/6 played`}</span>
      </div>
      <div class="group-card-actions">
        <button class="btn btn-secondary btn-sm" onclick="simulateGroup('${groupName}')" title="Auto-simulate">⚡</button>
        <button class="btn btn-icon btn-sm" onclick="resetGroup('${groupName}')" title="Reset group">↻</button>
      </div>
    </div>

    <table class="standings-table">
      <thead>
        <tr>
          <th>Team</th>
          <th>MP</th>
          <th>W</th>
          <th>D</th>
          <th>L</th>
          <th>GF</th>
          <th>GA</th>
          <th>GD</th>
          <th>PTS</th>
        </tr>
      </thead>
      <tbody>
        ${standings.map((s, pos) => {
          let posClass = `pos-${pos + 1}`;
          if (pos === 2 && thirdQualifies) posClass += ' qualifies';
          return `
          <tr class="${posClass}">
            <td>
              <div class="team-cell">
                <span class="team-flag">${s.team.flag}</span>
                <span class="team-name">${s.team.name}</span>
              </div>
            </td>
            <td>${s.mp}</td>
            <td>${s.w}</td>
            <td>${s.d}</td>
            <td>${s.l}</td>
            <td>${s.gf}</td>
            <td>${s.ga}</td>
            <td>${s.gd > 0 ? '+' + s.gd : s.gd}</td>
            <td class="pts-cell">${s.pts}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="matches-section">
      ${[1, 2, 3].map(md => {
        const mdMatches = matches.filter(m => m.matchday === md);
        return `
          <div class="matchday-label">Matchday ${md}</div>
          ${mdMatches.map(m => {
            const result = engine.getMatchResult(groupName, m.home, m.away);
            const homeGoals = result ? result.homeGoals : '';
            const awayGoals = result ? result.awayGoals : '';
            return `
            <div class="match-row">
              <div class="match-team home">
                <span class="team-name">${TEAMS[m.home].name}</span>
                <span class="team-code-sm" style="display:none">${m.home}</span>
                <span class="team-flag">${TEAMS[m.home].flag}</span>
              </div>
              <div class="match-score">
                <input type="number" class="score-input ${homeGoals !== '' ? 'filled' : ''}" 
                       min="0" max="20" value="${homeGoals}"
                       data-group="${groupName}" data-home="${m.home}" data-away="${m.away}" data-side="home"
                       id="score-${groupName}-${m.home}-${m.away}-home"
                       onchange="onScoreChange(this)" onfocus="this.select()" />
                <span class="score-separator">–</span>
                <input type="number" class="score-input ${awayGoals !== '' ? 'filled' : ''}"
                       min="0" max="20" value="${awayGoals}"
                       data-group="${groupName}" data-home="${m.home}" data-away="${m.away}" data-side="away"
                       id="score-${groupName}-${m.home}-${m.away}-away"
                       onchange="onScoreChange(this)" onfocus="this.select()" />
              </div>
              <div class="match-team away">
                <span class="team-flag">${TEAMS[m.away].flag}</span>
                <span class="team-name">${TEAMS[m.away].name}</span>
                <span class="team-code-sm" style="display:none">${m.away}</span>
              </div>
            </div>`;
          }).join('')}
        `;
      }).join('')}
    </div>
  `;

  return card;
}

// ─── SCORE CHANGE HANDLER ───────────────────────────────────────
function onScoreChange(input) {
  const { group, home, away, side } = input.dataset;
  const homeInput = document.getElementById(`score-${group}-${home}-${away}-home`);
  const awayInput = document.getElementById(`score-${group}-${home}-${away}-away`);

  const homeVal = homeInput.value;
  const awayVal = awayInput.value;

  if (homeVal !== '' && awayVal !== '') {
    engine.setMatchResult(group, home, away, homeVal, awayVal);
    homeInput.classList.add('filled', 'score-flash');
    awayInput.classList.add('filled', 'score-flash');
    setTimeout(() => {
      homeInput.classList.remove('score-flash');
      awayInput.classList.remove('score-flash');
    }, 500);
  } else if (homeVal === '' && awayVal === '') {
    engine.setMatchResult(group, home, away, null, null);
    homeInput.classList.remove('filled');
    awayInput.classList.remove('filled');
  }

  updateGroupStandings(group);
}

function updateGroupStandings(groupName) {
  const standings = engine.calculateGroupStandings(groupName);
  const isComplete = engine.isGroupComplete(groupName);
  const bestThird = engine.getBestThirdPlaced();
  const thirdQualifies = bestThird.find(t => t.group === groupName && t.qualifies);
  const matches = generateGroupMatches(groupName);
  const playedMatches = matches.filter(m => engine.getMatchResult(groupName, m.home, m.away)).length;

  const card = document.getElementById(`group-${groupName}`);
  if (!card) return;

  const status = card.querySelector('.group-status');
  status.textContent = isComplete ? '✓ Complete' : `${playedMatches}/6 played`;
  status.className = `group-status ${isComplete ? 'complete' : ''}`;

  const tbody = card.querySelector('.standings-table tbody');
  if (!tbody) return;
  tbody.innerHTML = standings.map((s, pos) => {
    let posClass = `pos-${pos + 1}`;
    if (pos === 2 && thirdQualifies) posClass += ' qualifies';
    return `
    <tr class="${posClass}">
      <td>
        <div class="team-cell">
          <span class="team-flag">${s.team.flag}</span>
          <span class="team-name">${s.team.name}</span>
        </div>
      </td>
      <td>${s.mp}</td>
      <td>${s.w}</td>
      <td>${s.d}</td>
      <td>${s.l}</td>
      <td>${s.gf}</td>
      <td>${s.ga}</td>
      <td>${s.gd > 0 ? '+' + s.gd : s.gd}</td>
      <td class="pts-cell">${s.pts}</td>
    </tr>`;
  }).join('');
}

// ─── GROUP ACTIONS ──────────────────────────────────────────────
function simulateGroup(groupName) {
  engine.simulateGroup(groupName);
  refreshGroupCard(groupName);
  showToast(`⚡ Group ${groupName} simulated`);
}

function resetGroup(groupName) {
  engine.resetGroup(groupName);
  refreshGroupCard(groupName);
  showToast(`↻ Group ${groupName} reset`);
}

// ─── THIRD-PLACE TABLE ──────────────────────────────────────────
function renderThirdPlace() {
  const container = document.getElementById('third-place-container');
  const thirdPlaced = engine.mode === 'ranking'
    ? engine.getRankingBestThird()
    : engine.getBestThirdPlaced();

  if (thirdPlaced.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">📊</div>
        <div class="message">No third-placed teams yet</div>
        <div class="hint">${engine.mode === 'ranking' ? 'Rank teams in each group to see results' : 'Complete group stage matches to see third-place rankings'}</div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <table class="third-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Team</th>
          <th>Group</th>
          <th>Strength</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${thirdPlaced.map((t, i) => `
          <tr class="${t.qualifies ? 'qualifies' : 'eliminated'}">
            <td>${i + 1}</td>
            <td>
              <div class="team-cell">
                <span class="team-flag">${t.team.flag}</span>
                <span class="team-name">${t.team.name}</span>
              </div>
            </td>
            <td><span class="group-letter" style="font-size:0.7rem; padding:2px 6px;">Group ${t.group}</span></td>
            <td class="pts-cell">${t.team.strength}</td>
            <td>${t.qualifies ? '✅ Advances' : '❌ Eliminated'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="legend" style="margin-top:16px;">
      <div class="legend-item"><span class="legend-color qualified"></span> Advances to Round of 32 (top 8)</div>
      <div class="legend-item"><span class="legend-color eliminated"></span> Eliminated</div>
    </div>
  `;
}

// ─── KNOCKOUT BRACKET ───────────────────────────────────────────
function renderKnockoutBracket() {
  const container = document.getElementById('bracket-container');
  const championDisplay = document.getElementById('champion-display');
  championDisplay.innerHTML = '';

  if (!engine.areAllGroupsComplete()) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">🏆</div>
        <div class="message">Knockout bracket will appear here</div>
        <div class="hint">${engine.mode === 'ranking' ? 'Rank all 12 groups to generate the bracket' : 'Complete all group stage matches to generate the bracket'}</div>
      </div>`;
    return;
  }

  const r32Matches = engine.generateR32Matches();
  if (!r32Matches || r32Matches.length < 16) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <div class="message">Could not generate bracket</div>
        <div class="hint">Please ensure all groups are completed</div>
      </div>`;
    return;
  }

  // Build the bracket rounds
  const rounds = [
    { name: 'Round of 32', prefix: 'R32', count: 16, matches: r32Matches },
    { name: 'Round of 16', prefix: 'R16', count: 8, matches: [] },
    { name: 'Quarter-Finals', prefix: 'QF', count: 4, matches: [] },
    { name: 'Semi-Finals', prefix: 'SF', count: 2, matches: [] },
    { name: 'Final', prefix: 'F', count: 1, matches: [] },
  ];

  // Propagate knockout results through rounds
  for (let r = 1; r < rounds.length; r++) {
    const prevRound = rounds[r - 1];
    const thisRound = rounds[r];

    for (let i = 0; i < thisRound.count; i++) {
      const match1Idx = i * 2;
      const match2Idx = i * 2 + 1;
      const matchId = `${thisRound.prefix}_${i + 1}`;

      let homeTeam = null;
      let awayTeam = null;

      const prevMatch1 = prevRound.matches[match1Idx];
      const prevMatch2 = prevRound.matches[match2Idx];

      if (prevMatch1) {
        const res1 = engine.getKnockoutResult(prevMatch1.id);
        if (res1) homeTeam = res1.winner;
      }
      if (prevMatch2) {
        const res2 = engine.getKnockoutResult(prevMatch2.id);
        if (res2) awayTeam = res2.winner;
      }

      thisRound.matches.push({
        id: matchId,
        home: homeTeam,
        away: awayTeam,
        label: `${thisRound.name} Match ${i + 1}`
      });
    }
  }

  // Render bracket HTML
  let bracketHTML = '<div class="bracket">';

  rounds.forEach(round => {
    bracketHTML += `
      <div class="bracket-round">
        <div class="round-title">${round.name}</div>
        <div class="bracket-matches">
          ${round.matches.map(match => {
            const result = engine.getKnockoutResult(match.id);
            const homeTeam = match.home ? TEAMS[match.home] : null;
            const awayTeam = match.away ? TEAMS[match.away] : null;
            const isDecided = !!result;

            return `
            <div class="bracket-match ${isDecided ? 'decided' : ''}" 
                 data-match-id="${match.id}"
                 onclick="openKnockoutMatch('${match.id}', '${match.home || ''}', '${match.away || ''}')">
              <div class="bracket-team ${!homeTeam ? 'tbd' : ''} ${result && result.winner === match.home ? 'winner' : ''}">
                <span class="bracket-team-info">
                  ${homeTeam ? `<span class="team-flag">${homeTeam.flag}</span> ${homeTeam.name}` : 'TBD'}
                </span>
                <span class="bracket-team-score">${result ? result.homeGoals : ''}</span>
              </div>
              <div class="bracket-team ${!awayTeam ? 'tbd' : ''} ${result && result.winner === match.away ? 'winner' : ''}">
                <span class="bracket-team-info">
                  ${awayTeam ? `<span class="team-flag">${awayTeam.flag}</span> ${awayTeam.name}` : 'TBD'}
                </span>
                <span class="bracket-team-score">${result ? result.awayGoals : ''}</span>
              </div>
              ${result && result.penalties ? '<div class="penalties-badge">PEN</div>' : ''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
  });

  bracketHTML += '</div>';
  container.innerHTML = bracketHTML;

  // Check for champion
  const finalResult = engine.getKnockoutResult('F_1');
  if (finalResult) {
    const champion = TEAMS[finalResult.winner];
    championDisplay.innerHTML = `
      <div class="champion-section">
        <div class="champion-card">
          <div class="champion-trophy">🏆</div>
          <div class="champion-label">World Cup Champion</div>
          <div class="champion-flag">${champion.flag}</div>
          <div class="champion-name">${champion.name}</div>
        </div>
      </div>`;
    triggerConfetti();
  }
}

// ─── KNOCKOUT MATCH MODAL ───────────────────────────────────────
function openKnockoutMatch(matchId, homeCode, awayCode) {
  if (!homeCode || !awayCode) {
    showToast('⚠️ Both teams must be determined first');
    return;
  }

  const home = TEAMS[homeCode];
  const away = TEAMS[awayCode];
  const result = engine.getKnockoutResult(matchId);

  const modal = document.getElementById('ko-modal');
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="ko-modal">
      <h3>Pick the Winner</h3>
      <div class="ko-modal-teams">
        <div class="ko-modal-team ${result && result.winner === homeCode ? 'selected' : ''}" 
             onclick="pickKnockoutWinner('${matchId}', '${homeCode}', '${awayCode}', '${homeCode}')">
          <span class="flag">${home.flag}</span>
          <span class="name">${home.name}</span>
        </div>
        <span class="ko-modal-vs">VS</span>
        <div class="ko-modal-team ${result && result.winner === awayCode ? 'selected' : ''}"
             onclick="pickKnockoutWinner('${matchId}', '${homeCode}', '${awayCode}', '${awayCode}')">
          <span class="flag">${away.flag}</span>
          <span class="name">${away.name}</span>
        </div>
      </div>
      <div class="ko-modal-actions">
        <button class="btn btn-secondary btn-sm" onclick="autoSimKnockoutMatch('${matchId}', '${homeCode}', '${awayCode}')">⚡ Auto-Simulate</button>
        <button class="btn btn-danger btn-sm" onclick="closeKnockoutModal()">Cancel</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeKnockoutModal();
  });
}

function pickKnockoutWinner(matchId, homeCode, awayCode, winnerCode) {
  const winGoals = Math.floor(Math.random() * 3) + 1;
  const loseGoals = Math.floor(Math.random() * winGoals);
  const penalties = winGoals === loseGoals + 1 && Math.random() > 0.5;

  const homeGoals = winnerCode === homeCode ? winGoals : loseGoals;
  const awayGoals = winnerCode === awayCode ? winGoals : loseGoals;

  // Clear downstream results
  const roundPrefix = matchId.split('_')[0];
  const nextRoundMap = { 'R32': 'R16', 'R16': 'QF', 'QF': 'SF', 'SF': 'F' };
  if (nextRoundMap[roundPrefix]) {
    engine.clearKnockoutFromRound(nextRoundMap[roundPrefix]);
  }

  engine.setKnockoutResult(matchId, homeGoals, awayGoals, winnerCode, penalties);
  closeKnockoutModal();
  renderKnockoutBracket();
}

function autoSimKnockoutMatch(matchId, homeCode, awayCode) {
  const result = engine.simulateKnockoutMatch(homeCode, awayCode);

  const roundPrefix = matchId.split('_')[0];
  const nextRoundMap = { 'R32': 'R16', 'R16': 'QF', 'QF': 'SF', 'SF': 'F' };
  if (nextRoundMap[roundPrefix]) {
    engine.clearKnockoutFromRound(nextRoundMap[roundPrefix]);
  }

  engine.setKnockoutResult(matchId, result.homeGoals, result.awayGoals, result.winner, result.penalties);
  closeKnockoutModal();
  renderKnockoutBracket();
}

function closeKnockoutModal() {
  document.getElementById('ko-modal').style.display = 'none';
}

// ─── SIMULATE FULL KNOCKOUT ─────────────────────────────────────
function simulateFullKnockout() {
  if (!engine.areAllGroupsComplete()) return;

  engine.resetKnockout();
  const r32 = engine.generateR32Matches();
  if (!r32 || r32.length < 16) return;

  r32.forEach(match => {
    const result = engine.simulateKnockoutMatch(match.home, match.away);
    engine.setKnockoutResult(match.id, result.homeGoals, result.awayGoals, result.winner, result.penalties);
  });

  const roundDefs = [
    { prefix: 'R16', count: 8, prevPrefix: 'R32' },
    { prefix: 'QF', count: 4, prevPrefix: 'R16' },
    { prefix: 'SF', count: 2, prevPrefix: 'QF' },
    { prefix: 'F', count: 1, prevPrefix: 'SF' },
  ];

  roundDefs.forEach(rd => {
    for (let i = 0; i < rd.count; i++) {
      const prevMatch1 = engine.getKnockoutResult(`${rd.prevPrefix}_${i * 2 + 1}`);
      const prevMatch2 = engine.getKnockoutResult(`${rd.prevPrefix}_${i * 2 + 2}`);

      if (prevMatch1 && prevMatch2) {
        const matchId = `${rd.prefix}_${i + 1}`;
        const result = engine.simulateKnockoutMatch(prevMatch1.winner, prevMatch2.winner);
        engine.setKnockoutResult(matchId, result.homeGoals, result.awayGoals, result.winner, result.penalties);
      }
    }
  });

  renderKnockoutBracket();
  switchTab('knockout');
}

// ─── SUMMARY ────────────────────────────────────────────────────
function renderSummary() {
  const container = document.getElementById('summary-container');

  const completedGroups = GROUP_NAMES.filter(g => engine.isGroupComplete(g)).length;
  const finalResult = engine.getKnockoutResult('F_1');
  const champion = finalResult ? TEAMS[finalResult.winner] : null;

  // Count knockout matches decided
  let koDecided = 0;
  const koTotal = 16 + 8 + 4 + 2 + 1;
  Object.keys(engine.knockoutResults).forEach(() => koDecided++);

  // Build path to final for champion
  let pathToFinal = '';
  if (champion) {
    const rounds = ['R32', 'R16', 'QF', 'SF', 'F'];
    const roundNames = ['R32', 'R16', 'QF', 'SF', 'Final'];
    pathToFinal = '<div class="path-to-final">';
    rounds.forEach((prefix, ri) => {
      const count = [16, 8, 4, 2, 1][ri];
      for (let i = 1; i <= count; i++) {
        const r = engine.getKnockoutResult(`${prefix}_${i}`);
        if (r && r.winner === champion.code) {
          const opponent = r.winner === (r.homeCode || '') ? r.awayCode : '';
          // Find opponent from the match
          pathToFinal += `<span class="path-step">${roundNames[ri]}: ✅ Won</span>`;
          break;
        }
      }
    });
    pathToFinal += '</div>';
  }

  container.innerHTML = `
    <div class="summary-grid">
      <div class="summary-card">
        <div class="icon">🏆</div>
        <div class="label">Predicted Champion</div>
        <div class="value stat-animate">${champion ? `${champion.flag} ${champion.name}` : '—'}</div>
      </div>
      <div class="summary-card">
        <div class="icon">✅</div>
        <div class="label">Groups Completed</div>
        <div class="value stat-animate">${completedGroups} / 12</div>
      </div>
      <div class="summary-card">
        <div class="icon">⚔️</div>
        <div class="label">Knockout Matches Decided</div>
        <div class="value stat-animate">${koDecided} / ${koTotal}</div>
      </div>
      <div class="summary-card">
        <div class="icon">📋</div>
        <div class="label">Prediction Mode</div>
        <div class="value stat-animate">${engine.mode === 'ranking' ? '📊 Ranking' : '⚽ Score'}</div>
      </div>
    </div>

    ${engine.areAllGroupsComplete() ? `
    <div style="margin-top:32px;">
      <h3 class="section-title" style="font-size:1.2rem; margin-bottom:16px;">🏅 Your Predicted Group Winners</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
        ${GROUP_NAMES.map(g => {
          const standings = engine.mode === 'ranking'
            ? engine.getRankingStandings(g)
            : engine.calculateGroupStandings(g);
          const winner = standings[0];
          return `
          <div class="summary-card" style="padding:16px;">
            <div class="label">Group ${g} Winner</div>
            <div class="value stat-animate" style="font-size:1.1rem;">${winner.team.flag} ${winner.team.name}</div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}
  `;
}

// ─── TOAST NOTIFICATIONS ────────────────────────────────────────
function showToast(message) {
  document.querySelectorAll('.toast').forEach(t => t.remove());
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── CONFETTI CELEBRATION ───────────────────────────────────────
function triggerConfetti() {
  const colors = ['#00e5ff', '#ffd700', '#ff2d78', '#a855f7', '#00e676', '#ff9f43'];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 1}s`;
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
    piece.style.width = `${6 + Math.random() * 8}px`;
    piece.style.height = `${6 + Math.random() * 8}px`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 5000);
  }
}

// ─── KEYBOARD SHORTCUTS ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeKnockoutModal();
});
