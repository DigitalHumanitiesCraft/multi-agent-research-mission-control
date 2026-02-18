// Forschungsleitstelle — Main Entry Point

import { loadState, loadDemoState, clearState, selectLane, deselectLane, updateLane, addLane, addUpdate, addBlocker, removeBlocker, archiveLane, setOutput, getOutput, getLane, subscribe, importState, MODES, LANE_TYPES } from './state.js';
import { renderDashboard, renderSidePanel, renderOutputPanel, toggleDoneSection as _toggleDoneSection, toggleSynth as _toggleSynth } from './render.js';
import { initCommandBar, openCommandBar, closeCommandBar, isCommandBarOpen, executeCommandResult } from './commands.js';
import { copyToClipboard, showToast } from './clipboard.js';
import { generateTaskInstruction, generateHandoffBlock, generateQueryBlock, generateExportMarkdown, parseImportMarkdown } from './import-export.js';

// ===== GLOBAL API (for onclick handlers in rendered HTML) =====

window.app = {
  selectLane(number) {
    selectLane(number);
  },

  deselectLane() {
    deselectLane();
  },

  updateLaneMode(number, mode) {
    updateLane(number, { mode });
  },

  updateLaneNext(number, next) {
    updateLane(number, { next });
  },

  removeBlocker(number, index) {
    removeBlocker(number, index);
  },

  promptAddBlocker(number) {
    const desc = prompt('Blocker-Beschreibung:');
    if (desc && desc.trim()) {
      addBlocker(number, desc.trim());
    }
  },

  archiveLane(number) {
    if (confirm(`Lane ${number} archivieren?`)) {
      archiveLane(number);
    }
  },

  generateTask(number) {
    const lane = getLane(number);
    if (!lane) return;
    const text = generateTaskInstruction(lane);
    setOutput('task', number, text);
  },

  promptHandoff(fromNumber) {
    const toNumber = prompt('Handoff an Lane (Nummer):');
    if (!toNumber) return;
    const fromLane = getLane(fromNumber);
    const toLane = getLane(parseInt(toNumber));
    if (!fromLane || !toLane) {
      showToast('Lane nicht gefunden');
      return;
    }
    const text = generateHandoffBlock(fromLane, toLane);
    setOutput('handoff', parseInt(toNumber), text);
  },

  copyOutput() {
    const output = getOutput();
    if (output.content) {
      copyToClipboard(output.content);
      // P7: Update workflow hint steps after copy
      const steps = document.querySelectorAll('.workflow-step');
      if (steps.length >= 3) {
        steps[1].classList.remove('active');
        steps[1].classList.add('done');
        steps[2].classList.add('active');
      }
    }
  },

  // P4: Quick-copy task instruction from lane card
  quickCopyTask(number) {
    const lane = getLane(number);
    if (!lane) return;
    const text = generateTaskInstruction(lane);
    copyToClipboard(text);
    showToast(`Task-Instruction L${number} kopiert`);
  },

  // P2: Toggle done section visibility
  toggleDoneSection() {
    _toggleDoneSection();
    renderDashboard();
  },

  // P3: Toggle synthesis expansion
  toggleSynth() {
    _toggleSynth();
    renderDashboard();
  },

  closeOutput() {
    setOutput(null, null, '');
  },

  async loadDemo() {
    const ok = await loadDemoState();
    if (ok) {
      showToast('Demo-Daten geladen');
    } else {
      showToast('Demo-Daten konnten nicht geladen werden');
    }
  },

  clearState() {
    clearState();
    showToast('Alle Daten gelöscht');
  },

  showAddLaneDialog() {
    const dialog = document.getElementById('add-lane-dialog');
    if (dialog) {
      dialog.classList.add('visible');
      const nameInput = dialog.querySelector('#new-lane-name');
      if (nameInput) nameInput.focus();
    }
  },

  closeAddLaneDialog() {
    const dialog = document.getElementById('add-lane-dialog');
    if (dialog) dialog.classList.remove('visible');
  },

  submitAddLane() {
    const name = document.getElementById('new-lane-name')?.value?.trim();
    const scope = document.getElementById('new-lane-scope')?.value?.trim();
    const type = document.getElementById('new-lane-type')?.value || 'project';

    if (!name) {
      showToast('Name ist erforderlich');
      return;
    }

    addLane({ name, scope: scope || '', type });
    window.app.closeAddLaneDialog();
    showToast(`Lane "${name}" erstellt`);

    // Reset form
    document.getElementById('new-lane-name').value = '';
    document.getElementById('new-lane-scope').value = '';
    document.getElementById('new-lane-type').value = 'project';
  },

  executeCommandResult(index) {
    executeCommandResult(index);
  },

  handleExport() {
    const markdown = generateExportMarkdown();
    setOutput('export', null, markdown);
  },

  openCommandBar() {
    openCommandBar();
  },

  handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.txt,.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const text = await file.text();

      if (file.name.endsWith('.json')) {
        try {
          const data = JSON.parse(text);
          importState(data);
          showToast('JSON-State importiert');
        } catch {
          showToast('Ungültiges JSON');
        }
      } else {
        const parsed = parseImportMarkdown(text);
        if (parsed.lanes.length > 0) {
          importState(parsed);
          showToast(`${parsed.lanes.length} Lanes importiert`);
        } else {
          showToast('Keine Lanes im Markdown gefunden');
        }
      }
    };
    input.click();
  }
};

// ===== KEYBOARD SHORTCUTS =====

document.addEventListener('keydown', (e) => {
  // Ctrl+K — Open command bar
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    if (isCommandBarOpen()) {
      closeCommandBar();
    } else {
      openCommandBar();
    }
    return;
  }

  // Escape — Close panels
  if (e.key === 'Escape') {
    if (isCommandBarOpen()) {
      // Command bar handles its own Escape
      return;
    }
    const addDialog = document.getElementById('add-lane-dialog');
    if (addDialog?.classList.contains('visible')) {
      window.app.closeAddLaneDialog();
      return;
    }
    deselectLane();
    return;
  }

  // Ctrl+E — Export
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    window.app.handleExport();
    return;
  }

  // Ctrl+Shift+C — Copy last output
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
    e.preventDefault();
    window.app.copyOutput();
    return;
  }
});

// ===== INITIALIZATION =====

function init() {
  // Load state from localStorage or start empty
  const hasState = loadState();

  // Set up command bar
  initCommandBar();

  // Subscribe to state changes → re-render
  subscribe(() => {
    renderDashboard();
  });

  // Initial render
  renderDashboard();

  if (!hasState) {
    showToast('Willkommen! Lade das Beispiel-Szenario oder importiere einen State.');
  }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
