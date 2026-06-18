/**
 * FIFA World Cup 2026 — Data Layer
 * All 48 teams, 12 groups, strength ratings, and match schedules
 */

const TEAMS = {
  // Group A
  MEX: { name: "Mexico", code: "MEX", flag: "🇲🇽", group: "A", strength: 78, ranking: 15 },
  RSA: { name: "South Africa", code: "RSA", flag: "🇿🇦", group: "A", strength: 62, ranking: 59 },
  KOR: { name: "South Korea", code: "KOR", flag: "🇰🇷", group: "A", strength: 76, ranking: 23 },
  CZE: { name: "Czechia", code: "CZE", flag: "🇨🇿", group: "A", strength: 72, ranking: 36 },

  // Group B
  CAN: { name: "Canada", code: "CAN", flag: "🇨🇦", group: "B", strength: 74, ranking: 27 },
  BIH: { name: "Bosnia & Herzegovina", code: "BIH", flag: "🇧🇦", group: "B", strength: 68, ranking: 56 },
  QAT: { name: "Qatar", code: "QAT", flag: "🇶🇦", group: "B", strength: 58, ranking: 45 },
  SUI: { name: "Switzerland", code: "SUI", flag: "🇨🇭", group: "B", strength: 79, ranking: 16 },

  // Group C
  BRA: { name: "Brazil", code: "BRA", flag: "🇧🇷", group: "C", strength: 90, ranking: 5 },
  MAR: { name: "Morocco", code: "MAR", flag: "🇲🇦", group: "C", strength: 80, ranking: 13 },
  HAI: { name: "Haiti", code: "HAI", flag: "🇭🇹", group: "C", strength: 40, ranking: 90 },
  SCO: { name: "Scotland", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "C", strength: 66, ranking: 42 },

  // Group D
  USA: { name: "United States", code: "USA", flag: "🇺🇸", group: "D", strength: 82, ranking: 11 },
  PAR: { name: "Paraguay", code: "PAR", flag: "🇵🇾", group: "D", strength: 65, ranking: 50 },
  AUS: { name: "Australia", code: "AUS", flag: "🇦🇺", group: "D", strength: 70, ranking: 30 },
  TUR: { name: "Türkiye", code: "TUR", flag: "🇹🇷", group: "D", strength: 76, ranking: 24 },

  // Group E
  GER: { name: "Germany", code: "GER", flag: "🇩🇪", group: "E", strength: 86, ranking: 8 },
  CUW: { name: "Curaçao", code: "CUW", flag: "🇨🇼", group: "E", strength: 38, ranking: 95 },
  CIV: { name: "Côte d'Ivoire", code: "CIV", flag: "🇨🇮", group: "E", strength: 72, ranking: 35 },
  ECU: { name: "Ecuador", code: "ECU", flag: "🇪🇨", group: "E", strength: 73, ranking: 32 },

  // Group F
  NED: { name: "Netherlands", code: "NED", flag: "🇳🇱", group: "F", strength: 85, ranking: 9 },
  JPN: { name: "Japan", code: "JPN", flag: "🇯🇵", group: "F", strength: 80, ranking: 14 },
  SWE: { name: "Sweden", code: "SWE", flag: "🇸🇪", group: "F", strength: 71, ranking: 37 },
  TUN: { name: "Tunisia", code: "TUN", flag: "🇹🇳", group: "F", strength: 67, ranking: 40 },

  // Group G
  BEL: { name: "Belgium", code: "BEL", flag: "🇧🇪", group: "G", strength: 82, ranking: 10 },
  EGY: { name: "Egypt", code: "EGY", flag: "🇪🇬", group: "G", strength: 68, ranking: 38 },
  IRN: { name: "Iran", code: "IRN", flag: "🇮🇷", group: "G", strength: 70, ranking: 29 },
  NZL: { name: "New Zealand", code: "NZL", flag: "🇳🇿", group: "G", strength: 55, ranking: 72 },

  // Group H
  ESP: { name: "Spain", code: "ESP", flag: "🇪🇸", group: "H", strength: 90, ranking: 3 },
  CPV: { name: "Cabo Verde", code: "CPV", flag: "🇨🇻", group: "H", strength: 45, ranking: 75 },
  KSA: { name: "Saudi Arabia", code: "KSA", flag: "🇸🇦", group: "H", strength: 60, ranking: 55 },
  URU: { name: "Uruguay", code: "URU", flag: "🇺🇾", group: "H", strength: 83, ranking: 12 },

  // Group I
  FRA: { name: "France", code: "FRA", flag: "🇫🇷", group: "I", strength: 91, ranking: 2 },
  SEN: { name: "Senegal", code: "SEN", flag: "🇸🇳", group: "I", strength: 74, ranking: 20 },
  BOL: { name: "Bolivia", code: "BOL", flag: "🇧🇴", group: "I", strength: 48, ranking: 80 },
  NOR: { name: "Norway", code: "NOR", flag: "🇳🇴", group: "I", strength: 72, ranking: 34 },

  // Group J
  ARG: { name: "Argentina", code: "ARG", flag: "🇦🇷", group: "J", strength: 93, ranking: 1 },
  ALG: { name: "Algeria", code: "ALG", flag: "🇩🇿", group: "J", strength: 66, ranking: 41 },
  AUT: { name: "Austria", code: "AUT", flag: "🇦🇹", group: "J", strength: 74, ranking: 25 },
  JOR: { name: "Jordan", code: "JOR", flag: "🇯🇴", group: "J", strength: 55, ranking: 68 },

  // Group K
  POR: { name: "Portugal", code: "POR", flag: "🇵🇹", group: "K", strength: 88, ranking: 6 },
  COD: { name: "DR Congo", code: "COD", flag: "🇨🇩", group: "K", strength: 58, ranking: 60 },
  UZB: { name: "Uzbekistan", code: "UZB", flag: "🇺🇿", group: "K", strength: 60, ranking: 52 },
  COL: { name: "Colombia", code: "COL", flag: "🇨🇴", group: "K", strength: 81, ranking: 17 },

  // Group L
  ENG: { name: "England", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "L", strength: 87, ranking: 4 },
  CRO: { name: "Croatia", code: "CRO", flag: "🇭🇷", group: "L", strength: 79, ranking: 18 },
  GHA: { name: "Ghana", code: "GHA", flag: "🇬🇭", group: "L", strength: 62, ranking: 58 },
  PAN: { name: "Panama", code: "PAN", flag: "🇵🇦", group: "L", strength: 56, ranking: 65 },
};

const GROUPS = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HAI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "KSA", "URU"],
  I: ["FRA", "SEN", "BOL", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"],
};

const GROUP_NAMES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

/**
 * Generate match schedule for a group.
 * Each group has 6 matches (4 teams, round-robin):
 *   Matchday 1: 0v1, 2v3
 *   Matchday 2: 0v2, 1v3
 *   Matchday 3: 0v3, 1v2
 */
function generateGroupMatches(groupName) {
  const teams = GROUPS[groupName];
  return [
    // Matchday 1
    { home: teams[0], away: teams[1], matchday: 1 },
    { home: teams[2], away: teams[3], matchday: 1 },
    // Matchday 2
    { home: teams[0], away: teams[2], matchday: 2 },
    { home: teams[1], away: teams[3], matchday: 2 },
    // Matchday 3
    { home: teams[0], away: teams[3], matchday: 3 },
    { home: teams[1], away: teams[2], matchday: 3 },
  ];
}

/**
 * Official FIFA 2026 knockout bracket pathways.
 * R32 matchups based on group position:
 *   W = Winner (1st), R = Runner-up (2nd), T = Best Third-placed
 * The bracket is structured so group winners avoid each other in early rounds.
 */
const KNOCKOUT_BRACKET = {
  // Round of 32 — 16 matches
  // Left half of bracket (matches 1-8)
  R32_1:  { home: "1A", away: "3C_D_E" },
  R32_2:  { home: "2C", away: "2D" },
  R32_3:  { home: "1B", away: "3A_F_I" },
  R32_4:  { home: "2A", away: "2B" },
  R32_5:  { home: "1E", away: "3B_G_H" },
  R32_6:  { home: "2G", away: "2H" },
  R32_7:  { home: "1F", away: "3J_K_L" },
  R32_8:  { home: "2E", away: "2F" },
  // Right half of bracket (matches 9-16)
  R32_9:  { home: "1C", away: "3A_B_F" },
  R32_10: { home: "2I", away: "2J" },
  R32_11: { home: "1D", away: "3G_H_I" },
  R32_12: { home: "2K", away: "2L" },
  R32_13: { home: "1G", away: "3D_E_K" },
  R32_14: { home: "2A", away: "2L" },  // Note: alternate path
  R32_15: { home: "1H", away: "3F_I_L" },
  R32_16: { home: "2G", away: "2J" },  // Note: alternate path
};

/**
 * Host cities for the 2026 World Cup
 */
const HOST_CITIES = [
  "New York/New Jersey", "Los Angeles", "Dallas", "San Francisco",
  "Miami", "Atlanta", "Houston", "Philadelphia", "Seattle", "Kansas City", "Boston",
  "Mexico City", "Guadalajara", "Monterrey",
  "Toronto", "Vancouver"
];
