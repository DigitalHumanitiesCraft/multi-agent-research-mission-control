# Forschungsleitstelle v0.5 — Design Document

---

## 1. Schwachstellen-Analyse v0.4

### 1.1 Skalierung
- Status Board bei 10+ Lanes: 40+ Zeilen, sprengt Aufmerksamkeitsspanne
- Keine Gruppierung, Filterung oder Kollabierung von IDLE/DONE Lanes
- DEPS-Zeile als Freitext: Unleserlich bei Kreuzabhängigkeiten, keine Zykluserkennung
- `/export` wächst linear, kann Context Window dominieren

### 1.2 Context-Verlust
- Lane-Historie geht verloren: `/export` speichert nur aktuellen Zustand, nicht Entscheidungshistorie
- Synthesis-Verflachung: Nur prioritätsrelevante Insights werden exportiert
- Operator-Antworten aus Query Phase nicht persistent
- Lane-Agents nach Terminal-Neustart: Kein kumulativer Kontext, nur Next-Step

### 1.3 Operator-Bottleneck
- Copy-Paste-Overhead: 10+ Vorgänge pro Runde bei 5 Lanes
- Query-Relay: 3 Hops (Forschungsleitstelle → Operator → Infra → Operator → Forschungsleitstelle)
- Synthesis-Last: Operator muss alle Implikationen simultan bewerten
- Kein Batch-Update, kein Autopilot-Modus

### 1.4 Fehlende Automatisierung
- Keine Blocker-Eskalationspfade
- Keine Task-Templates für wiederkehrende Typen
- Kein automatisches Dependency-Tracking (Rückfluss ins Lane Model)
- Keine Fortschritts-Metriken

### 1.5 Protokoll-Lücken
- Kein Lane-Merge, Split, Fork
- Kein Rollback-Protokoll
- Keine Konflikterkennung/-auflösung bei widersprüchlichen Outputs
- Kein Partial Handoff (inkrementelle Übergaben)
- Kein PAUSED-Modus (Unterschied zu IDLE unklar)
- Keine Multi-Repository-Awareness (Branch-Konflikte)
- Kein Protokoll für Operator-Abwesenheit

### 1.6 Evaluation-Gap
- Keine definierten Erfolgskriterien
- Kein Vergleichsrahmen für Benchmarking
- Kein Retrospektive-Mechanismus

---

## 2. Feature-Katalog v0.5

### P0 — Kritisch

#### F03: Decision Log
- **Problem**: Entscheidungshistorie geht zwischen Sessions verloren
- **Lösung**: Kompaktes Decision Log pro Lane (max. 5 Einträge, FIFO)
- **Format**: `[Datum] Entscheidung: X. Begründung: Y. Alternative: Z.`
- **Spec-Änderung**: Neues Property `decisions` im Lane Model, Export Section 1 erweitert

#### F04: Operator Answer Cache
- **Problem**: Beantwortete Fragen aus Query Phase gehen verloren
- **Lösung**: Key-Value-Speicher für Operator-Antworten, automatische Prüfung bei neuer Query Phase
- **Spec-Änderung**: Neuer Abschnitt in OQP, Export Section 3 erweitert, neuer Befehl `/cache`

#### F05: Batch-Update
- **Problem**: Jeder Lane-Update ist ein separater Turn
- **Lösung**: `/update-batch` akzeptiert Multi-Lane-Updates atomar
- **Format**: `L1: fertig mit X. L2: blockiert bei Y. L3: PR merged.`
- **Spec-Änderung**: Neuer Befehl, konsolidierte Priorisierung nach Batch

#### F10: Lane-Briefing
- **Problem**: Lane-Agents nach Terminal-Neustart sind blind
- **Lösung**: `/brief N` generiert Copy-Paste-fertiges Kontext-Dokument
- **Inhalt**: Scope, bisherige Entscheidungen, aktueller Zustand, nächster Schritt, relevante Handoffs
- **Spec-Änderung**: Neuer Befehl, neues Template "Lane Briefing Format"

---

### P1 — Wichtig

#### F01: Lane-Cluster
- **Problem**: Status Board unübersichtlich bei 10+ Lanes
- **Lösung**: Benannte Cluster (z.B. `cluster: frontend`), kollabierbare Ansicht
- **Spec-Änderung**: Neues Property `cluster`, aggregierter Cluster-Status

#### F02: Status-Filter
- **Problem**: `/status` zeigt immer alles
- **Lösung**: `/status BLOCKED`, `/status WORKING`, `/status cluster:X`
- **Spec-Änderung**: Erweiterte Kommando-Syntax, IDLE/DONE default kollabiert

#### F06: Auto-Suggest nach Update
- **Problem**: Operator muss nach jedem Update explizit `/next` aufrufen
- **Lösung**: Automatische "Suggested Actions" nach Update (Handoff, Archivierung, Eskalation)
- **Spec-Änderung**: Neuer Abschnitt "Suggested Actions" in Update-Verarbeitung

#### F07: Formale Dependency-Graph-Notation
- **Problem**: Dependencies als Freitext, keine Zykluserkennung
- **Lösung**: Typisierte Kanten: `L1 --output--> L2`, `L1 --query--> L3`
- **Spec-Änderung**: `deps` von Freitext zu typisierten Kanten, Validierung, neues Display

#### F08: Lane-Lifecycle-Befehle
- **Problem**: Kein Merge, Split, Pause, Resume
- **Lösung**: `/merge N M`, `/split N`, `/pause N`, `/resume N`
- **Neuer Modus**: PAUSED (mit Kontext-Snapshot)
- **Spec-Änderung**: Neuer Modus, 4 neue Befehle, Protokollblöcke für Merge/Split

#### F09: Context-Budget
- **Problem**: Export wächst unkontrolliert
- **Lösung**: Richtwert ~200 Wörter pro Lane im Export, automatische Kompression
- **Regeln**: Älteste Entscheidungen → Einzeiler, aufgelöste Blocker entfernt
- **Spec-Änderung**: Neuer Abschnitt "Context Budget" mit Kompressionsregeln

#### F18: Eskalationspfade
- **Problem**: Stagnation Detection ohne definierten Folgeprozess
- **Lösung**: Dreistufig:
  - Stufe 1 (2 Updates ohne Fortschritt): Scope-Reduktion/alternativer Ansatz
  - Stufe 2 (4 Updates): Pause-Empfehlung oder Scope-Änderung
  - Stufe 3 (6 Updates): STAGNANT-Flag im Status Board
- **Spec-Änderung**: Erweiterung Stagnation Detection, optionaler STAGNANT-Tag

---

### P2 — Nice-to-have

#### F11: Automatische Handoff-Trigger
Bei DONE/REVIEW mit bestehender Output-Abhängigkeit → automatischer Handoff-Vorschlag.

#### F12: Task-Templates
Vordefinierte Templates: `test`, `refactor`, `review-prep`, `docs`. Aufruf: `/task N template:test "Modul X"`.

#### F13: Konflikt-Protokoll
Formale Erkennung widersprüchlicher Lane-Outputs. Neuer Befehl `/conflict`.

#### F14: Metriken-Dashboard
`/metrics`: Updates pro Lane, Blockierungsrate, Handoff-Häufigkeit, Operator-Interaktionen. Optionale Export Section 4.

#### F15: Retrospektive
`/retro`: Meilenstein-Auswertung. Was lief gut? Stagnation? Blocker-Erkennung? Synthesis-Nutzen?

#### F16: Partial Handoff
`HANDOFF (partial 3/5)` mit Fortschritts-Tracking bis Vollständigkeit.

#### F17: Multi-Repo-Awareness
Optionales Property `repo`. Warnung bei gleichzeitigem WORKING im selben Repo.

---

## 3. Neue Befehle (v0.5)

| Befehl | Beschreibung | Priorität |
|--------|-------------|-----------|
| `/update-batch` | Multi-Lane-Update atomar | P0 |
| `/brief N` | Lane-Briefing für Terminal-Neustart | P0 |
| `/cache` | Operator Answer Cache anzeigen/löschen | P0 |
| `/merge N M` | Zwei Lanes zusammenführen | P1 |
| `/split N` | Lane aufteilen | P1 |
| `/pause N` | Lane pausieren mit Kontext-Snapshot | P1 |
| `/resume N` | Pausierte Lane reaktivieren | P1 |
| `/status [FILTER]` | Gefilterte Statusanzeige | P1 |
| `/conflict` | Offene Konflikte anzeigen | P2 |
| `/metrics` | Quantitative Lane-Statistiken | P2 |
| `/retro` | Retrospektive nach Meilenstein | P2 |
| `/task N template:X` | Task aus Template generieren | P2 |

---

## 4. Neues Lane Model (v0.5)

```
| Property   | v0.4 | v0.5              | Änderung          |
|------------|------|-------------------|--------------------|
| Number     | ✓    | ✓                 | —                  |
| Name       | ✓    | ✓                 | —                  |
| Scope      | ✓    | ✓                 | —                  |
| Mode       | ✓    | ✓ + PAUSED        | Neuer Modus        |
| Next       | ✓    | ✓                 | —                  |
| Horizon    | ✓    | ✓                 | —                  |
| Blockers   | ✓    | ✓                 | —                  |
| Deps       | Freitext | Typisierte Kanten | Strukturänderung |
| Type       | ✓    | ✓                 | —                  |
| Cluster    | —    | Optional          | Neu (P1)           |
| Decisions  | —    | Liste, max 5      | Neu (P0)           |
| Repo       | —    | Optional          | Neu (P2)           |
| Metrics    | —    | Session-Zähler    | Neu (P2)           |
```

---

## 5. Changelog (v0.4 → v0.5)

- **Added Decision Log** — max. 5 aktive Entscheidungseinträge pro Lane, exportiert in Section 1
- **Added Operator Answer Cache** — beantwortete Fragen als Key-Value-Paare, geprüft bei erneuter Query Phase
- **Added Batch-Update** — `/update-batch` verarbeitet mehrere Lane-Updates atomar mit konsolidierter Priorisierung
- **Added Lane-Briefing** — `/brief N` generiert Copy-Paste-fertiges Kontext-Dokument für Terminal-Neustarts
- **Added Lane-Cluster** — optionale Gruppierung mit kollabierbarer Cluster-Ansicht im Status Board
- **Added Status-Filter** — `/status` akzeptiert Mode- und Cluster-Filter; IDLE/DONE standardmäßig kollabiert
- **Added Auto-Suggest** — nach jedem Update automatische Vorschläge für Handoffs, Archivierung, Eskalation
- **Added formale Dependency-Graph-Notation** — typisierte Kanten mit Zykluserkennung
- **Added Lane-Lifecycle** — `/merge N M`, `/split N`, `/pause N`, `/resume N` mit neuem Modus PAUSED
- **Added Context-Budget** — Richtwert ~200 Wörter pro Lane im Export, automatische Kompression
- **Added Eskalationspfade** — dreistufige Eskalation bei Stagnation
- **Added automatische Handoff-Trigger** — Vorschlag bei DONE/REVIEW mit bestehender Abhängigkeit
- **Added Task-Templates** — vordefinierte Strukturen für wiederkehrende Task-Typen
- **Added Konflikt-Protokoll** — formale Erkennung widersprüchlicher Outputs
- **Added Metriken-Dashboard** — `/metrics` mit quantitativen Lane-Statistiken
- **Added Retrospektive** — `/retro` für Meilenstein-Auswertungen
- **Added Partial Handoff** — inkrementelle Handoffs mit Fortschritts-Tracking
- **Added Multi-Repo-Awareness** — Branch-Konflikt-Warnungen bei gleichem Repository
- **Revised Lane Model** — neue Properties: `cluster`, `decisions`, `repo`, `metrics`
- **Revised Dependency-Notation** — Freitext → typisierte Kanten
- **Revised Kommandotabelle** — 12 neue Befehle

---

## 6. Drei-Stufen-Evolutionsmodell

| Stufe | Version | Protokoll | UI | Paradigma |
|-------|---------|-----------|-----|-----------|
| 1 | v0.4 | Manueller `/update` | Copy-Paste | Human-as-Dispatcher |
| 2 | v0.5 | Batch-Update + Auto-Suggest | Log-File-Watching | Semi-autonome Koordination |
| 3 | v0.6+ | Auto-Handoff-Trigger | MCP-Integration | Programmable Orchestration |

Grundprinzip bleibt über alle Stufen: Der Operator behält die Entscheidungshoheit. Automatisierung betrifft Routing und Mechanik, nicht Urteil und Priorisierung.
