// Forschungsleitstelle — Command Bar

import { getLanes, getLane, getSynthesis, selectLane, deselectLane, archiveLane, setOutput, getLanesSorted } from './state.js';
import { renderDashboard } from './render.js';
import { generateExportMarkdown } from './import-export.js';

const COMMANDS = [
  { cmd: '/status', desc: 'Alle Lanes anzeigen', action: cmdStatus },
  { cmd: '/next', desc: 'Prioritätsreihenfolge anzeigen', action: cmdNext },
  { cmd: '/blocker', desc: 'Alle Blocker auflisten', action: cmdBlocker },
  { cmd: '/deps', desc: 'Dependencies anzeigen', action: cmdDeps },
  { cmd: '/synth', desc: 'Synthesis-Report', action: cmdSynth },
  { cmd: '/export', desc: 'State als Markdown exportieren', action: cmdExport },
  { cmd: '/add', desc: 'Neue Lane hinzufügen', action: cmdAdd },
  { cmd: '/clear', desc: 'Output-Panel schließen', action: cmdClear },
  { cmd: '/demo', desc: 'Demo-Daten laden', action: cmdDemo },
  { cmd: '/reset', desc: 'Alle Daten löschen', action: cmdReset },
];

let isOpen = false;
let activeIndex = 0;
let currentFilter = '';

export function initCommandBar() {
  const overlay = document.getElementById('command-overlay');
  const input = document.getElementById('command-input');

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCommandBar();
  });

  input.addEventListener('input', () => {
    currentFilter = input.value;
    activeIndex = 0;
    renderResults();
  });

  input.addEventListener('keydown', (e) => {
    const results = getFilteredResults();

    if (e.key === 'Escape') {
      e.preventDefault();
      closeCommandBar();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, results.length - 1);
      renderResults();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderResults();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[activeIndex]) {
        executeResult(results[activeIndex]);
      } else if (currentFilter.trim()) {
        parseAndExecute(currentFilter.trim());
      }
      closeCommandBar();
    }
  });
}

export function openCommandBar() {
  const overlay = document.getElementById('command-overlay');
  const input = document.getElementById('command-input');
  isOpen = true;
  currentFilter = '';
  activeIndex = 0;
  overlay.classList.add('visible');
  input.value = '';
  input.focus();
  renderResults();
}

export function closeCommandBar() {
  const overlay = document.getElementById('command-overlay');
  isOpen = false;
  overlay.classList.remove('visible');
}

export function isCommandBarOpen() {
  return isOpen;
}

function getFilteredResults() {
  const q = currentFilter.toLowerCase().trim();
  const results = [];

  for (const c of COMMANDS) {
    if (!q || c.cmd.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q)) {
      results.push({ type: 'command', label: c.cmd, desc: c.desc, action: c.action });
    }
  }

  if (q) {
    for (const lane of getLanes()) {
      const laneStr = `l${lane.number} ${lane.name}`.toLowerCase();
      if (laneStr.includes(q)) {
        results.push({ type: 'lane', label: `L${lane.number} ${lane.name}`, desc: `${lane.mode} — ${lane.scope}`, laneNumber: lane.number });
      }
    }
  }

  const statusMatch = q.match(/^\/status\s+(\d+)$/);
  if (statusMatch) {
    const n = parseInt(statusMatch[1]);
    const lane = getLane(n);
    if (lane) {
      results.unshift({ type: 'command', label: `/status ${n}`, desc: `Lane ${n} Detail öffnen`, action: () => selectLane(n) });
    }
  }

  const archiveMatch = q.match(/^\/archive\s+(\d+)$/);
  if (archiveMatch) {
    const n = parseInt(archiveMatch[1]);
    results.unshift({ type: 'command', label: `/archive ${n}`, desc: `Lane ${n} archivieren`, action: () => archiveLane(n) });
  }

  return results.slice(0, 10);
}

function renderResults() {
  const container = document.getElementById('command-results');
  const results = getFilteredResults();

  container.innerHTML = results.map((r, i) => `
    <div class="command-item ${i === activeIndex ? 'active' : ''}"
         data-index="${i}"
         onmouseenter="this.parentElement.querySelectorAll('.active').forEach(e=>e.classList.remove('active'));this.classList.add('active')"
         onclick="window.app.executeCommandResult(${i})">
      <div>
        <span class="command-item-label">${escHtml(r.label)}</span>
        <span class="command-item-desc" style="margin-left:8px">${escHtml(r.desc)}</span>
      </div>
    </div>
  `).join('');
}

export function executeCommandResult(index) {
  const results = getFilteredResults();
  if (results[index]) {
    executeResult(results[index]);
    closeCommandBar();
  }
}

function executeResult(result) {
  if (result.type === 'lane') {
    selectLane(result.laneNumber);
  } else if (result.action) {
    result.action();
  }
}

function parseAndExecute(input) {
  const statusMatch = input.match(/^\/status\s+(\d+)$/);
  if (statusMatch) { selectLane(parseInt(statusMatch[1])); return; }

  const archiveMatch = input.match(/^\/archive\s+(\d+)$/);
  if (archiveMatch) { archiveLane(parseInt(archiveMatch[1])); return; }

  const cmd = COMMANDS.find(c => c.cmd === input);
  if (cmd) cmd.action();
}

// ===== COMMAND IMPLEMENTATIONS =====

function cmdStatus() {
  deselectLane();
  renderDashboard();
}

function cmdNext() {
  const lanes = getLanesSorted().filter(l => !['DONE', 'PAUSED'].includes(l.mode) && l.type !== 'infra');
  if (lanes.length === 0) {
    setOutput('info', null, 'Keine aktiven Lanes.');
    return;
  }

  const text = 'PRIORITÄT (nach Deadline, Unblocking, Ausführbarkeit):\n\n' +
    lanes.map((l, i) => `${i + 1}. L${l.number} ${l.name} [${l.mode}]` +
      (l.horizon ? ` — ${l.horizon.label} (${l.horizon.date})` : '') +
      (l.blockers.length ? ` ⚠ BLOCKED: ${l.blockers[0].description}` : '') +
      `\n   → ${l.next}`
    ).join('\n\n');

  setOutput('info', null, text);
}

function cmdBlocker() {
  const lanes = getLanes();
  const blockers = [];
  for (const lane of lanes) {
    for (const b of lane.blockers) {
      const days = Math.ceil((Date.now() - new Date(b.since)) / (1000 * 60 * 60 * 24));
      blockers.push(`L${lane.number} ${lane.name}: ${b.description} (${days}d)`);
    }
  }

  setOutput('info', null, blockers.length === 0
    ? 'Keine aktiven Blocker.'
    : 'AKTIVE BLOCKER:\n\n' + blockers.join('\n'));
}

function cmdDeps() {
  const lanes = getLanes();
  const deps = [];
  for (const lane of lanes) {
    for (const d of lane.deps) {
      deps.push(`L${d.from} —${d.type}→ L${d.to} (${d.status})`);
    }
  }

  setOutput('info', null, deps.length === 0
    ? 'Keine Dependencies.'
    : 'DEPENDENCY GRAPH:\n\n' + deps.join('\n'));
}

function cmdSynth() {
  const entries = getSynthesis();

  if (entries.length === 0) {
    setOutput('info', null, 'Keine Synthesis-Einträge.');
  } else {
    const text = 'SYNTHESIS REPORT:\n\n' + entries.map(s =>
      `[${s.category}] ${s.insight}\n  Lanes: ${s.lanes.map(n => 'L' + n).join(', ')}`
    ).join('\n\n');
    setOutput('info', null, text);
  }
}

function cmdExport() {
  const markdown = generateExportMarkdown();
  setOutput('export', null, markdown);
}

function cmdAdd() {
  window.app.showAddLaneDialog();
}

function cmdClear() {
  setOutput(null, null, '');
}

function cmdDemo() {
  window.app.loadDemo();
}

function cmdReset() {
  if (confirm('Alle Daten löschen?')) {
    window.app.clearState();
  }
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
