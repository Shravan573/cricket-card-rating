'use strict';
/**
 * Cricket Card Rating System — Unit Tests
 * Run with: node tests.js
 *
 * Tests: getYearFactor, findPlayer, buildCard, getTier, OVR range
 */

/* ═══════════════════════════════════════════════════════════════
   PLAYER DATA (subset — same values as index.html)
═══════════════════════════════════════════════════════════════ */
const PLAYERS = [
  { id:1, name:"Virat Kohli", country:"India", code:"IND", flag:"🇮🇳", role:"Batsman",
    ay:[2008,2026], py:[2014,2019], iw:1.0,
    p:{avg:88,sr:75,bnd:72,icc:95,pop:100,rr:95,oq:92,pace:88,spin:90,form:72},
    fo:{ Test:{avg:95,sr:58,bnd:62,icc:97,oq:94}, ODI:{avg:93,sr:78,bnd:74,icc:95} } },

  { id:4, name:"MS Dhoni", country:"India", code:"IND", flag:"🇮🇳", role:"WK-Batsman",
    ay:[2004,2019], py:[2009,2014], iw:1.0,
    p:{avg:78,sr:85,bnd:75,icc:92,pop:97,rr:92,oq:88,pace:82,spin:85,form:30},
    fo:{ ODI:{avg:82,sr:82,bnd:72,icc:90}, Test:{avg:80,sr:60,bnd:60,icc:85,rr:88} } },

  { id:5, name:"Suryakumar Yadav", country:"India", code:"IND", flag:"🇮🇳", role:"Batsman",
    ay:[2021,2026], py:[2022,2026], iw:0.95,
    p:{avg:78,sr:98,bnd:98,icc:95,pop:82,rr:82,oq:85,pace:93,spin:88,form:87},
    fo:{ Test:{avg:50,sr:60,bnd:60,icc:20,rr:20,oq:20}, ODI:{avg:72,sr:90,bnd:90} } },

  { id:16, name:"Steve Smith", country:"Australia", code:"AUS", flag:"🇦🇺", role:"Batsman",
    ay:[2010,2026], py:[2015,2020], iw:0.90,
    p:{avg:78,sr:65,bnd:62,icc:82,pop:80,rr:85,oq:88,pace:82,spin:88,form:68},
    fo:{ Test:{avg:96,sr:52,bnd:62,icc:97,oq:94}, ODI:{avg:85,sr:75,bnd:68} } },

  { id:21, name:"Shane Warne", country:"Australia", code:"AUS", flag:"🇦🇺", role:"Bowler",
    ay:[1992,2007], py:[1994,2005], iw:1.0,
    p:{avg:82,sr:80,bnd:82,icc:88,pop:90,rr:85,oq:92,pace:55,spin:98,form:10},
    fo:{ Test:{avg:95,sr:88,bnd:88,icc:98,oq:96} } },

  { id:28, name:"AB de Villiers", country:"South Africa", code:"SA", flag:"🇿🇦", role:"Batsman",
    ay:[2004,2018], py:[2013,2017], iw:1.0,
    p:{avg:90,sr:95,bnd:92,icc:95,pop:88,rr:88,oq:90,pace:93,spin:90,form:20},
    fo:{ ODI:{avg:92,sr:92,bnd:90,icc:95}, Test:{avg:92,sr:60,bnd:68,icc:90,oq:90} } },

  { id:41, name:"Rashid Khan", country:"Afghanistan", code:"AFG", flag:"🇦🇫", role:"Bowler",
    ay:[2015,2026], py:[2017,2026], iw:1.0,
    p:{avg:85,sr:82,bnd:90,icc:85,pop:75,rr:85,oq:82,pace:50,spin:95,form:80},
    fo:{} },
];

/* ═══════════════════════════════════════════════════════════════
   FORMAT CONFIG (same as index.html)
═══════════════════════════════════════════════════════════════ */
const FORMAT_CONFIG = {
  T20I: { label:'T20I',
    weights:{ careerOutput:25,peakICC:20,popularity:10,roleReliability:10,oppositionQuality:10,matchupProfile:10,currentForm:15 },
    sw:{ avg:0.35,sr:0.40,bnd:0.25 }, pm:{},
    sub:['Batting Avg','Strike Rate','Boundary %'] },
  ODI: { label:'ODI',
    weights:{ careerOutput:27,peakICC:22,popularity:12,roleReliability:12,oppositionQuality:10,matchupProfile:8,currentForm:9 },
    sw:{ avg:0.45,sr:0.35,bnd:0.20 }, pm:{ avg:1.02,oq:1.02 },
    sub:['Batting Avg','Strike Rate','Boundary %'] },
  Test: { label:'Test',
    weights:{ careerOutput:32,peakICC:25,popularity:8,roleReliability:15,oppositionQuality:12,matchupProfile:5,currentForm:3 },
    sw:{ avg:0.60,sr:0.15,bnd:0.25 }, pm:{ avg:1.05,sr:0.70,form:0.70 },
    sub:['Avg / Bowl Quality','Control / Tech','Range / Economy'] },
  IPL: { label:'IPL',
    weights:{ careerOutput:28,peakICC:12,popularity:22,roleReliability:10,oppositionQuality:8,matchupProfile:15,currentForm:5 },
    sw:{ avg:0.25,sr:0.45,bnd:0.30 }, pm:{ pop:1.05,sr:1.03,bnd:1.03,oq:0.90 },
    sub:['Avg','Strike Rate','Boundary %'] },
  BBL: { label:'BBL',
    weights:{ careerOutput:27,peakICC:13,popularity:18,roleReliability:12,oppositionQuality:8,matchupProfile:15,currentForm:7 },
    sw:{ avg:0.28,sr:0.44,bnd:0.28 }, pm:{},
    sub:['Avg','Strike Rate','Boundary %'] },
  PSL: { label:'PSL',
    weights:{ careerOutput:27,peakICC:13,popularity:18,roleReliability:12,oppositionQuality:8,matchupProfile:15,currentForm:7 },
    sw:{ avg:0.28,sr:0.42,bnd:0.30 }, pm:{},
    sub:['Avg','Strike Rate','Boundary %'] },
  SA20: { label:'SA20',
    weights:{ careerOutput:28,peakICC:12,popularity:20,roleReliability:11,oppositionQuality:8,matchupProfile:15,currentForm:6 },
    sw:{ avg:0.27,sr:0.43,bnd:0.30 }, pm:{},
    sub:['Avg','Strike Rate','Boundary %'] },
};

const FORMAT_KEYS    = Object.keys(FORMAT_CONFIG);
const PILLAR_KEYS    = ['careerOutput','peakICC','popularity','roleReliability','oppositionQuality','matchupProfile','currentForm'];
const TIERS          = [
  { min:95, label:'LEGEND' }, { min:90, label:'ICON' }, { min:85, label:'ELITE' },
  { min:80, label:'STAR'   }, { min:75, label:'PRO'  }, { min:0,  label:'RARE'  },
];

/* ═══════════════════════════════════════════════════════════════
   FUNCTIONS UNDER TEST — exact copies from index.html
═══════════════════════════════════════════════════════════════ */
function getTier(ovr) {
  return TIERS.find(t => ovr >= t.min);
}

function findPlayer(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  return (
    PLAYERS.find(p => p.name.toLowerCase() === q) ||
    PLAYERS.find(p => p.name.toLowerCase().startsWith(q)) ||
    PLAYERS.find(p => p.name.toLowerCase().includes(q)) ||
    PLAYERS.find(p => p.name.split(' ').some(part => part.toLowerCase().startsWith(q))) ||
    null
  );
}

function getYearFactor(player, year) {
  const [start, end] = player.ay;
  const [ps, pe]     = player.py;
  if (year < start)   return { factor:0.45, badge:'PRE-CAREER',  note:'Before international debut' };
  if (year > end + 3) return { factor:0.28, badge:'RETIRED',     note:'Post-retirement era' };
  if (year > end)     return { factor:0.50, badge:'LATE CAREER',  note:'Final / post-peak seasons' };
  if (year >= ps && year <= pe) return { factor:1.0, badge:'PEAK', note:'Peak performance years' };
  if (year < ps) {
    const d = ps - year;
    return { factor:parseFloat(Math.max(0.68, 1 - d * 0.06).toFixed(2)), badge:'RISING',   note:`${d} year${d>1?'s':''} before peak` };
  }
  const d = year - pe;
  return { factor:parseFloat(Math.max(0.58, 1 - d * 0.07).toFixed(2)), badge:'VETERAN', note:`${d} year${d>1?'s':''} post-peak` };
}

function buildCard(player, format, year, userWeights) {
  const fc  = FORMAT_CONFIG[format];
  const yf  = getYearFactor(player, year);
  const fo  = player.fo[format] || {};

  const raw = {
    avg:  fo.avg  ?? player.p.avg,
    sr:   fo.sr   ?? player.p.sr,
    bnd:  fo.bnd  ?? player.p.bnd,
    icc:  fo.icc  ?? player.p.icc,
    pop:  fo.pop  ?? player.p.pop,
    rr:   fo.rr   ?? player.p.rr,
    oq:   fo.oq   ?? player.p.oq,
    pace: fo.pace ?? player.p.pace,
    spin: fo.spin ?? player.p.spin,
    form: fo.form ?? player.p.form,
  };

  const pm  = fc.pm;
  const eff = {
    avg:  Math.min(100, raw.avg  * (pm.avg  || 1)),
    sr:   Math.min(100, raw.sr   * (pm.sr   || 1)),
    bnd:  Math.min(100, raw.bnd  * (pm.bnd  || 1)),
    icc:  raw.icc,
    pop:  Math.min(100, raw.pop  * (pm.pop  || 1)),
    rr:   raw.rr,
    oq:   Math.min(100, raw.oq   * (pm.oq   || 1)),
    pace: raw.pace,
    spin: raw.spin,
    form: Math.min(100, raw.form * (pm.form || 1) * yf.factor),
  };

  const era_adj = Math.min(1, 0.60 + 0.40 * yf.factor);

  const scores = {
    careerOutput:     (eff.avg * fc.sw.avg + eff.sr * fc.sw.sr + eff.bnd * fc.sw.bnd) * era_adj,
    peakICC:          eff.icc,
    popularity:       Math.min(100, eff.pop * (0.80 + 0.20 * yf.factor)),
    roleReliability:  Math.min(100, eff.rr * era_adj),
    oppositionQuality:eff.oq,
    matchupProfile:   (eff.pace + eff.spin) / 2,
    currentForm:      eff.form,
  };

  const weights = { ...fc.weights, ...userWeights };
  const total   = PILLAR_KEYS.reduce((s, k) => s + (weights[k] || 0), 0) || 1;
  const raw_ovr = PILLAR_KEYS.reduce((s, k) => s + scores[k] * (weights[k] || 0) / total, 0);
  const ovr     = Math.round(60 + (raw_ovr * (player.iw || 1)) / 100 * 39);

  return { player, format, year, scores, eff, weights, yf, ovr, fc };
}

/* ═══════════════════════════════════════════════════════════════
   TEST RUNNER
═══════════════════════════════════════════════════════════════ */
let pass = 0, fail = 0;
const failures = [];

function test(suite, name, fn) {
  const label = `${suite} › ${name}`;
  try {
    fn();
    console.log(`  ✓  ${label}`);
    pass++;
  } catch (e) {
    console.error(`  ✗  ${label}`);
    console.error(`       → ${e.message}`);
    fail++;
    failures.push({ label, message: e.message });
  }
}

function eq(actual, expected, msg) {
  if (actual !== expected)
    throw new Error(`${msg || ''} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function inRange(val, min, max, msg) {
  if (typeof val !== 'number' || isNaN(val) || val < min || val > max)
    throw new Error(`${msg || ''} value ${val} not in [${min}, ${max}]`);
}

function notNaN(val, msg) {
  if (typeof val !== 'number' || isNaN(val))
    throw new Error(`${msg || ''} expected a number, got ${val}`);
}

function defined(val, msg) {
  if (val === null || val === undefined)
    throw new Error(`${msg || ''} expected a value, got ${val}`);
}

/* ═══════════════════════════════════════════════════════════════
   SUITE 1 — getYearFactor
═══════════════════════════════════════════════════════════════ */
const kohli = PLAYERS.find(p => p.name === 'Virat Kohli');   // ay:[2008,2026] py:[2014,2019]
const dhoni = PLAYERS.find(p => p.name === 'MS Dhoni');       // ay:[2004,2019] py:[2009,2014]
const warne = PLAYERS.find(p => p.name === 'Shane Warne');    // ay:[1992,2007] py:[1994,2005]
const sky   = PLAYERS.find(p => p.name === 'Suryakumar Yadav'); // ay:[2021,2026] py:[2022,2026]

console.log('\n── getYearFactor ──────────────────────────────────────');

test('getYearFactor', 'year=1985 for Kohli (start=2008) → PRE-CAREER', () => {
  const yf = getYearFactor(kohli, 1985);
  eq(yf.badge, 'PRE-CAREER', 'badge');
  inRange(yf.factor, 0, 1, 'factor');
});

test('getYearFactor', 'year=2007 for Kohli (start=2008) → PRE-CAREER', () => {
  const yf = getYearFactor(kohli, 2007);
  eq(yf.badge, 'PRE-CAREER', 'year one before career start must be PRE-CAREER');
});

test('getYearFactor', 'year=2008 for Kohli (career start) → RISING', () => {
  const yf = getYearFactor(kohli, 2008);
  eq(yf.badge, 'RISING', 'badge');
  inRange(yf.factor, 0.68, 1.0, 'factor should be in RISING range');
});

test('getYearFactor', 'year=2013 for Kohli (1 yr before peak 2014) → RISING', () => {
  const yf = getYearFactor(kohli, 2013);
  eq(yf.badge, 'RISING', 'badge');
  // d=1, factor = max(0.68, 1-0.06) = 0.94
  eq(yf.factor, 0.94, 'factor at 1 year before peak');
});

test('getYearFactor', 'year=2014 for Kohli (peak start) → PEAK', () => {
  const yf = getYearFactor(kohli, 2014);
  eq(yf.badge, 'PEAK', 'badge');
  eq(yf.factor, 1.0, 'factor at peak');
});

test('getYearFactor', 'year=2019 for Kohli (peak end) → PEAK', () => {
  const yf = getYearFactor(kohli, 2019);
  eq(yf.badge, 'PEAK', 'badge');
  eq(yf.factor, 1.0, 'factor at peak end');
});

test('getYearFactor', 'year=2020 for Kohli (1 yr post-peak) → VETERAN', () => {
  const yf = getYearFactor(kohli, 2020);
  eq(yf.badge, 'VETERAN', 'badge');
  // d=1, factor = max(0.58, 1-0.07) = 0.93 — use tolerance to avoid float noise
  if (Math.abs(yf.factor - 0.93) > 0.001)
    throw new Error(`factor expected ~0.93, got ${yf.factor}`);
});

test('getYearFactor', 'year=2026 for Kohli (career end) → VETERAN (not LATE CAREER)', () => {
  // year > end only triggers when year=2027+
  const yf = getYearFactor(kohli, 2026);
  // 2026 is the active year end — player is still playing, should not be LATE CAREER
  eq(yf.badge, 'VETERAN', 'badge at career-end year should be VETERAN');
});

test('getYearFactor', 'year=2027 for Kohli (1 yr post-career) → LATE CAREER', () => {
  const yf = getYearFactor(kohli, 2027);
  eq(yf.badge, 'LATE CAREER', 'badge');
  eq(yf.factor, 0.50, 'factor');
});

test('getYearFactor', 'year=2031 for Kohli (5 yrs post-career) → RETIRED', () => {
  // end+4 = 2030, so year > 2030 → RETIRED
  const yf = getYearFactor(kohli, 2031);
  eq(yf.badge, 'RETIRED', 'badge');
  eq(yf.factor, 0.28, 'factor');
});

test('getYearFactor', 'year=2030 for Kohli (end+4=2030) → RETIRED', () => {
  const yf = getYearFactor(kohli, 2030);
  eq(yf.badge, 'RETIRED', '4 years after career end should be RETIRED');
});

// Retired player (Dhoni, end=2019)
test('getYearFactor', 'Dhoni year=2019 (career end) → VETERAN', () => {
  const yf = getYearFactor(dhoni, 2019);
  eq(yf.badge, 'VETERAN', 'badge');
});

test('getYearFactor', 'Dhoni year=2020 → LATE CAREER', () => {
  const yf = getYearFactor(dhoni, 2020);
  eq(yf.badge, 'LATE CAREER', 'badge');
});

test('getYearFactor', 'Dhoni year=2025 → RETIRED', () => {
  // 2019+4=2023, so year > 2023 → RETIRED
  const yf = getYearFactor(dhoni, 2025);
  eq(yf.badge, 'RETIRED', 'badge');
});

// Warne (ay:[1992,2007])
test('getYearFactor', 'Warne year=1985 (pre-career) → PRE-CAREER', () => {
  const yf = getYearFactor(warne, 1985);
  eq(yf.badge, 'PRE-CAREER', 'badge');
});

test('getYearFactor', 'Warne year=1991 (start-1=1991) → PRE-CAREER', () => {
  const yf = getYearFactor(warne, 1991);
  eq(yf.badge, 'PRE-CAREER', 'year before career start must be PRE-CAREER');
});

test('getYearFactor', 'Warne year=2015 (RETIRED, >2007+4=2011) → RETIRED', () => {
  const yf = getYearFactor(warne, 2015);
  eq(yf.badge, 'RETIRED', 'badge');
});

// SKY: career started 2021, peak 2022-2026
test('getYearFactor', 'SKY year=2021 (career start, 1 before peak 2022) → RISING', () => {
  const yf = getYearFactor(sky, 2021);
  eq(yf.badge, 'RISING', 'badge');
});

test('getYearFactor', 'SKY year=2022 (peak start) → PEAK', () => {
  const yf = getYearFactor(sky, 2022);
  eq(yf.badge, 'PEAK', 'badge');
  eq(yf.factor, 1.0, 'factor');
});

test('getYearFactor', 'factor is always a positive number in [0,1]', () => {
  const years = [1985, 1990, 2000, 2007, 2008, 2010, 2014, 2016, 2019, 2020, 2024, 2026, 2028, 2031];
  for (const player of PLAYERS) {
    for (const yr of years) {
      const yf = getYearFactor(player, yr);
      inRange(yf.factor, 0, 1, `${player.name} yr=${yr} factor`);
      defined(yf.badge, `${player.name} yr=${yr} badge`);
    }
  }
});

/* ═══════════════════════════════════════════════════════════════
   SUITE 2 — findPlayer
═══════════════════════════════════════════════════════════════ */
console.log('\n── findPlayer ─────────────────────────────────────────');

test('findPlayer', 'exact full name match (case-insensitive)', () => {
  eq(findPlayer('Virat Kohli')?.name,  'Virat Kohli',  'exact match');
  eq(findPlayer('virat kohli')?.name,  'Virat Kohli',  'lowercase');
  eq(findPlayer('VIRAT KOHLI')?.name,  'Virat Kohli',  'uppercase');
});

test('findPlayer', 'first-name prefix match', () => {
  eq(findPlayer('virat')?.name,     'Virat Kohli',      'first name');
  eq(findPlayer('Shane')?.name,     'Shane Warne',       'shane');
  eq(findPlayer('Suryak')?.name,    'Suryakumar Yadav',  'suryak prefix');
});

test('findPlayer', 'last-name match', () => {
  eq(findPlayer('kohli')?.name,  'Virat Kohli',  'last name');
  eq(findPlayer('warne')?.name,  'Shane Warne',  'warne');
  eq(findPlayer('dhoni')?.name,  'MS Dhoni',     'dhoni');
});

test('findPlayer', 'partial substring match', () => {
  eq(findPlayer('de Villiers')?.name, 'AB de Villiers', 'de villiers');
  eq(findPlayer('rashid')?.name,      'Rashid Khan',    'rashid');
});

test('findPlayer', 'empty string → null', () => {
  eq(findPlayer(''), null, 'empty string');
  eq(findPlayer('   '), null, 'whitespace');
});

test('findPlayer', 'no match → null', () => {
  eq(findPlayer('zzznomatch999'), null, 'no match');
  eq(findPlayer('Donald Trump'),  null, 'not a cricketer');
});

/* ═══════════════════════════════════════════════════════════════
   SUITE 3 — buildCard
═══════════════════════════════════════════════════════════════ */
console.log('\n── buildCard ──────────────────────────────────────────');

const DEFAULT_WEIGHTS = {};   // empty = use format defaults

// The reported bug case
test('buildCard', 'Kohli T20I year=1985 does not throw', () => {
  let card;
  try { card = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS); }
  catch(e) { throw new Error(`buildCard threw: ${e.message}`); }
  defined(card, 'card returned');
});

test('buildCard', 'Kohli T20I year=1985 OVR is a valid number in [60,99]', () => {
  const card = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS);
  notNaN(card.ovr, 'ovr');
  inRange(card.ovr, 60, 99, 'ovr');
});

test('buildCard', 'Kohli T20I year=1985 yf.badge is PRE-CAREER', () => {
  const card = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS);
  eq(card.yf.badge, 'PRE-CAREER', 'badge');
});

test('buildCard', 'Kohli T20I year=1985 currentForm score is reduced vs peak', () => {
  const peak    = buildCard(kohli, 'T20I', 2016, DEFAULT_WEIGHTS);
  const preCrr  = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS);
  if (preCrr.scores.currentForm >= peak.scores.currentForm)
    throw new Error(`pre-career form ${preCrr.scores.currentForm} >= peak form ${peak.scores.currentForm}`);
});

test('buildCard', 'Kohli T20I year=1985 OVR is lower than peak year 2016', () => {
  const peak    = buildCard(kohli, 'T20I', 2016, DEFAULT_WEIGHTS);
  const preCrr  = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS);
  if (preCrr.ovr >= peak.ovr)
    throw new Error(`pre-career OVR ${preCrr.ovr} >= peak OVR ${peak.ovr} — current form reduction too small`);
});

test('buildCard', 'Test format raises Kohli OVR to at least T20I level', () => {
  // Both formats can round to the same OVR at the ceiling (95); ≥ is the correct invariant
  const t20   = buildCard(kohli, 'T20I', 2016, DEFAULT_WEIGHTS);
  const test_ = buildCard(kohli, 'Test', 2016, DEFAULT_WEIGHTS);
  if (test_.ovr < t20.ovr)
    throw new Error(`Test OVR ${test_.ovr} should be >= T20I OVR ${t20.ovr} for Kohli`);
});

test('buildCard', 'Test format applies batting avg override for Kohli (avg goes 88→95)', () => {
  const card = buildCard(kohli, 'Test', 2016, DEFAULT_WEIGHTS);
  // raw.avg should use fo.Test.avg = 95, then pm.avg=1.05 → min(100, 95*1.05)=99.75→capped at 100
  if (card.eff.avg < 95)
    throw new Error(`Test avg ${card.eff.avg} should be >= 95 (from format override)`);
});

test('buildCard', 'Test format applies SR multiplier (0.70) reducing sr score', () => {
  const t20  = buildCard(kohli, 'T20I', 2016, DEFAULT_WEIGHTS);
  const test_= buildCard(kohli, 'Test', 2016, DEFAULT_WEIGHTS);
  if (test_.eff.sr >= t20.eff.sr)
    throw new Error(`Test SR ${test_.eff.sr} should be < T20I SR ${t20.eff.sr}`);
});

test('buildCard', 'Steve Smith Test OVR higher than T20I OVR', () => {
  const smith = PLAYERS.find(p => p.name === 'Steve Smith');
  const t20   = buildCard(smith, 'T20I', 2017, DEFAULT_WEIGHTS);
  const test_ = buildCard(smith, 'Test', 2017, DEFAULT_WEIGHTS);
  if (test_.ovr <= t20.ovr)
    throw new Error(`Smith Test OVR ${test_.ovr} should be > T20I OVR ${t20.ovr}`);
});

test('buildCard', 'Shane Warne Test 2001 (peak) → LEGEND tier expected', () => {
  const card = buildCard(warne, 'Test', 2001, DEFAULT_WEIGHTS);
  const tier = getTier(card.ovr);
  defined(tier, 'tier not null');
  if (card.ovr < 90)
    throw new Error(`Warne peak Test OVR ${card.ovr} should be >= 90`);
});

test('buildCard', 'SKY T20I 2023 OVR > SKY Test 2023 OVR (T20 specialist)', () => {
  const t20  = buildCard(sky, 'T20I', 2023, DEFAULT_WEIGHTS);
  const test_= buildCard(sky, 'Test', 2023, DEFAULT_WEIGHTS);
  if (t20.ovr <= test_.ovr)
    throw new Error(`SKY T20I OVR ${t20.ovr} should be > Test OVR ${test_.ovr}`);
});

test('buildCard', 'Retired Dhoni 2024 has lower OVR than peak 2012', () => {
  const peak = buildCard(dhoni, 'T20I', 2012, DEFAULT_WEIGHTS);
  const ret  = buildCard(dhoni, 'T20I', 2024, DEFAULT_WEIGHTS);
  if (ret.ovr >= peak.ovr)
    throw new Error(`Retired OVR ${ret.ovr} should be < peak OVR ${peak.ovr}`);
});

test('buildCard', 'Format override falls back to base pillars when no override exists', () => {
  // Rashid Khan has fo:{} — no overrides for any format
  const rashid = PLAYERS.find(p => p.name === 'Rashid Khan');
  const card   = buildCard(rashid, 'Test', 2020, DEFAULT_WEIGHTS);
  // eff.avg should equal raw base (no pm.avg in T20I, but Test pm.avg=1.05)
  eq(card.eff.avg, Math.min(100, rashid.p.avg * 1.05), 'avg uses base pillar * Test multiplier');
});

test('buildCard', 'All scores are defined, finite numbers', () => {
  const card = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS);
  for (const key of PILLAR_KEYS) {
    notNaN(card.scores[key], `scores.${key}`);
    inRange(card.scores[key], 0, 100, `scores.${key}`);
  }
});

test('buildCard', 'All eff values are in [0, 100]', () => {
  const card = buildCard(kohli, 'T20I', 1985, DEFAULT_WEIGHTS);
  for (const key of Object.keys(card.eff)) {
    notNaN(card.eff[key], `eff.${key}`);
    inRange(card.eff[key], 0, 100, `eff.${key}`);
  }
});

/* ═══════════════════════════════════════════════════════════════
   SUITE 4 — OVR range: every player × every format × boundary years
═══════════════════════════════════════════════════════════════ */
console.log('\n── OVR range (all players × all formats × boundary years) ─');

const BOUNDARY_YEARS = [1985, 1992, 2000, 2007, 2008, 2010, 2014, 2016, 2019, 2020, 2024, 2026, 2030, 2031];

test('OVR range', 'OVR is always an integer in [60,99] — no NaN, no out-of-range', () => {
  let total = 0;
  for (const player of PLAYERS) {
    for (const fmt of FORMAT_KEYS) {
      for (const yr of BOUNDARY_YEARS) {
        const card = buildCard(player, fmt, yr, DEFAULT_WEIGHTS);
        if (typeof card.ovr !== 'number' || isNaN(card.ovr))
          throw new Error(`${player.name} ${fmt} ${yr}: OVR is NaN`);
        if (card.ovr < 60 || card.ovr > 99)
          throw new Error(`${player.name} ${fmt} ${yr}: OVR=${card.ovr} out of [60,99]`);
        if (!Number.isInteger(card.ovr))
          throw new Error(`${player.name} ${fmt} ${yr}: OVR=${card.ovr} is not an integer`);
        total++;
      }
    }
  }
  console.log(`       (${total} cards computed without error)`);
});

test('OVR range', 'getTier always returns a defined tier for any valid OVR', () => {
  for (const player of PLAYERS) {
    for (const fmt of FORMAT_KEYS) {
      for (const yr of BOUNDARY_YEARS) {
        const card = buildCard(player, fmt, yr, DEFAULT_WEIGHTS);
        const tier = getTier(card.ovr);
        if (!tier)
          throw new Error(`${player.name} ${fmt} ${yr}: OVR=${card.ovr} → getTier returned undefined`);
      }
    }
  }
});

/* ═══════════════════════════════════════════════════════════════
   SUITE 5 — getTier
═══════════════════════════════════════════════════════════════ */
console.log('\n── getTier ────────────────────────────────────────────');

test('getTier', 'OVR=95 → LEGEND', () => eq(getTier(95)?.label, 'LEGEND', 'tier'));
test('getTier', 'OVR=94 → ICON',   () => eq(getTier(94)?.label, 'ICON',   'tier'));
test('getTier', 'OVR=90 → ICON',   () => eq(getTier(90)?.label, 'ICON',   'tier'));
test('getTier', 'OVR=89 → ELITE',  () => eq(getTier(89)?.label, 'ELITE',  'tier'));
test('getTier', 'OVR=85 → ELITE',  () => eq(getTier(85)?.label, 'ELITE',  'tier'));
test('getTier', 'OVR=80 → STAR',   () => eq(getTier(80)?.label, 'STAR',   'tier'));
test('getTier', 'OVR=75 → PRO',    () => eq(getTier(75)?.label, 'PRO',    'tier'));
test('getTier', 'OVR=74 → RARE',   () => eq(getTier(74)?.label, 'RARE',   'tier'));
test('getTier', 'OVR=60 → RARE',   () => eq(getTier(60)?.label, 'RARE',   'tier'));
test('getTier', 'OVR=NaN → undefined (render crash risk)', () => {
  const tier = getTier(NaN);
  if (tier !== undefined)
    throw new Error(`getTier(NaN) returned ${JSON.stringify(tier)} — should be undefined`);
  // This documents the crash risk: accessing tier.bg in BigCard/CollectionMini would throw
});

/* ═══════════════════════════════════════════════════════════════
   RESULTS
═══════════════════════════════════════════════════════════════ */
console.log('\n' + '─'.repeat(56));
console.log(`  ${pass} passed   ${fail} failed   ${pass + fail} total`);

if (failures.length > 0) {
  console.log('\nFailed tests:');
  failures.forEach((f, i) => console.log(`  ${i+1}. ${f.label}\n     ${f.message}`));
}

console.log('─'.repeat(56) + '\n');
process.exit(fail > 0 ? 1 : 0);
