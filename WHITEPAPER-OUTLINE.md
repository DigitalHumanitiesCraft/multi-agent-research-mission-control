# Die Forschungsleitstelle — Human-as-Dispatcher Context Engineering für parallele AI-Forschungsprojekte

## Whitepaper-Gliederung v1.0

---

## 1. Abstract / Executive Summary

- **Kernthese**: Komplexe Forschungsprojekte übersteigen das Context Window eines einzelnen AI-Agents. Vollautonome Multi-Agent-Systeme scheitern an Koordination, Qualitätskontrolle und fehlender Forschungslogik. Die Forschungsleitstelle löst dies durch ein "Human-as-Dispatcher"-Pattern, bei dem ein menschlicher Operator als Koordinationsschicht zwischen isolierten, spezialisierten AI-Agents agiert.
- **Zielgruppe**: AI/Dev-Community, Prompt Engineers, Forscher die AI-Tools produktiv nutzen
- **Methode**: Context Engineering via strukturiertes Systemprotokoll (CLAUDE.md), keine Code-Infrastruktur nötig

---

## 2. Das Problem: Warum ein einzelner AI-Agent nicht reicht

### 2.1 Das Context-Window-Problem
- Endliche Kontextfenster (128k–200k Tokens) als harte Grenze für Wissensarbeit
- Context Degradation: Qualität sinkt mit zunehmender Kontextlänge (Lost-in-the-Middle-Effekt)
- Reale Forschungsprojekte erfordern simultanes Wissen über Codebasis, Literatur, Datenstrukturen, Projektstand, Abhängigkeiten, Deadlines

### 2.2 Naive Parallelisierung ist keine Lösung
- Mehrere Agents ohne Koordination = Duplikation, Inkonsistenz, divergente Entscheidungen
- Kein Agent sieht den Gesamtzustand ("Blindflug-Problem")
- Fehlende Synthese: Überlappende Erkenntnisse werden nicht erkannt

### 2.3 Vollautonome Multi-Agent-Systeme und ihre Grenzen
- AutoGPT, BabyAGI (2023): Fragil, Loop-anfällig, nicht zuverlässig für Forschungsarbeit
- AI-Agents können schlecht einschätzen, wann sie fragen statt entscheiden sollten
- Die "letzte Meile" der Entscheidungsfindung bleibt beim Menschen

---

## 3. Theoretischer Rahmen

### 3.1 Context Engineering
- Definition: Systematische Gestaltung des gesamten Informationsflusses zum LLM — über den einzelnen Prompt hinaus
- Abgrenzung: Prompt Engineering optimiert Eingaben; Context Engineering architektoniert den Informationsraum
- CLAUDE.md als "Betriebssystem-Prompt": Identität, Protokolle, Templates, Fehlerbehandlung

### 3.2 Multi-Agent-Systeme (MAS)
- Klassische MAS-Theorie: Autonome Agents mit partieller Weltsicht (Wooldridge, Jennings)
- Zentrale vs. dezentrale Koordination: Blackboard-Systeme, Mediator-Pattern
- Die Forschungsleitstelle als Mediator mit menschlicher Urteilskraft

### 3.3 Human-in-the-Loop → Human-as-Dispatcher
- Klassisches HITL: Mensch als Qualitätskontrolle am Ende einer Pipeline
- Erweiterung: Mensch ist aktiver Router, Übersetzer und Gedächtnis
- Drei Rollen: (1) Dispatcher, (2) Translator, (3) Memory

### 3.4 Dispatch-Pattern aus verteilten Systemen
- Kubernetes-Parallele: Operator als "Human Scheduler", Lanes als Pods, Modes als Pod-States
- Wichtiger Unterschied: AI-Agents haben keinen geteilten Zustand — der Mensch IST der geteilte Zustand

---

## 4. Die Methode: Forschungsleitstelle v0.4

### 4.1 Architektur im Überblick
- Drei Schichten: Operator → Forschungsleitstelle (Koordinations-Agent) → Lane-Agents
- Star-Topologie: Kommunikation ausschließlich über den Operator

### 4.2 Das Lane-Modell
- Lane als Abstraktionseinheit: Properties (Number, Name, Scope, Mode, Next, Horizon, Blockers, Deps, Type)
- Zwei Typen: `project` (produziert Output) und `infra` (Read-Only-Orakel)
- Modes als Zustandsmaschine: IDLE → PLANNING → WORKING → REVIEW → DONE (+ BLOCKED)

### 4.3 Die sieben Kernfunktionen
1. Status Tracking
2. Task Formulation
3. Dependency Detection
4. Prioritization
5. Synthesis
6. Stagnation Detection
7. Quality Control

### 4.4 Operator Query Phase (OQP)
- Drei Schritte: Assumptions identifizieren → Fragen stellen → Instruktionen formulieren
- Vier Assumption-Kategorien: Goal, External State, Preference, Data
- Verhindert "halluzinierte Entscheidungen"

### 4.5 Task Instruction Template
- Struktur: Context → Schritte → Constraints → Ask Clause
- Jede Instruktion Copy-Paste-fähig ins Terminal

### 4.6 Handoff & Query Protocol
- Handoff: Ergebnis-Transfer zwischen Lanes
- Query: Wissensabfrage an Infra-Lanes

### 4.7 Session Persistence
- `/export` mit drei Sektionen: Lane States, Active Synthesis, Open Questions
- System speichert eigenen Zustand in einem Format, das es später parsen kann

---

## 5. Vergleich mit existierenden Ansätzen

| Dimension | Forschungsleitstelle | CrewAI | MetaGPT | AutoGen | LangGraph | Devin | ChatGPT Projects |
|-----------|---------------------|--------|---------|---------|-----------|-------|------------------|
| Koordination | Human-dispatched | Autonom/hierarchisch | Autonom (Rollen) | Conversation-based | Graph-basiert | Vollautonom | Single-Agent |
| Infrastruktur | Zero (nur .md) | Python | Python | Python | Python | Cloud-Sandbox | SaaS |
| Multi-Projekt | ✓ (Lanes) | Begrenzt | ✗ | Begrenzt | ✗ | ✗ | ✗ |
| Synthesis | ✓ (Kernfunktion) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| OQP / Assumptions | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Session Persistence | Strukturiert | Framework-abhängig | ✗ | ✗ | State-Machine | ✗ | Projekt-Memory |

---

## 6. Ein konkretes Beispiel: Die Forschungsleitstelle in Aktion

- Szenario: Forscher koordiniert 4 Lanes + 1 Infra-Lane
- Durchlauf: Initialisierung → OQP → Task Formulation → Parallele Arbeit → Query → Handoff → Synthesis
- Gegenüberstellung: Was ohne die Methode passiert wäre

---

## 7. Design-Entscheidungen und Trade-offs

- Warum Human-as-Dispatcher (nicht vollautonom): Forschung erfordert Urteile unter Ambiguität
- Warum Zero Infrastructure: Niedrigste Einstiegshürde, portabel, Framework-unabhängig
- Warum Star-Topologie: Vollständige Sichtbarkeit, einfach zu debuggen
- Warum strukturierte Templates: Reduziert Ambiguität, ermöglicht maschinelles Parsen

---

## 8. UI-Konzept: Das Forschungsleitstelle Web-Dashboard

> Basiert auf dem UI-Design von Lane 2. Siehe UI-CONCEPT.md für das vollständige Konzept.

### 8.1 Architekturprinzip: Layer-Modell
- **Layer 0**: CLAUDE.md (immer, Zero Infrastructure)
- **Layer 1**: Web-Dashboard (optional, Enhanced Experience)
- Die Methode funktioniert ohne UI. Die UI macht sie komfortabler.

### 8.2 Dashboard-First, Keyboard-First
- Gesamtübersicht immer sichtbar (Persistent Overview + Transient Detail)
- Command Bar (`Ctrl+K`) mit allen `/commands`
- Lane-Karten mit 4-Zeilen-Format, Mode-Farbkodierung
- Dependency-Gruppen statt flacher Listen

### 8.3 Interaktionsmodell
- Copy-to-Clipboard als First-Class-Feature
- Progressive Disclosure: Kompakte Karte → Side Panel → Fullscreen Detail
- Drei Integrationsstufen: Copy-Paste → Log-Watching → MCP

### 8.4 Tech-Stack
- Next.js 15 + React 19 + shadcn/ui + Tailwind CSS v4
- Zustand für State Management
- @xyflow/react für Dependency Graph
- MVP: Kein Backend, alles clientseitig

---

## 9. Roadmap: Von v0.4 zu v0.5

> Basiert auf der Analyse von Lane 4. Siehe V05-DESIGN.md für den vollständigen Feature-Katalog.

### 9.1 Identifizierte Schwachstellen (6 Kategorien)
1. Skalierung (Status Board bei 10+ Lanes)
2. Context-Verlust (Entscheidungshistorie, Operator-Antworten)
3. Operator-Bottleneck (Copy-Paste-Overhead, Query-Relay-Latenz)
4. Fehlende Automatisierung (keine Templates, keine Metriken)
5. Protokoll-Lücken (kein Merge/Split/Pause, kein Partial Handoff)
6. Evaluation-Gap (keine Erfolgskriterien)

### 9.2 v0.5 Features (Priorisiert)

**P0 — Kritisch:**
- Decision Log (Entscheidungshistorie pro Lane)
- Operator Answer Cache (beantwortete Fragen speichern)
- Batch-Update (`/update-batch` für mehrere Lanes gleichzeitig)
- Lane-Briefing (`/brief N` für Terminal-Neustarts)

**P1 — Wichtig:**
- Lane-Cluster und Status-Filter (Skalierung)
- Auto-Suggest nach Updates
- Formale Dependency-Graph-Notation mit Zykluserkennung
- Lane-Lifecycle (`/merge`, `/split`, `/pause`, `/resume`)
- Context-Budget und Eskalationspfade

**P2 — Nice-to-have:**
- Auto-Handoff-Trigger, Task-Templates, Konflikt-Protokoll
- Metriken-Dashboard, Retrospektive, Partial Handoff, Multi-Repo-Awareness

### 9.3 Drei-Stufen-Evolutionsmodell

| Stufe | Protokoll | UI | Paradigma |
|-------|-----------|----|-----------|
| 1 (v0.4) | Manueller `/update` | Copy-Paste | Human-as-Dispatcher |
| 2 (v0.5) | Batch-Update + Auto-Suggest | Log-File-Watching | Semi-autonome Koordination |
| 3 (v0.6+) | Auto-Handoff-Trigger | MCP-Integration | Programmable Orchestration |

---

## 10. Limitationen und offene Fragen

- **Skalierungsgrenzen**: Operator-Cognitive-Load steigt linear mit Lane-Anzahl
- **Reproduzierbarkeit**: Ergebnisse hängen von Operator-Qualität ab
- **Evaluation**: Derzeit keine quantitative Evaluation
- **Modell-Abhängigkeit**: Getestet mit Claude, Verhalten mit GPT/Gemini nicht systematisch evaluiert

---

## 11. Verwandte Arbeiten

- Wu et al. (2023): AutoGen
- Hong et al. (2023): MetaGPT
- Li et al. (2023): CAMEL
- Park et al. (2023): Generative Agents
- Liu et al. (2023): Lost in the Middle
- Dispatch-Pattern-Literatur (Gamma et al., Mediator Pattern)

---

## 12. Fazit

Drei Kernbeiträge:
1. **Human-as-Dispatcher Pattern**: Neue Rollendefinition des Menschen — nicht Fallback, sondern aktiver Koordinator
2. **Zero-Infrastructure Context Engineering**: Vollständiges Koordinationssystem als einzelnes Markdown-File
3. **Structured Synthesis**: Explizite Lane-übergreifende Mustererkennung als Kernfunktion

---

## Anhang

- A. Vollständige CLAUDE.md v0.4
- B. Glossar
- C. Quick-Start-Anleitung ("In 5 Minuten zur ersten Forschungsleitstelle")

---

*Geschätzter Umfang: 6.000–8.000 Wörter (Whitepaper) / 3.000–4.000 Wörter (Blog-Post, Kap. 3+7+11 kürzen)*
