# Forschungsleitstelle Web-Dashboard — UI-Konzept v1.0

---

## 1. Architekturprinzip

### Layer-Modell
- **Layer 0**: CLAUDE.md (immer, Zero Infrastructure) — Die Methode funktioniert ohne UI
- **Layer 1**: Web-Dashboard (optional) — Macht die Methode komfortabler

Die App unterstützt die Methode, sie ersetzt sie nicht.

### Navigationsmodell
Das Dashboard ist IMMER sichtbar. Alle anderen Views sind Overlays, Side Panels oder Modals. Keine klassische Seitennavigation. Der Operator muss den Gesamtzustand immer im Blick behalten — wie bei einem Leitstand.

**Design-Pattern**: "Persistent Overview + Transient Detail" (vgl. ISO 11064, NASA Mission Control, Linear)

---

## 2. View-Hierarchie

```
Forschungsleitstelle App
│
├── [1] DASHBOARD (Hauptansicht / Status Board)
│     ├── Lane-Karten (kompakte 4-Zeilen-Darstellung)
│     ├── Parallel-/Sequenz-Gruppen
│     ├── Synthesis-Banner
│     ├── Blocker-Leiste (Sticky Footer)
│     └── Command Bar (global, Ctrl+K)
│
├── [2] LANE DETAIL (Side Panel, 400px rechts)
│     ├── Vollständiger Lane-Zustand
│     ├── Mode-Verlauf
│     ├── Dependencies (ein/ausgehend)
│     ├── Synthesis-Verbindungen
│     ├── Stagnation-Indikator
│     └── Update-Verlauf (chronologisch)
│
├── [3] TASK FORMULATION (Modal)
│     ├── Operator Query Phase (Assumptions → Fragen → Antworten)
│     ├── Task Instruction Editor (Template-basiert)
│     ├── Live-Vorschau
│     └── Copy-to-Clipboard
│
├── [4] DEPENDENCY GRAPH (Fullscreen Overlay, Ctrl+D)
│     ├── Interaktiver DAG
│     ├── Lane-Nodes mit Mode-Farbe
│     ├── Typisierte Kanten (output, query, handoff)
│     └── Blocker-Overlay (pulsierende rote Kanten)
│
├── [5] SYNTHESIS VIEW (Side Panel)
│     ├── Kategorisierte Cross-Lane Patterns
│     ├── Timeline
│     └── Verknüpfte Lanes pro Insight
│
└── [6] SESSION MANAGEMENT (Modal)
      ├── Export (3-Sektionen-Markdown)
      ├── Import (Drag-and-Drop oder Paste)
      ├── Session-Snapshots (auto alle 15min)
      └── Archiv
```

---

## 3. Dashboard-Layout (Hauptansicht)

```
+============================================================================+
│  FORSCHUNGSLEITSTELLE v0.4          [5 active │ 1 blocked │ 2 done]    [⚙] │
│  ┌────────────────────────────┐                                            │
│  │ > Command Bar (Ctrl+K)    │     [Export] [Import] [Session: "2026-02-18"]│
│  └────────────────────────────┘                                            │
+============================================================================+
│                                                                            │
│  PARALLEL  L1, L3 (unabhängig)                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─── L1 VetMedAI ──── WORKING ──┐  ┌─── L3 ZBZ-Eval ──────────┐  │  │
│  │  │ Implementiert API-Endpunkte    │  │ PLANNING                  │  │  │
│  │  │ → Unit Tests für /diagnose     │  │ Analysiert Datensatz      │  │  │
│  │  │ ⏸ keine Blocker               │  │ → Schema-Mapping          │  │  │
│  │  │ ⏰ 2026-03-01 MVP Demo        │  │ ⏸ ZBZ-Rückmeldung        │  │  │
│  │  └────────────────────────────────┘  │ ⏰ 2026-03-15 Report     │  │  │
│  │                                      └───────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  SEQUENZ  L2 → L4                                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  ┌─── L2 UI-Design ── WORKING ──┐        ┌─── L4 Frontend ──────┐  │  │
│  │  │ Dashboard-Konzept             │  ───→  │ BLOCKED              │  │  │
│  │  │ → Wireframes fertigstellen    │        │ Wartet auf L2        │  │  │
│  │  │ ⏸ none                       │        │ → [blocked]          │  │  │
│  │  │ ⏰ kein ext. Deadline         │        │ ⏸ L2-Output          │  │  │
│  │  └───────────────────────────────┘        └──────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─── L5 Obsidian-Vault ──── INFRA ──┐                                    │
│  │ Forschungsnotizen, Literatur       │                                    │
│  │ Kein Task. Antwortet auf Queries.  │                                    │
│  └────────────────────────────────────┘                                    │
│                                                                            │
│  ┌──────────── SYNTH ────────────────────────────────────────────────────┐ │
│  │ L1↔L3: Gleiches Embedding-Modell — Eval-Ergebnisse übertragbar      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                            │
│  ┌──────────── EXT-BLOCKER ──────────────────────────────────────────────┐ │
│  │ L3: ZBZ-Rückmeldung (3d 🔴) │ L4: L2-Output (1d)                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
+============================================================================+
```

---

## 4. Lane-Karte: Detailstruktur

```
┌─── L[N] [Name] ──────────────────── [MODE-BADGE] ───┐
│  [Einzeiliger State-Summary]                         │
│  → [Nächster konkreter Schritt]                      │
│  ⏸ [Blocker oder "keine Blocker"]                    │
│  ⏰ [Deadline/Datum oder "kein ext. Deadline"]        │
│                                                      │
│  [Dep-Icons]   [Stagnation-Timer]   [Actions ...]    │
└──────────────────────────────────────────────────────┘
```

Farbige Border-Left (3px) + Mode-Badge in Mode-Farbe.

---

## 5. Farbkodierung

| Mode | Farbe | Hex | Bedeutung |
|------|-------|-----|-----------|
| IDLE | Grau | `#6B7280` | Inaktiv |
| PLANNING | Blau | `#3B82F6` | Konzeptionell |
| WORKING | Grün | `#10B981` | Aktive Arbeit |
| REVIEW | Amber | `#F59E0B` | Erfordert Aufmerksamkeit |
| BLOCKED | Rot | `#EF4444` | Problem |
| DONE | Ged. Grün | `#6EE7B7` @ 50% | Abgeschlossen |
| INFRA | Violett | `#8B5CF6` | Sonderkategorie |

---

## 6. Lane-Gruppierung

Lanes werden NICHT flach gelistet, sondern in Dependency-Gruppen:

1. **Parallel-Gruppen**: Nebeneinander, gestrichelte Klammer, Label "PARALLEL"
2. **Sequenz-Gruppen**: Nebeneinander mit Pfeil, Label "SEQUENZ (L[N] → L[M])"
3. **Infra-Lanes**: Separater Bereich unten, violetter Background-Tint
4. **Archivierte Lanes**: Nur unter Session Management sichtbar

---

## 7. Interaktionsmodell

### 7.1 Command Bar (Ctrl+K)

Zentrales Interaktionselement. Alle `/commands` aus der Spezifikation verfügbar.

```
┌────────────────────────────────────────────────────────┐
│ > /status                                        Ctrl+K │
│ ──────────────────────────────────────────────────────── │
│ /status          Alle Lanes, kompakt                    │
│ /status 1        Lane 1 Detail                          │
│ /update 1        Status aktualisieren                   │
│ /next            Nächste Priorität                      │
│ /handoff 1→2     Ergebnis-Transfer                      │
│ /query 5 for 1   Query an Infra-Lane                    │
│ /export          State exportieren                      │
│ ...                                                     │
└─────────────────────────────────────────────────────────┘
```

Fuzzy-Search über Commands UND Lane-Namen. Autocomplete für Lane-Nummern.

### 7.2 Lane-Karten-Interaktionen

| Aktion | Geste | Ergebnis |
|--------|-------|----------|
| Details öffnen | Klick auf Karte | Side Panel rechts |
| Mode ändern | Klick auf Badge | Dropdown |
| Next-Step editieren | Doppelklick → Zeile | Inline-Editing |
| Blocker editieren | Doppelklick ⏸ Zeile | Inline-Editing |
| Task formulieren | Rechtsklick → "Task" | Task Formulation Modal |
| Handoff starten | Drag Karte auf andere | Handoff-Dialog |
| Query starten | Rechtsklick auf Infra | Query-Dialog |

### 7.3 Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Ctrl+K` | Command Bar |
| `Ctrl+[1-9]` | Lane N Detail |
| `Ctrl+E` | Export |
| `Ctrl+N` | `/next` |
| `Ctrl+D` | Dependency Graph |
| `Escape` | Panel/Modal schließen |
| `Tab` / `Shift+Tab` | Zwischen Lane-Karten |

---

## 8. Task Formulation View

```
┌═══════════════════════════════════════════════════════════┐
│ TASK FORMULATION                           [X] Schließen  │
│                                                           │
│ Ziel-Lane: [L2 UI-Design ▼]                              │
│ Typ: (●) Task  (○) Query  (○) Handoff                    │
│                                                           │
│ ─── OPERATOR QUERY PHASE ───                              │
│ Identifizierte Assumptions:                               │
│                                                           │
│ Goal:                                                     │
│ [x] 1. Was soll priorisiert werden?                       │
│     → Antwort: [Desktop-Dashboard zuerst       ]          │
│                                                           │
│ Preference:                                               │
│ [ ] 2. Tech-Stack-Präferenz?                              │
│     → Antwort: [                                ]          │
│                                                           │
│ [✓ Alle beantwortet → Task generieren]                    │
│ [□ Keine Rückfragen — mit [ASSUMED] markieren]            │
│                                                           │
│ ─── PREVIEW ───                                           │
│ ┌───────────────────────────────────────────────────────┐ │
│ │ → Claude 2 (UI-Design):                              │ │
│ │                                                       │ │
│ │ [Context] ...                                         │ │
│ │ 1. ...                                                │ │
│ │ 2. ...                                                │ │
│ │ [Constraints] ...                                     │ │
│ │ [Ask Clause] ...                                      │ │
│ └───────────────────────────────────────────────────────┘ │
│                                                           │
│ [📋 Copy to Clipboard]    [💾 Als Update speichern]       │
└═══════════════════════════════════════════════════════════┘
```

---

## 9. Dependency Graph View

Fullscreen Overlay (Ctrl+D). Interaktiver DAG mit @xyflow/react.

```
┌═══════════════════════════════════════════════════════════┐
│ DEPENDENCY GRAPH                           [X] Schließen  │
│                                                           │
│          ┌───────┐                                        │
│          │  L5   │ INFRA (violett)                        │
│          │Obsid. │                                        │
│          └───┬───┘                                        │
│           query│                                          │
│              ▼                                            │
│     ┌────────┴────────┐                                   │
│     ▼                 ▼                                   │
│  ┌──────┐          ┌──────┐                               │
│  │  L1  │ WORKING  │  L3  │ PLANNING                     │
│  │VetMed│ (grün)   │ZBZ-E.│ (blau)                       │
│  └──┬───┘          └──────┘                               │
│     │ output                                              │
│     ▼                                                     │
│  ┌──────┐                                                 │
│  │  L4  │ BLOCKED (rot, pulsierend)                       │
│  └──────┘                                                 │
│     ▲ output                                              │
│  ┌──────┐                                                 │
│  │  L2  │ WORKING (grün)                                  │
│  └──────┘                                                 │
│                                                           │
│ LEGENDE: ──→ output  ···→ query  ─x→ blocked             │
└═══════════════════════════════════════════════════════════┘
```

- Hover auf Node: Kompakte 4-Zeilen-Info
- Klick auf Node: Lane Detail Panel
- Klick auf Kante: Dependency-Details
- Blocked-Kanten pulsieren rot

---

## 10. Real-time Features

### Stagnation Timer (pro Lane-Karte)
- < 4h: Kein Indikator
- 4h–8h: 🕐 gelb
- 8h–24h: 🕐 orange + Warnung
- \> 24h: 🕐 rot + auto Blocker-Eintrag

### Deadline-Countdown
```
⏰ 2026-03-01 MVP Demo (11d)
[████████████████████████░░░░░░░░]
```
Grün > 7d │ Gelb 3–7d │ Rot < 3d

### Notifications
| Event | Typ | Verhalten |
|-------|-----|-----------|
| Mode-Wechsel | Toast | Auto-dismiss 5s |
| Neuer Blocker | Toast + Badge | Persistent |
| Stagnation | Pulsierender Indikator | Persistent |
| Handoff bereit | Toast + Badge | Persistent |
| Deadline < 3d | Banner | Persistent |

---

## 11. Tech-Stack

| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| Framework | Next.js 15 (App Router) | Server Components, Static Export möglich |
| UI | shadcn/ui + Tailwind CSS v4 | Volle Kontrolle, passende Primitives |
| State | Zustand | Minimal, persistent, devtools |
| Graph | @xyflow/react | Bester React-Graph-Editor |
| DnD | @dnd-kit/core | Lightweight, accessible |
| Command Bar | cmdk (via shadcn) | Keyboard-first UX |
| Animations | framer-motion | Status-Transitions |
| Persistence | IndexedDB (via idb) | Session-Snapshots |
| Backend (MVP) | Keiner | Alles clientseitig |
| Backend (später) | Bun + ws | WebSocket Bridge zu Terminals |

### Drei Integrationsstufen

| Stufe | Mechanismus | Beschreibung |
|-------|------------|--------------|
| 1 (MVP) | Copy-Paste | Task Instructions → Clipboard → Terminal |
| 2 | Log-File-Watching | Bridge Server watched Terminal-Logs, auto-Updates |
| 3 | MCP-Integration | Bidirektionale Kommunikation Dashboard ↔ Claude Code |

---

## 12. State-Modell (TypeScript)

```typescript
interface ForschungsleitstelleState {
  lanes: Lane[];
  synthesis: SynthesisEntry[];
  openQuestions: OperatorQuestion[];
  session: { id: string; created: Date; lastSnapshot: Date };
}

interface Lane {
  number: number;
  name: string;
  scope: string;
  mode: 'IDLE' | 'PLANNING' | 'WORKING' | 'REVIEW' | 'BLOCKED' | 'DONE';
  type: 'project' | 'infra';
  next: string;
  horizon: { date: Date; label: string } | null;
  blockers: Blocker[];
  deps: Dependency[];
  updates: UpdateEntry[];
  stagnation: { lastUpdateAt: Date; flagged: boolean };
  archived: boolean;
}

interface Dependency {
  from: number;
  to: number;
  type: 'output' | 'query' | 'handoff';
  status: 'pending' | 'fulfilled';
  description: string;
}

interface SynthesisEntry {
  id: string;
  category: 'methodology' | 'empirical' | 'components' | 'framework';
  lanes: number[];
  insight: string;
  created: Date;
}
```

---

## 13. Design-Prinzipien

1. **Dashboard-First**: Gesamtübersicht immer sichtbar. Details sind Overlays.
2. **Keyboard-First**: Jede Aktion über Command Bar oder Shortcuts erreichbar.
3. **Copy-Paste ist ein Feature**: Solange Lanes in Terminals laufen, ist Clipboard der primäre Output.
4. **Information Density > Ästhetik**: Operator braucht Dichte, nicht Whitespace.
5. **Farbe für Status**: Mode-Farbkodierung ist die einzige Farbsemantik.
6. **Progressive Disclosure**: Kompakte Karte → Side Panel → Fullscreen Detail.
7. **Spec-Treue**: 1:1-Abbildung der v0.4-Spezifikation. Die App unterstützt, ersetzt nicht.

---

## 14. Offene Design-Entscheidungen

1. Dark Mode als Default? (Empfehlung: Ja, mit Toggle)
2. Multi-Window für Dual-Monitor-Setups?
3. Mobile-Responsive? (Empfehlung: Nein, Desktop-only)
4. Multi-Operator-Support? (Erfordert Backend)
5. LLM-Integration in der App? (Für automatische Synthesis-Generierung)
