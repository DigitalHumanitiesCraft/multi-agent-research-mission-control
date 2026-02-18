// Forschungsleitstelle — Import/Export

import { getLanes, getSynthesis, exportState } from './state.js';

// ===== EXPORT =====

export function generateExportMarkdown() {
  const lanes = getLanes();
  const synthesis = getSynthesis();
  const now = new Date().toISOString().split('T')[0];

  let md = `# Forschungsleitstelle State Export\n`;
  md += `Datum: ${now}\n\n`;

  // Section 1 — Lane States
  md += `## Section 1 — Lane States\n\n`;

  for (const lane of lanes) {
    md += `### L${lane.number} ${lane.name}\n`;
    md += `- Mode: ${lane.mode}\n`;
    md += `- Type: ${lane.type}\n`;
    md += `- Scope: ${lane.scope}\n`;
    md += `- Next: ${lane.next}\n`;
    md += `- Blockers: ${lane.blockers.length ? lane.blockers.map(b => b.description).join('; ') : 'none'}\n`;
    md += `- Deps: ${lane.deps.length ? lane.deps.map(d => `L${d.from}→L${d.to} (${d.type}, ${d.status})`).join('; ') : 'none'}\n`;
    md += `- Horizon: ${lane.horizon ? `${lane.horizon.date} ${lane.horizon.label}` : 'none'}\n`;
    if (lane.cluster) md += `- Cluster: ${lane.cluster}\n`;
    if (lane.decisions.length) {
      md += `- Decisions:\n`;
      for (const d of lane.decisions) {
        md += `  - ${d}\n`;
      }
    }
    md += '\n';
  }

  // Section 2 — Active Synthesis
  md += `## Section 2 — Active Synthesis\n\n`;

  if (synthesis.length === 0) {
    md += `Keine aktiven Synthesis-Einträge.\n\n`;
  } else {
    for (const s of synthesis) {
      md += `- [${s.category}] ${s.insight} (Lanes: ${s.lanes.map(n => 'L' + n).join(', ')})\n`;
    }
    md += '\n';
  }

  // Section 3 — Open Operator Questions
  md += `## Section 3 — Open Operator Questions\n\n`;
  md += `Keine offenen Fragen.\n`;

  return md;
}

// ===== IMPORT =====

export function parseImportMarkdown(markdown) {
  const state = {
    lanes: [],
    synthesis: [],
    session: { id: Date.now().toString(36), lastSnapshot: new Date().toISOString() }
  };

  const lines = markdown.split('\n');
  let currentLane = null;
  let section = 0;
  let inDecisions = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Section detection
    if (trimmed.startsWith('## Section 1')) { section = 1; continue; }
    if (trimmed.startsWith('## Section 2')) { section = 2; continue; }
    if (trimmed.startsWith('## Section 3')) { section = 3; continue; }

    if (section === 1) {
      // Lane header
      const laneMatch = trimmed.match(/^### L(\d+)\s+(.+)$/);
      if (laneMatch) {
        if (currentLane) state.lanes.push(currentLane);
        currentLane = {
          number: parseInt(laneMatch[1]),
          name: laneMatch[2],
          scope: '',
          mode: 'IDLE',
          type: 'project',
          next: '',
          horizon: null,
          blockers: [],
          deps: [],
          updates: [{ date: new Date().toISOString(), text: 'Importiert' }],
          decisions: [],
          cluster: null,
          archived: false
        };
        inDecisions = false;
        continue;
      }

      if (!currentLane) continue;

      if (inDecisions) {
        const decMatch = trimmed.match(/^-\s+(.+)$/);
        if (decMatch) {
          currentLane.decisions.push(decMatch[1]);
          continue;
        } else {
          inDecisions = false;
        }
      }

      // Lane fields
      const fieldMatch = trimmed.match(/^-\s+(\w+):\s*(.*)$/);
      if (fieldMatch) {
        const [, key, value] = fieldMatch;
        switch (key) {
          case 'Mode': currentLane.mode = value; break;
          case 'Type': currentLane.type = value; break;
          case 'Scope': currentLane.scope = value; break;
          case 'Next': currentLane.next = value; break;
          case 'Cluster': currentLane.cluster = value || null; break;
          case 'Blockers':
            if (value && value !== 'none') {
              currentLane.blockers = value.split(';').map(b => ({
                description: b.trim(),
                since: new Date().toISOString()
              }));
            }
            break;
          case 'Deps':
            if (value && value !== 'none') {
              const depParts = value.split(';');
              for (const part of depParts) {
                const depMatch = part.trim().match(/L(\d+)→L(\d+)\s*\((\w+),\s*(\w+)\)/);
                if (depMatch) {
                  currentLane.deps.push({
                    from: parseInt(depMatch[1]),
                    to: parseInt(depMatch[2]),
                    type: depMatch[3],
                    status: depMatch[4]
                  });
                }
              }
            }
            break;
          case 'Horizon':
            if (value && value !== 'none') {
              const parts = value.split(' ');
              currentLane.horizon = { date: parts[0], label: parts.slice(1).join(' ') };
            }
            break;
          case 'Decisions':
            inDecisions = true;
            break;
        }
      }
    }

    if (section === 2) {
      const synthMatch = trimmed.match(/^-\s+\[(\w+)\]\s+(.+?)\s+\(Lanes:\s*(.+?)\)$/);
      if (synthMatch) {
        state.synthesis.push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 4),
          category: synthMatch[1],
          insight: synthMatch[2],
          lanes: synthMatch[3].split(',').map(s => parseInt(s.trim().replace('L', ''))),
          created: new Date().toISOString()
        });
      }
    }
  }

  if (currentLane) state.lanes.push(currentLane);

  return state;
}

// ===== TASK / HANDOFF / QUERY TEMPLATES =====

export function generateTaskInstruction(lane) {
  return `→ Claude ${lane.number} (${lane.name}):

[Aktueller Stand: ${lane.scope}. Mode: ${lane.mode}.]

1. ${lane.next || '[Nächster Schritt hier einfügen]'}
2. [Weiterer Schritt]
3. [Weiterer Schritt]

Constraints:
- [Was nicht getan werden soll]

Ask Clause:
- Bei Unklarheiten zu [Thema] den Operator fragen.`;
}

export function generateHandoffBlock(fromLane, toLane) {
  return `→ Claude ${toLane.number} (${toLane.name}):

HANDOFF from Lane ${fromLane.number} (${fromLane.name}):
- Produced: [Beschreibung des Outputs]
- Relevant because: [Warum Lane ${toLane.number} das braucht]
- Use it to: [Konkrete Integrations-Instruktion]`;
}

export function generateQueryBlock(infraLane, forLane) {
  return `? Claude ${infraLane.number} (${infraLane.name}):

QUERY from Lane ${forLane.number} (${forLane.name}):
- Needs: [Was gebraucht wird]
- Context: [Warum Lane ${forLane.number} das braucht]
- Format: [Gewünschtes Antwort-Format]`;
}
