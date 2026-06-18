/**
 * FIFA World Cup 2026 — Simulation Engine
 * Handles standings calculation, tiebreakers, best-third logic, and bracket seeding
 * Supports two modes: Score Mode (enter match scores) and Ranking Mode (rank teams directly)
 */

class SimulationEngine {
  constructor() {
    // Store match results: key = "GRP_homeCode_awayCode", value = { homeGoals, awayGoals }
    this.matchResults = {};
    // Knockout results: key = match id (e.g., "R32_1"), value = { home, away, homeGoals, awayGoals, winner, penalties }
    this.knockoutResults = {};
    // Ranking mode: stores user-ordered team arrays per group { A: ["MEX","KOR","CZE","RSA"], ... }
    this.groupRankings = {};
    // Current mode: 'score' or 'ranking'
    this.mode = 'ranking';
    this.loadFromStorage();
  }

  // ─── PERSISTENCE ───────────────────────────────────────────────
  saveToStorage() {
    try {
      localStorage.setItem('wc2026_matches', JSON.stringify(this.matchResults));
      localStorage.setItem('wc2026_knockout', JSON.stringify(this.knockoutResults));
      localStorage.setItem('wc2026_rankings', JSON.stringify(this.groupRankings));
      localStorage.setItem('wc2026_mode', this.mode);
    } catch (e) { /* silent fail */ }
  }

  loadFromStorage() {
    try {
      const matches = localStorage.getItem('wc2026_matches');
      const knockout = localStorage.getItem('wc2026_knockout');
      const rankings = localStorage.getItem('wc2026_rankings');
      const mode = localStorage.getItem('wc2026_mode');
      if (matches) this.matchResults = JSON.parse(matches);
      if (knockout) this.knockoutResults = JSON.parse(knockout);
      if (rankings) this.groupRankings = JSON.parse(rankings);
      if (mode) this.mode = mode;
    } catch (e) { /* silent fail */ }
  }

  setMode(mode) {
    this.mode = mode;
    this.saveToStorage();
  }

  reset() {
    this.matchResults = {};
    this.knockoutResults = {};
    this.groupRankings = {};
    this.saveToStorage();
  }

  resetGroup(groupName) {
    // Reset score mode data
    const matches = generateGroupMatches(groupName);
    matches.forEach(m => {
      const key = `${groupName}_${m.home}_${m.away}`;
      delete this.matchResults[key];
    });
    // Reset ranking mode data
    delete this.groupRankings[groupName];
    this.saveToStorage();
  }

  resetKnockout() {
    this.knockoutResults = {};
    this.saveToStorage();
  }

  // ─── RANKING MODE ─────────────────────────────────────────────
  setGroupRanking(groupName, orderedTeamCodes) {
    this.groupRankings[groupName] = orderedTeamCodes;
    this.saveToStorage();
  }

  getGroupRanking(groupName) {
    return this.groupRankings[groupName] || GROUPS[groupName];
  }

  isGroupRanked(groupName) {
    // In ranking mode, every group is always "ranked" — the default GROUPS order is the starting ranking
    return true;
  }

  areAllGroupsRanked() {
    return GROUP_NAMES.every(g => this.isGroupRanked(g));
  }

  /**
   * Get standings in ranking mode — returns team objects ordered by user ranking.
   * Assigns synthetic stats so the rest of the pipeline works seamlessly.
   */
  getRankingStandings(groupName) {
    const ranking = this.groupRankings[groupName] || GROUPS[groupName];
    return ranking.map((code, pos) => ({
      code,
      team: TEAMS[code],
      mp: 3,
      w: 3 - pos,
      d: 0,
      l: pos,
      gf: (4 - pos) * 2,
      ga: pos,
      gd: (4 - pos) * 2 - pos,
      pts: (3 - pos) * 3,
      rank: pos + 1
    }));
  }

  /**
   * Get best third-placed teams in ranking mode.
   * In ranking mode, ALL groups are always "complete", so we rank all 12 third-placed teams
   * by their team strength (since there are no real stats).
   */
  getRankingBestThird() {
    const thirdPlaced = [];
    GROUP_NAMES.forEach(groupName => {
      const ranking = this.groupRankings[groupName] || GROUPS[groupName];
      const thirdCode = ranking[2];
      thirdPlaced.push({
        code: thirdCode,
        team: TEAMS[thirdCode],
        group: groupName,
        mp: 3, w: 1, d: 0, l: 2,
        gf: 2, ga: 3, gd: -1, pts: 3,
        rank: 3
      });
    });

    // Sort by team strength (user's ranking already decided within group, so use strength for cross-group)
    thirdPlaced.sort((a, b) => b.team.strength - a.team.strength);

    return thirdPlaced.map((t, i) => ({
      ...t,
      qualifies: i < 8
    }));
  }

  // ─── MATCH RESULTS ────────────────────────────────────────────
  setMatchResult(groupName, homeCode, awayCode, homeGoals, awayGoals) {
    const key = `${groupName}_${homeCode}_${awayCode}`;
    if (homeGoals === null || awayGoals === null || homeGoals === '' || awayGoals === '') {
      delete this.matchResults[key];
    } else {
      this.matchResults[key] = {
        homeGoals: parseInt(homeGoals),
        awayGoals: parseInt(awayGoals)
      };
    }
    this.saveToStorage();
  }

  getMatchResult(groupName, homeCode, awayCode) {
    const key = `${groupName}_${homeCode}_${awayCode}`;
    return this.matchResults[key] || null;
  }

  // ─── STANDINGS CALCULATION ────────────────────────────────────
  calculateGroupStandings(groupName) {
    const teamCodes = GROUPS[groupName];
    const matches = generateGroupMatches(groupName);
    
    // Initialize standings
    const standings = {};
    teamCodes.forEach(code => {
      standings[code] = {
        code,
        team: TEAMS[code],
        mp: 0, w: 0, d: 0, l: 0,
        gf: 0, ga: 0, gd: 0, pts: 0
      };
    });

    // Process each match
    matches.forEach(match => {
      const result = this.getMatchResult(groupName, match.home, match.away);
      if (!result) return;

      const home = standings[match.home];
      const away = standings[match.away];
      
      home.mp++;
      away.mp++;
      home.gf += result.homeGoals;
      home.ga += result.awayGoals;
      away.gf += result.awayGoals;
      away.ga += result.homeGoals;

      if (result.homeGoals > result.awayGoals) {
        home.w++; home.pts += 3;
        away.l++;
      } else if (result.homeGoals < result.awayGoals) {
        away.w++; away.pts += 3;
        home.l++;
      } else {
        home.d++; home.pts += 1;
        away.d++; away.pts += 1;
      }
    });

    // Calculate GD
    Object.values(standings).forEach(s => {
      s.gd = s.gf - s.ga;
    });

    // Sort with tiebreakers
    const sorted = Object.values(standings).sort((a, b) => {
      // 1. Points
      if (b.pts !== a.pts) return b.pts - a.pts;
      // 2. Goal Difference
      if (b.gd !== a.gd) return b.gd - a.gd;
      // 3. Goals Scored
      if (b.gf !== a.gf) return b.gf - a.gf;
      // 4. Head-to-head
      const h2h = this.headToHead(groupName, a.code, b.code);
      if (h2h !== 0) return h2h;
      // 5. Fair play (use strength as tiebreaker proxy)
      return (b.team.strength - a.team.strength);
    });

    return sorted;
  }

  headToHead(groupName, codeA, codeB) {
    // Check direct match result
    let resultAB = this.getMatchResult(groupName, codeA, codeB);
    let resultBA = this.getMatchResult(groupName, codeB, codeA);

    let aGoals = 0, bGoals = 0;
    if (resultAB) {
      aGoals += resultAB.homeGoals;
      bGoals += resultAB.awayGoals;
    }
    if (resultBA) {
      aGoals += resultBA.awayGoals;
      bGoals += resultBA.homeGoals;
    }

    if (aGoals !== bGoals) return bGoals - aGoals; // higher goals = better (for b)
    // Actually, we want: if A won h2h, A should rank higher (return negative)
    // Since sort is b - a, if A is better, return negative
    // Let's reconsider: sort(a, b) => negative means a first
    // If a scored more in h2h: a is better => return negative
    if (aGoals > bGoals) return -1; // a is better
    if (bGoals > aGoals) return 1;  // b is better
    return 0;
  }

  // ─── BEST THIRD-PLACED TEAMS ──────────────────────────────────
  getBestThirdPlaced() {
    const thirdPlaced = [];
    
    GROUP_NAMES.forEach(groupName => {
      const standings = this.calculateGroupStandings(groupName);
      if (standings.length >= 3 && standings[2].mp > 0) {
        thirdPlaced.push({
          ...standings[2],
          group: groupName
        });
      }
    });

    // Sort third-placed teams
    thirdPlaced.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return b.team.strength - a.team.strength;
    });

    return thirdPlaced.map((t, i) => ({
      ...t,
      qualifies: i < 8
    }));
  }

  // ─── GROUP COMPLETION CHECK ───────────────────────────────────
  isGroupComplete(groupName) {
    if (this.mode === 'ranking') {
      return this.isGroupRanked(groupName);
    }
    const matches = generateGroupMatches(groupName);
    return matches.every(m => this.getMatchResult(groupName, m.home, m.away) !== null);
  }

  areAllGroupsComplete() {
    if (this.mode === 'ranking') {
      return this.areAllGroupsRanked();
    }
    return GROUP_NAMES.every(g => this.isGroupComplete(g));
  }

  // ─── KNOCKOUT BRACKET GENERATION ──────────────────────────────
  getKnockoutTeams() {
    if (!this.areAllGroupsComplete()) return null;

    const result = {
      winners: {},    // "1A" => team code
      runnersUp: {},  // "2A" => team code
      thirdPlaced: {} // "3A" => team code
    };

    GROUP_NAMES.forEach(g => {
      const standings = this.mode === 'ranking'
        ? this.getRankingStandings(g)
        : this.calculateGroupStandings(g);
      result.winners[`1${g}`] = standings[0].code;
      result.runnersUp[`2${g}`] = standings[1].code;
      result.thirdPlaced[`3${g}`] = standings[2].code;
    });

    const bestThird = this.mode === 'ranking'
      ? this.getRankingBestThird().filter(t => t.qualifies)
      : this.getBestThirdPlaced().filter(t => t.qualifies);
    result.qualifiedThird = bestThird.map(t => t.group);

    return result;
  }

  /**
   * Generate Round of 32 matchups
   * Uses a simplified bracket that's close to the official FIFA pathway
   */
  generateR32Matches() {
    const kt = this.getKnockoutTeams();
    if (!kt) return null;

    const { winners, runnersUp, thirdPlaced, qualifiedThird } = kt;

    // Find the right third-placed team for each bracket slot
    const findThird = (possibleGroups) => {
      const groups = possibleGroups.split('_');
      for (const g of groups) {
        if (qualifiedThird.includes(g)) {
          return thirdPlaced[`3${g}`];
        }
      }
      return qualifiedThird.length > 0 ? thirdPlaced[`3${qualifiedThird[0]}`] : null;
    };

    const r32 = [
      // Left bracket
      { id: "R32_1", home: winners["1A"], away: findThird("C_D_E"), label: "1A vs 3C/D/E" },
      { id: "R32_2", home: runnersUp["2C"], away: runnersUp["2D"], label: "2C vs 2D" },
      { id: "R32_3", home: winners["1B"], away: findThird("A_F_I"), label: "1B vs 3A/F/I" },
      { id: "R32_4", home: runnersUp["2A"], away: runnersUp["2B"], label: "2A vs 2B" },
      { id: "R32_5", home: winners["1E"], away: findThird("B_G_H"), label: "1E vs 3B/G/H" },
      { id: "R32_6", home: runnersUp["2G"], away: runnersUp["2H"], label: "2G vs 2H" },
      { id: "R32_7", home: winners["1F"], away: findThird("J_K_L"), label: "1F vs 3J/K/L" },
      { id: "R32_8", home: runnersUp["2E"], away: runnersUp["2F"], label: "2E vs 2F" },
      // Right bracket
      { id: "R32_9",  home: winners["1C"], away: findThird("A_B_F"), label: "1C vs 3A/B/F" },
      { id: "R32_10", home: runnersUp["2I"], away: runnersUp["2J"], label: "2I vs 2J" },
      { id: "R32_11", home: winners["1D"], away: findThird("G_H_I"), label: "1D vs 3G/H/I" },
      { id: "R32_12", home: runnersUp["2K"], away: runnersUp["2L"], label: "2K vs 2L" },
      { id: "R32_13", home: winners["1G"], away: findThird("D_E_K"), label: "1G vs 3D/E/K" },
      { id: "R32_14", home: runnersUp["2I"], away: runnersUp["2L"], label: "2I vs 2L" },
      { id: "R32_15", home: winners["1H"], away: findThird("F_I_L"), label: "1H vs 3F/I/L" },
      { id: "R32_16", home: runnersUp["2K"], away: runnersUp["2J"], label: "2K vs 2J" },

      // Extra bracket matches for remaining group winners
      { id: "R32_17", home: winners["1I"], away: runnersUp["2H"], label: "1I vs 2H" },
      { id: "R32_18", home: winners["1J"], away: runnersUp["2G"], label: "1J vs 2G" },
      { id: "R32_19", home: winners["1K"], away: runnersUp["2L"], label: "1K vs 2L" },
      { id: "R32_20", home: winners["1L"], away: runnersUp["2K"], label: "1L vs 2K" },
    ];

    // Deduplicate - keep first 16 unique pairings
    const seen = new Set();
    const unique = [];
    for (const match of r32) {
      const key = [match.home, match.away].sort().join('-');
      if (!seen.has(key) && match.home && match.away && unique.length < 16) {
        seen.add(key);
        unique.push(match);
      }
    }

    // If we have fewer than 16, fill remaining from group winners vs runners-up
    if (unique.length < 16) {
      const allTeams = new Set(unique.flatMap(m => [m.home, m.away]));
      const allWinners = Object.values(winners);
      const allRunners = Object.values(runnersUp);
      const allThirds = qualifiedThird.map(g => thirdPlaced[`3${g}`]);
      
      const unused = [...allWinners, ...allRunners, ...allThirds].filter(t => !allTeams.has(t));
      
      while (unique.length < 16 && unused.length >= 2) {
        const home = unused.shift();
        const away = unused.shift();
        unique.push({ id: `R32_${unique.length + 1}`, home, away, label: `${home} vs ${away}` });
      }
    }

    // Renumber IDs
    return unique.map((m, i) => ({ ...m, id: `R32_${i + 1}` }));
  }

  // ─── KNOCKOUT MATCH MANAGEMENT ────────────────────────────────
  setKnockoutResult(matchId, homeGoals, awayGoals, winner, penalties = false) {
    this.knockoutResults[matchId] = {
      homeGoals: parseInt(homeGoals),
      awayGoals: parseInt(awayGoals),
      winner,
      penalties
    };
    this.saveToStorage();
  }

  getKnockoutResult(matchId) {
    return this.knockoutResults[matchId] || null;
  }

  clearKnockoutFromRound(round) {
    const prefixes = {
      'R32': ['R32_', 'R16_', 'QF_', 'SF_', 'F_'],
      'R16': ['R16_', 'QF_', 'SF_', 'F_'],
      'QF': ['QF_', 'SF_', 'F_'],
      'SF': ['SF_', 'F_'],
      'F': ['F_']
    };
    const toClear = prefixes[round] || [];
    Object.keys(this.knockoutResults).forEach(key => {
      if (toClear.some(p => key.startsWith(p))) {
        delete this.knockoutResults[key];
      }
    });
    this.saveToStorage();
  }

  // ─── AUTO-SIMULATION ──────────────────────────────────────────
  simulateMatch(homeCode, awayCode) {
    const home = TEAMS[homeCode];
    const away = TEAMS[awayCode];

    const homeStrength = home.strength + (Math.random() * 30 - 15);
    const awayStrength = away.strength + (Math.random() * 30 - 15);

    const homeExpected = Math.max(0, (homeStrength / 30) + 0.3);
    const awayExpected = Math.max(0, (awayStrength / 30));

    const homeGoals = this.poissonRandom(homeExpected);
    const awayGoals = this.poissonRandom(awayExpected);

    return { homeGoals: Math.min(homeGoals, 7), awayGoals: Math.min(awayGoals, 7) };
  }

  simulateKnockoutMatch(homeCode, awayCode) {
    let result = this.simulateMatch(homeCode, awayCode);
    let penalties = false;
    
    // If draw, simulate extra time / penalties
    if (result.homeGoals === result.awayGoals) {
      // 40% chance someone scores in ET
      if (Math.random() < 0.4) {
        if (TEAMS[homeCode].strength + Math.random() * 20 > TEAMS[awayCode].strength + Math.random() * 20) {
          result.homeGoals++;
        } else {
          result.awayGoals++;
        }
      } else {
        // Penalties - slightly favor stronger team
        penalties = true;
        if (Math.random() < 0.5 + (TEAMS[homeCode].strength - TEAMS[awayCode].strength) / 200) {
          result.homeGoals++;
        } else {
          result.awayGoals++;
        }
      }
    }

    const winner = result.homeGoals > result.awayGoals ? homeCode : awayCode;
    return { ...result, winner, penalties };
  }

  poissonRandom(lambda) {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= Math.random();
    } while (p > L);
    return k - 1;
  }

  simulateGroup(groupName) {
    const matches = generateGroupMatches(groupName);
    matches.forEach(m => {
      const result = this.simulateMatch(m.home, m.away);
      this.setMatchResult(groupName, m.home, m.away, result.homeGoals, result.awayGoals);
    });
  }

  simulateAllGroups() {
    GROUP_NAMES.forEach(g => this.simulateGroup(g));
  }

  simulateEntireTournament() {
    this.reset();
    this.simulateAllGroups();
    // Knockout will be handled by app.js after groups are rendered
    return true;
  }
}
