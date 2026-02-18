// Forschungsleitstelle — Rendering

import { getLanesSorted, getLane, getStats, getSynthesis, getOutput, getSelectedLane, selectLane, deselectLane, updateLane, addUpdate, archiveLane, MODES } from './state.js';
import { copyToClipboard } from './clipboard.js';
import { generateTaskInstruction, generateHandoffBlock, generateQueryBlock } from './import-export.js';

// ===== UI STATE (toggles, not persisted) =====

let _doneSectionExpanded = false;
let _synthExpanded = false;

export function toggleDoneSection() {
  _doneSectionExpanded = !_doneSectionExpanded;
}

export function toggleSynth() {
  _synthExpanded = !_synthExpanded;
}

// ===== DASHBOARD =====

export function renderDashboard() {
  renderHeader();
  renderFocus();
  renderLanes();
  renderSynthesis();
  renderBlockers();
  renderSidePanel();
  renderOutputPanel();
}

function renderHeader() {
  const stats = getStats();
  const el = document.getElementById('header-stats');
  if (!el) return;

  el.innerHTML = `
    <span class="stat-badge stat-active">${stats.active} active</span>
    <span class="stat-badge stat-blocked">${stats.blocked} blocked</span>
    <span class="stat-badge stat-done">${stats.done} done</span>
  `;
}

// ===== P6: FOCUS SECTION =====

function renderFocus() {
  const container = document.getElementById('focus');
  if (!container) return;

  const lanes = getLanesSorted();
  const focusLanes = lanes.filter(l =>
    l.type !== 'infra' &&
    ['BLOCKED', 'WORKING', 'REVIEW'].includes(l.mode)
  ).slice(0, 3);

  if (focusLanes.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = '<div class="focus-section">';
  html += '<div class="focus-label">Fokus</div>';

  for (const lane of focusLanes) {
    const modeClass = lane.mode.toLowerCase();
    const hasBlocker = lane.blockers.length > 0;
    const horizonInfo = getHorizonInfo(lane.horizon);

    html += `
      <div class="focus-card focus-${modeClass}"
           onclick="window.app.selectLane(${lane.number})">
        <div class="focus-card-header">
          <span class="focus-card-id">L${lane.number} ${escHtml(lane.name)}</span>
          <div class="focus-card-actions">
            <span class="lane-quick-actions">
              <button class="lane-quick-copy"
                      onclick="event.stopPropagation(); window.app.quickCopyTask(${lane.number})"
                      title="Task-Instruction generieren und kopieren">Task kopieren</button>
            </span>
            <span class="mode-badge ${modeClass}">${lane.mode}</span>
          </div>
        </div>
        <div class="focus-card-next">${escHtml(lane.next || '\u2014')}</div>
        <div class="focus-card-meta">
          ${hasBlocker ? `<span class="blocker-highlight">\u23F8 ${escHtml(lane.blockers[0].description)}</span>` : ''}
          ${horizonInfo.urgency ? `<span class="deadline-highlight">\u23F0 ${horizonInfo.text}</span>` : (horizonInfo.text !== 'kein ext. Deadline' ? `<span>\u23F0 ${horizonInfo.text}</span>` : '')}
        </div>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

// ===== LANES (P2: Active/Done separation) =====

function renderLanes() {
  const container = document.getElementById('lanes');
  if (!container) return;

  const lanes = getLanesSorted();
  const selected = getSelectedLane();

  if (lanes.length === 0) {
    renderEmptyState(container);
    return;
  }

  const infraLanes = lanes.filter(l => l.type === 'infra');
  const activeLanes = lanes.filter(l => l.type !== 'infra' && l.mode !== 'DONE');
  const doneLanes = lanes.filter(l => l.type !== 'infra' && l.mode === 'DONE');

  let html = '';

  // Active project lanes
  if (activeLanes.length) {
    html += '<div class="section-label">Aktive Lanes</div>';
    html += '<div class="lane-grid">';
    html += activeLanes.map(l => renderLaneCard(l, selected?.number === l.number)).join('');
    html += '</div>';
  }

  // Done lanes — collapsed section
  if (doneLanes.length) {
    html += `<div class="section-label done-section-toggle" onclick="window.app.toggleDoneSection()">
      Abgeschlossen (${doneLanes.length}) <span class="toggle-indicator">${_doneSectionExpanded ? '\u25BC' : '\u25B6'}</span>
    </div>`;
    if (_doneSectionExpanded) {
      html += '<div class="lane-grid done-grid">';
      html += doneLanes.map(l => renderLaneCard(l, selected?.number === l.number)).join('');
      html += '</div>';
    }
  }

  // Infra lanes
  if (infraLanes.length) {
    html += '<div class="section-label">Infrastruktur</div>';
    html += '<div class="lane-grid">';
    html += infraLanes.map(l => renderLaneCard(l, selected?.number === l.number)).join('');
    html += '</div>';
  }

  container.innerHTML = html;
}

// ===== P5: EMPTY STATE (Onboarding) =====

function renderEmptyState(container) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-title">Forschungsleitstelle</div>
      <div class="empty-state-subtitle">
        Koordinations-Dashboard f\u00FCr parallele KI-Agenten.<br>
        Verwalte Lanes, formuliere Task-Instructions, kopiere sie in deine Terminals.
      </div>

      <div class="empty-state-actions">
        <div class="empty-state-action" onclick="window.app.loadDemo()">
          <span class="empty-state-action-icon">\u25B6</span>
          <div class="empty-state-action-text">
            <span class="empty-state-action-title">Beispiel-Szenario laden</span>
            <span class="empty-state-action-desc">VetMedAI-Forschungsprojekt mit 5 Lanes in verschiedenen Phasen</span>
          </div>
        </div>
        <div class="empty-state-action" onclick="window.app.handleImport()">
          <span class="empty-state-action-icon">\u2191</span>
          <div class="empty-state-action-text">
            <span class="empty-state-action-title">State importieren</span>
            <span class="empty-state-action-desc">JSON oder Markdown aus /export der Forschungsleitstelle CLI</span>
          </div>
        </div>
        <div class="empty-state-action" onclick="window.app.showAddLaneDialog()">
          <span class="empty-state-action-icon">+</span>
          <div class="empty-state-action-text">
            <span class="empty-state-action-title">Neue Lane anlegen</span>
            <span class="empty-state-action-desc">Manuell ein Projekt oder eine Infra-Lane erstellen</span>
          </div>
        </div>
      </div>

      <div class="empty-state-shortcuts">
        <div class="empty-state-shortcuts-title">Tastaturk\u00FCrzel</div>
        <div class="shortcut-list">
          <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Command Bar</span>
          <span><kbd>Ctrl</kbd>+<kbd>E</kbd> Export</span>
          <span><kbd>Esc</kbd> Panel schlie\u00DFen</span>
          <span><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd> Output kopieren</span>
        </div>
      </div>
    </div>
  `;
}

// ===== LANE CARD (P4: Quick-Copy button) =====

function renderLaneCard(lane, isSelected) {
  const modeClass = lane.mode.toLowerCase();
  const selectedClass = isSelected ? 'selected' : '';
  const hasBlocker = lane.blockers.length > 0;
  const horizonInfo = getHorizonInfo(lane.horizon);
  const showQuickCopy = lane.mode !== 'DONE' && lane.type !== 'infra';

  return `
    <div class="lane-card mode-${modeClass} ${selectedClass}"
         data-lane="${lane.number}"
         onclick="window.app.selectLane(${lane.number})">
      <div class="lane-header">
        <span class="lane-id">L${lane.number} ${escHtml(lane.name)}</span>
        <div style="display:flex;align-items:center;gap:var(--space-xs)">
          ${showQuickCopy ? `<span class="lane-quick-actions">
            <button class="lane-quick-copy"
                    onclick="event.stopPropagation(); window.app.quickCopyTask(${lane.number})"
                    title="Task-Instruction generieren und kopieren">Task kopieren</button>
          </span>` : ''}
          <span class="mode-badge ${modeClass}">${lane.mode}</span>
        </div>
      </div>
      <div class="lane-body">
        <div class="lane-state">${escHtml(lane.scope)}</div>
        <div class="lane-next">${escHtml(lane.next || '\u2014')}</div>
        <div class="lane-blocker ${hasBlocker ? 'has-blocker' : ''}">
          ${hasBlocker ? escHtml(lane.blockers[0].description) : 'none'}
        </div>
        <div class="lane-horizon ${horizonInfo.urgency}">
          ${horizonInfo.text}
        </div>
      </div>
    </div>
  `;
}

function getHorizonInfo(horizon) {
  if (!horizon?.date) return { text: 'kein ext. Deadline', urgency: '' };

  const now = new Date();
  const deadline = new Date(horizon.date);
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  let urgency = '';
  if (diffDays < 0) urgency = 'urgent';
  else if (diffDays <= 3) urgency = 'urgent';
  else if (diffDays <= 7) urgency = 'soon';

  const label = horizon.label || horizon.date;
  const daysText = diffDays < 0 ? `${Math.abs(diffDays)}d \u00FCberf\u00E4llig` : `${diffDays}d`;

  return { text: `${label} (${daysText})`, urgency };
}

// ===== P3: SYNTHESIS (Collapsible) =====

function renderSynthesis() {
  const container = document.getElementById('synthesis');
  if (!container) return;

  const entries = getSynthesis();
  if (entries.length === 0) {
    container.innerHTML = '';
    return;
  }

  const firstInsight = entries[0].insight;
  const truncated = firstInsight.length > 80 ? firstInsight.substring(0, 80) + '...' : firstInsight;

  let html = '<div class="synth-section">';
  html += `<div class="synth-header" onclick="window.app.toggleSynth()">
    <span class="synth-count">SYNTH (${entries.length})</span>
    <span class="synth-preview">${_synthExpanded ? '' : escHtml(truncated)}</span>
    <span class="synth-toggle">${_synthExpanded ? '\u25BC' : '\u25B6'}</span>
  </div>`;

  if (_synthExpanded) {
    html += '<div class="synth-expanded">';
    html += entries.map(s => `
      <div class="synth-banner">
        <div class="synth-label">${escHtml(s.category)}</div>
        <div class="synth-text">${escHtml(s.insight)}</div>
        <div class="synth-lanes">Lanes: ${s.lanes.map(n => 'L' + n).join(', ')}</div>
      </div>
    `).join('');
    html += '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

// ===== BLOCKERS =====

function renderBlockers() {
  const container = document.getElementById('blockers');
  if (!container) return;

  const lanes = getLanesSorted();
  const blockers = [];

  for (const lane of lanes) {
    for (const b of lane.blockers) {
      const days = Math.ceil((Date.now() - new Date(b.since)) / (1000 * 60 * 60 * 24));
      blockers.push({ lane: lane.number, name: lane.name, description: b.description, days, stale: days >= 2 });
    }
  }

  if (blockers.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="blocker-bar">
      <span class="section-label" style="margin:0">EXT-BLOCKER</span>
      ${blockers.map(b => `
        <span class="blocker-item ${b.stale ? 'stale' : ''}">
          <span class="blocker-label">L${b.lane}:</span>
          ${escHtml(b.description)}
          <span class="blocker-age">(${b.days}d)</span>
        </span>
      `).join(' | ')}
    </div>
  `;
}

// ===== SIDE PANEL (Lane Detail) =====

export function renderSidePanel() {
  const panel = document.getElementById('side-panel');
  const app = document.getElementById('app');
  const lane = getSelectedLane();

  if (!lane) {
    app.classList.remove('panel-open');
    panel.innerHTML = '';
    return;
  }

  app.classList.add('panel-open');

  const modeOptions = MODES.map(m =>
    `<option value="${m}" ${m === lane.mode ? 'selected' : ''}>${m}</option>`
  ).join('');

  panel.innerHTML = `
    <div class="detail-header">
      <span class="detail-title">L${lane.number} ${escHtml(lane.name)}</span>
      <button class="btn-icon" onclick="window.app.deselectLane()" title="Schlie\u00DFen">\u2715</button>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Status</div>
      <div class="detail-field">
        <span class="detail-field-label">Mode</span>
        <select class="mode-select" onchange="window.app.updateLaneMode(${lane.number}, this.value)">
          ${modeOptions}
        </select>
      </div>
      <div class="detail-field">
        <span class="detail-field-label">Type</span>
        <span class="detail-field-value">${lane.type}</span>
      </div>
      <div class="detail-field">
        <span class="detail-field-label">Scope</span>
        <span class="detail-field-value">${escHtml(lane.scope)}</span>
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">N\u00E4chster Schritt</div>
      <div class="detail-field">
        <input class="detail-field-value editable"
               value="${escAttr(lane.next)}"
               onchange="window.app.updateLaneNext(${lane.number}, this.value)"
               placeholder="N\u00E4chster Schritt...">
      </div>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Blocker (${lane.blockers.length})</div>
      ${lane.blockers.map((b, i) => `
        <div class="detail-field" style="flex-direction:row;align-items:center;gap:8px">
          <span class="detail-field-value" style="flex:1;color:var(--mode-blocked)">${escHtml(b.description)}</span>
          <button class="btn-icon" onclick="window.app.removeBlocker(${lane.number}, ${i})" title="Blocker entfernen">\u2715</button>
        </div>
      `).join('')}
      <button class="btn" onclick="window.app.promptAddBlocker(${lane.number})">+ Blocker</button>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Horizon</div>
      <span class="detail-field-value">${lane.horizon ? `${lane.horizon.label} (${lane.horizon.date})` : 'Kein ext. Deadline'}</span>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">Dependencies</div>
      ${lane.deps.length ? lane.deps.map(d => `
        <div class="detail-field-value" style="font-size:var(--font-size-xs);font-family:var(--font-mono)">
          L${d.from} \u2014${d.type}\u2192 L${d.to} (${d.status})
        </div>
      `).join('') : '<span class="detail-field-value" style="color:var(--text-muted)">Keine</span>'}
    </div>

    ${lane.decisions.length ? `
    <div class="detail-section">
      <div class="detail-section-title">Decisions</div>
      ${lane.decisions.map(d => `
        <div class="detail-field-value" style="font-size:var(--font-size-xs);font-family:var(--font-mono);margin-bottom:4px">${escHtml(d)}</div>
      `).join('')}
    </div>
    ` : ''}

    <div class="detail-section">
      <div class="detail-section-title">Updates (${lane.updates.length})</div>
      <ul class="update-list">
        ${[...lane.updates].reverse().slice(0, 10).map(u => `
          <li class="update-item">
            <span class="update-date">${formatDate(u.date)}</span>
            <span class="update-text">${escHtml(u.text)}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-lg)">
      <button class="btn" onclick="window.app.generateTask(${lane.number})">Task formulieren</button>
      <button class="btn" onclick="window.app.promptHandoff(${lane.number})">Handoff</button>
      ${lane.mode !== 'DONE' ? `<button class="btn" onclick="window.app.archiveLane(${lane.number})">Archivieren</button>` : ''}
    </div>
  `;
}

// ===== OUTPUT PANEL (P7: Workflow Hint) =====

export function renderOutputPanel() {
  const panel = document.getElementById('output-panel');
  const output = getOutput();

  if (!output.content) {
    panel.classList.remove('visible');
    return;
  }

  panel.classList.add('visible');

  const typeLabel = {
    task: 'TASK INSTRUCTION',
    handoff: 'HANDOFF',
    query: 'QUERY',
    export: 'EXPORT',
    info: 'INFO'
  }[output.type] || 'OUTPUT';

  const showWorkflow = ['task', 'handoff', 'query'].includes(output.type);

  const workflowHtml = showWorkflow ? `
    <div class="workflow-hint">
      <span class="workflow-step done">
        <span class="workflow-step-label">Dashboard</span>
      </span>
      <span class="workflow-arrow">\u2192</span>
      <span class="workflow-step active">
        <span class="workflow-step-label">Kopieren</span>
      </span>
      <span class="workflow-arrow">\u2192</span>
      <span class="workflow-step">
        <span class="workflow-step-label">Terminal${output.target ? ' (L' + output.target + ')' : ''}</span>
      </span>
      <span class="workflow-arrow">\u2192</span>
      <span class="workflow-step">
        <span class="workflow-step-label">Agent arbeitet</span>
      </span>
      <span class="workflow-arrow">\u2192</span>
      <span class="workflow-step">
        <span class="workflow-step-label">/update</span>
      </span>
    </div>
  ` : '';

  panel.innerHTML = `
    <div class="output-header">
      <span class="output-title">${typeLabel}${output.target ? ' \u2192 L' + output.target : ''}</span>
      <div style="display:flex;gap:var(--space-sm)">
        <button class="btn btn-primary" onclick="window.app.copyOutput()">Copy</button>
        <button class="btn-icon" onclick="window.app.closeOutput()" title="Schlie\u00DFen">\u2715</button>
      </div>
    </div>
    ${workflowHtml}
    <div class="output-content">${escHtml(output.content)}</div>
  `;
}

// ===== HELPERS =====

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function formatDate(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
