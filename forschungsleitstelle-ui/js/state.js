// Forschungsleitstelle — State Management

const STORAGE_KEY = 'forschungsleitstelle-state';

const MODES = ['IDLE', 'PLANNING', 'WORKING', 'REVIEW', 'BLOCKED', 'PAUSED', 'DONE'];
const LANE_TYPES = ['project', 'infra'];

let state = createEmptyState();
let listeners = [];

function createEmptyState() {
  return {
    lanes: [],
    synthesis: [],
    output: { type: null, target: null, content: '', timestamp: null },
    session: { id: generateId(), lastSnapshot: null },
    selectedLane: null
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ===== CRUD =====

export function getLanes() {
  return state.lanes.filter(l => !l.archived);
}

export function getLane(number) {
  return state.lanes.find(l => l.number === number);
}

export function addLane({ name, scope, type = 'project', mode = 'IDLE', next = '', horizon = null, cluster = null }) {
  const maxNum = state.lanes.reduce((max, l) => Math.max(max, l.number), 0);
  const lane = {
    number: maxNum + 1,
    name,
    scope,
    mode,
    type,
    next,
    horizon,
    blockers: [],
    deps: [],
    updates: [{ date: new Date().toISOString(), text: `Lane erstellt. Mode: ${mode}` }],
    decisions: [],
    cluster,
    archived: false
  };
  state.lanes.push(lane);
  save();
  notify();
  return lane;
}

export function updateLane(number, patch) {
  const lane = getLane(number);
  if (!lane) return;

  const oldMode = lane.mode;
  Object.assign(lane, patch);

  if (patch.mode && patch.mode !== oldMode) {
    lane.updates.push({ date: new Date().toISOString(), text: `Mode: ${oldMode} → ${patch.mode}` });
  }

  save();
  notify();
}

export function addUpdate(number, text) {
  const lane = getLane(number);
  if (!lane) return;
  lane.updates.push({ date: new Date().toISOString(), text });
  save();
  notify();
}

export function addDecision(number, text) {
  const lane = getLane(number);
  if (!lane) return;
  const entry = `[${new Date().toISOString().split('T')[0]}] ${text}`;
  lane.decisions.push(entry);
  if (lane.decisions.length > 5) lane.decisions.shift();
  save();
  notify();
}

export function addBlocker(number, description) {
  const lane = getLane(number);
  if (!lane) return;
  lane.blockers.push({ description, since: new Date().toISOString() });
  save();
  notify();
}

export function removeBlocker(number, index) {
  const lane = getLane(number);
  if (!lane) return;
  lane.blockers.splice(index, 1);
  save();
  notify();
}

export function archiveLane(number) {
  updateLane(number, { archived: true, mode: 'DONE' });
}

export function addDep(from, to, type = 'output') {
  state.lanes.forEach(l => {
    if (l.number === from) {
      const exists = l.deps.some(d => d.from === from && d.to === to && d.type === type);
      if (!exists) l.deps.push({ from, to, type, status: 'pending' });
    }
  });
  save();
  notify();
}

// ===== SYNTHESIS =====

export function getSynthesis() {
  return state.synthesis;
}

export function addSynthesis(lanes, insight, category = 'methodology') {
  state.synthesis.push({ id: generateId(), lanes, insight, category, created: new Date().toISOString() });
  save();
  notify();
}

export function removeSynthesis(id) {
  state.synthesis = state.synthesis.filter(s => s.id !== id);
  save();
  notify();
}

// ===== OUTPUT =====

export function setOutput(type, target, content) {
  state.output = { type, target, content, timestamp: new Date().toISOString() };
  save();
  notify();
}

export function getOutput() {
  return state.output;
}

// ===== SELECTION =====

export function selectLane(number) {
  state.selectedLane = number;
  notify();
}

export function getSelectedLane() {
  return state.selectedLane ? getLane(state.selectedLane) : null;
}

export function deselectLane() {
  state.selectedLane = null;
  notify();
}

// ===== STATS =====

export function getStats() {
  const lanes = getLanes();
  return {
    active: lanes.filter(l => ['PLANNING', 'WORKING', 'REVIEW'].includes(l.mode)).length,
    blocked: lanes.filter(l => l.mode === 'BLOCKED').length,
    done: lanes.filter(l => l.mode === 'DONE').length,
    idle: lanes.filter(l => l.mode === 'IDLE').length,
    total: lanes.length
  };
}

// ===== PRIORITY SORT =====

export function getLanesSorted() {
  const lanes = getLanes();
  const modeOrder = { BLOCKED: 0, WORKING: 1, REVIEW: 2, PLANNING: 3, IDLE: 4, PAUSED: 5, DONE: 6 };

  return [...lanes].sort((a, b) => {
    // Infra lanes last
    if (a.type === 'infra' && b.type !== 'infra') return 1;
    if (b.type === 'infra' && a.type !== 'infra') return -1;

    // By mode priority
    const modeA = modeOrder[a.mode] ?? 99;
    const modeB = modeOrder[b.mode] ?? 99;
    if (modeA !== modeB) return modeA - modeB;

    // By deadline proximity
    if (a.horizon?.date && b.horizon?.date) return new Date(a.horizon.date) - new Date(b.horizon.date);
    if (a.horizon?.date) return -1;
    if (b.horizon?.date) return 1;

    return a.number - b.number;
  });
}

// ===== PERSISTENCE =====

function save() {
  state.session.lastSnapshot = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save state:', e);
  }
}

export function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...createEmptyState(), ...parsed };
      return true;
    }
  } catch (e) {
    console.warn('Failed to load state:', e);
  }
  return false;
}

export async function loadDemoState() {
  try {
    const res = await fetch('./data/demo-state.json');
    const demo = await res.json();
    state = { ...createEmptyState(), ...demo };
    save();
    notify();
    return true;
  } catch (e) {
    console.warn('Failed to load demo state:', e);
    return false;
  }
}

export function importState(stateObj) {
  state = { ...createEmptyState(), ...stateObj };
  save();
  notify();
}

export function exportState() {
  return JSON.parse(JSON.stringify(state));
}

export function clearState() {
  state = createEmptyState();
  save();
  notify();
}

// ===== SUBSCRIPTIONS =====

export function subscribe(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter(l => l !== fn); };
}

function notify() {
  listeners.forEach(fn => fn(state));
}

// ===== CONSTANTS =====

export { MODES, LANE_TYPES };
