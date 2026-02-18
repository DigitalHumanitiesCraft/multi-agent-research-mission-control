# Vergleichsrecherche: Multi-Agent-Frameworks und Context Engineering (Stand: Februar 2026)

---

## Kritische Erkenntnis: Positionierungs-Update erforderlich

**Claude Code hat seit Februar 2026 "Agent Teams"** — ein experimentelles Feature für Multi-Agent-Koordination mit Lead Agent, Teammates, Shared Task List und Inter-Agent-Messaging. Das verändert die Positionierung der Forschungsleitstelle fundamental.

**Neue Positionierung**: Die Forschungsleitstelle ist nicht mehr primär "Multi-Agent-Koordination statt Single-Agent", sondern:
- **Forschungskoordination** (vs. Code-Koordination) — Agent Teams koordinieren Code-Tasks, die Forschungsleitstelle koordiniert Forschungsprojekte
- **Cross-Projekt-Synthese** — Agent Teams sehen ein Repo, die Forschungsleitstelle sieht das Gesamtbild über Repos hinweg
- **Session-übergreifendes Gedächtnis** — Agent Teams verlieren Kontext bei Neustart, die Forschungsleitstelle hat `/export`/`/brief`
- **Operator Query Phase** — kein anderes System hat explizites Assumption Management
- **Mögliche Integration**: Forschungsleitstelle als Methoden-Layer ÜBER Agent Teams

---

## 1. Multi-Agent-Frameworks

### 1.1 CrewAI

**Stand**: >100.000 zertifizierte Entwickler, eines der am weitesten verbreiteten Frameworks.

**Architektur**: Crews (Agent-Teams mit Autonomie) + Flows (event-driven Orchestrierung). Rollenbasiert: Manager, Worker, Researcher Agents.

**Koordinationstypen**: Sequential, Hierarchical, Consensus-based.

**Performance**: 2-3x schneller als vergleichbare Frameworks (Benchmarks).

**Enterprise**: AMP Suite mit Tracing, Observability, Control Plane.

**Limitationen**: Python-Infrastruktur erforderlich. HITL ist optional/nachgelagert. Keine Zero-Infrastructure-Option. Multi-Projekt-Fähigkeit begrenzt.

**vs. Forschungsleitstelle**: CrewAI optimiert Agent-Zusammenarbeit innerhalb einer Laufzeit. Forschungsleitstelle koordiniert über isolierte Agents und Projekte hinweg. CrewAI hat keinen Operator Query Phase-Äquivalent.

Quellen:
- https://www.crewai.com/
- https://latenode.com/blog/ai-frameworks-technical-infrastructure/crewai-framework/crewai-framework-2025-complete-review-of-the-open-source-multi-agent-ai-platform
- https://docs.crewai.com/en/concepts/agents

### 1.2 Microsoft AutoGen → Agent Framework

**Stand**: AutoGen v0.4 (Jan 2025) war ein kompletter Redesign. Jetzt fusioniert mit Semantic Kernel zum **Microsoft Agent Framework** (GA Q1 2026).

**Architektur**: Actor Model für Multi-Agent-Orchestrierung. Asynchrone, event-driven Architektur. Pluggable Components (Agents, Tools, Memory, Models).

**Neu**: Python + .NET Support. Enterprise-grade. Production-ready Ziel für Q1 2026.

**Limitationen**: Schwerer Setup als CrewAI. Stark an Microsoft-Ökosystem gebunden. Conversation-Pattern-basiert, nicht forschungsorientiert.

**vs. Forschungsleitstelle**: AutoGen ist ein Software-Framework für Agenten-Konversationen. Forschungsleitstelle ist ein Prompt-basiertes Koordinationsprotokoll. AutoGen erfordert Code-Infrastruktur, Forschungsleitstelle nur ein Markdown-File.

Quellen:
- https://www.microsoft.com/en-us/research/articles/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/
- https://learn.microsoft.com/en-us/agent-framework/overview/agent-framework-overview
- https://visualstudiomagazine.com/articles/2025/10/01/semantic-kernel-autogen--open-source-microsoft-agent-framework.aspx

### 1.3 LangGraph (LangChain)

**Stand**: Schnellstes Framework mit niedrigster Latenz (Benchmarks).

**Architektur**: DAG-basierte Orchestrierung. Nodes = Agents/Functions/Decision Points. Edges = Datenfluss. Zentraler StateGraph für persistenten Zustand.

**Key Features**: Conditional Edges (Routing basierend auf Agent-Output), Parallel Execution, Looping, persistente States über Workflows hinweg. Time-Travel-Debugging in LangGraph Studio v2 (Mai 2025).

**MCP-Integration**: LangGraph + MCP zusammen für "dynamic, language-native, recoverable multi-agent workflows".

**Limitationen**: Python-Infrastruktur. Hoher Lernaufwand (Graph-Konzepte). Nicht für Multi-Projekt-Koordination gedacht.

**vs. Forschungsleitstelle**: LangGraph ist am nächsten bei State Management. Aber: Code-Infrastruktur statt Prompt-Only, kein Multi-Projekt, keine Synthesis-Funktion, kein Operator Query Phase.

Quellen:
- https://www.langchain.com/langgraph
- https://latenode.com/blog/ai-frameworks-technical-infrastructure/langgraph-multi-agent-orchestration/langgraph-multi-agent-orchestration-complete-framework-guide-architecture-analysis-2025

### 1.4 Google Agent Development Kit (ADK)

**Stand**: Open-Source seit Google Cloud NEXT 2025. Python, TypeScript, Go Support.

**8 Design Patterns**: Sequential Pipeline, Parallel Execution, LLM-Driven Delegation, Coordinator Pattern, Human-in-the-Loop, und weitere.

**Agent-Typen**: LLM Agents (Modell-gesteuert) + Workflow Agents (SequentialAgent, ParallelAgent, LoopAgent).

**Coordinator Pattern**: AutoFlow-Mechanismus delegiert basierend auf Agent-Beschreibungen.

**Limitationen**: Optimiert für Gemini/Google-Ökosystem. Code-Infrastruktur erforderlich.

**vs. Forschungsleitstelle**: ADK hat das formellste Pattern-Katalog aller Frameworks. Aber: Code-first, nicht Prompt-first. Coordinator Pattern ist der nächste Verwandte, aber automatisiert statt human-dispatched.

Quellen:
- https://google.github.io/adk-docs/
- https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/
- https://cloud.google.com/blog/topics/developers-practitioners/building-collaborative-ai-a-developers-guide-to-multi-agent-systems-with-adk

### 1.5 OpenAI: Swarm → Agents SDK + Codex

**Stand**: Swarm war experimentell (Okt 2024), jetzt ersetzt durch **OpenAI Agents SDK** (production-ready). Codex Desktop-App seit Feb 2026 (macOS).

**Codex**: "Command Center for Agents" — multiple Coding-Tasks parallel, bis 30 Min autonom, >1 Mio Entwickler/Monat.

**Agents SDK**: Produktion-reif, Migration von Swarm empfohlen.

**Limitationen**: Codex nur macOS (Windows Ende 2026). Fokus auf Coding, nicht auf Forschungskoordination. Keine Cross-Projekt-Synthese.

Quellen:
- https://openai.com/index/new-tools-for-building-agents/
- https://openai.com/index/unrolling-the-codex-agent-loop/
- https://github.com/openai/swarm

### 1.6 Claude Code Agent Teams (NEU — Feb 2026)

**Stand**: Experimentell, disabled by default (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`).

**Architektur**:
- **Team Lead**: Koordiniert, spawnt Teammates, synthetisiert Ergebnisse
- **Teammates**: Separate Claude Code Instanzen, eigenes Context Window
- **Shared Task List**: Gemeinsame Aufgabenliste, Tasks mit Dependencies
- **Mailbox**: Direkte Inter-Agent-Kommunikation

**Key-Unterschied zu Subagents**: Subagents berichten nur zurück. Teammates kommunizieren untereinander direkt.

**Display Modes**: In-Process (ein Terminal) oder Split-Panes (tmux/iTerm2).

**Features**: Delegate Mode (Lead nur Koordination), Plan Approval (Review vor Implementierung), Task Dependencies, Hooks (TeammateIdle, TaskCompleted), Quality Gates.

**Limitationen** (Stand Feb 2026):
- Kein Session Resumption für In-Process Teammates
- Task Status kann verzögern
- Ein Team pro Session
- Keine verschachtelten Teams
- Lead ist fix (kein Leadership-Transfer)
- Split Panes nicht in VS Code Terminal, Windows Terminal, Ghostty

**vs. Forschungsleitstelle**:
| Dimension | Agent Teams | Forschungsleitstelle |
|-----------|-------------|---------------------|
| Scope | Ein Codebase/Repo | Multiple Projekte/Repos |
| Koordination | AI Lead Agent | Menschlicher Operator |
| Kommunikation | Automatisch (Mailbox) | Manuell (Copy-Paste) |
| Synthese | Lead synthetisiert Code-Ergebnisse | Forschungs-Synthese über Projekte |
| Session Persistence | Begrenzt (kein Resume) | `/export` + `/brief` |
| Assumption Management | Keines | Operator Query Phase |
| Abstraktion | Tasks + Code | Lanes + Modes + Horizons |
| Ideal für | Paralleles Coding im selben Repo | Parallele Forschungsprojekte |

**Integration-Opportunity**: Forschungsleitstelle als Meta-Layer über Agent Teams. Jede Lane könnte intern ein Agent Team nutzen, koordiniert durch die Forschungsleitstelle auf Projektebene.

Quellen:
- https://code.claude.com/docs/en/agent-teams
- https://www.sitepoint.com/anthropic-claude-code-agent-teams/
- https://addyosmani.com/blog/claude-code-agent-teams/

---

## 2. Context Engineering

### 2.1 Definition (Industriekonsens 2025/2026)

> "Context Engineering ist die Disziplin, dynamische Systeme zu entwerfen, die die richtige Information und die richtigen Tools, im richtigen Format, zum richtigen Zeitpunkt bereitstellen, damit ein LLM alles hat was es braucht um eine Aufgabe zu erfüllen."

**Gartner (Juli 2025)**: "Context engineering is in, and prompt engineering is out. AI leaders must prioritize context over prompts."

**Abgrenzung**: Prompt Engineering = "Wie frage ich?" Context Engineering = "Was stelle ich bereit?" (Daten, Knowledge, Tools, Memory, Struktur).

Quellen:
- https://www.flowhunt.io/blog/context-engineering/
- https://codeconductor.ai/blog/context-engineering/
- https://www.charterglobal.com/context-engineering-ai-skill-2025/

### 2.2 Anthropics Ansatz

**Kernprinzip**: "Die kleinste mögliche Menge hochwertiger Token finden, die die Wahrscheinlichkeit des gewünschten Ergebnisses maximieren."

**Techniken**:
1. **System Prompts**: Klare, strukturierte Abschnitte (XML-Tags, Markdown)
2. **Tools**: Minimal Viable Set, keine Überschneidungen
3. **Just-in-Time Context**: Lightweight Identifiers + dynamisches Laden bei Bedarf
4. **Multi-Agent-Architektur als Context-Engineering-Strategie**: Aufgaben auf Sub-Agenten mit sauberen Kontextfenstern verteilen

**Für Long-Running Agents**: Compaction, Structured Note-Taking, Multi-Agent-Architekturen.

**Einordnung der Forschungsleitstelle**: Die CLAUDE.md IST Context Engineering in Reinform — sie ist ein System Prompt, der eine vollständige Verhaltensarchitektur definiert (Identität, Protokolle, Templates, Fehlerbehandlung, State Management).

Quellen:
- https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- https://www.anthropic.com/research/building-effective-agents

### 2.3 Akademische Arbeit

**"Agentic Context Engineering" (arXiv:2510.04618)**: Konzept von "Evolving Contexts for Self-Improving Language Models" — Kontexte die sich selbst verbessern. Relevant für die `/export`-Mechanik der Forschungsleitstelle (System speichert eigenen Zustand in parsefreundlichem Format).

Quelle: https://arxiv.org/abs/2510.04618

---

## 3. Human-in-the-Loop Patterns

### 3.1 Aktueller Stand

**Google ADK** definiert HITL als eines von 8 Design Patterns:
- Agent pausiert via `interrupt()`
- Mensch reviewed und approved/rejected
- Agent setzt fort bei Approval

**Trend (2026)**: "As AI agents gain precision, HITL shifts from routine oversight to strategic roles" — Mensch fokussiert auf Judgment, Innovation, Problem-Solving.

**Gartner-Prognose**: 1.445% Anstieg der Multi-Agent-System-Anfragen Q1 2024 → Q2 2025.

### 3.2 Dispatcher/Coordinator Pattern

**Aktueller Industriestandard**: Ein zentraler Agent analysiert User-Intent und routet an Spezialisten. Google nennt das den "Coordinator/Dispatcher Pattern".

**Wichtiger Unterschied zur Forschungsleitstelle**: In allen Frameworks ist der Dispatcher ein AI-Agent. In der Forschungsleitstelle ist der Dispatcher ein Mensch, unterstützt durch einen AI-Agent (die Forschungsleitstelle selbst). Das ist ein fundamentaler architektonischer Unterschied.

### 3.3 "Human-as-Dispatcher" — Existiert der Begriff?

Nach umfassender Recherche: **Der Begriff "Human-as-Dispatcher" existiert nicht als etabliertes Pattern** in der aktuellen Literatur. Die Forschungsleitstelle kann diesen Begriff als eigenen Beitrag beanspruchen.

Quellen:
- https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/
- https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo
- https://builtin.com/articles/human-in-the-loop-evolution
- https://www.infoq.com/news/2026/01/multi-agent-design-patterns/

---

## 4. AI Coding Agents

### 4.1 Devin (Cognition)

**Stärke**: Exzellent bei klar definierten Tasks (4-8h Junior-Engineer-Arbeit). Unendlich parallelisierbar. DeepWiki für Codebase-Dokumentation (bis 5M Zeilen COBOL). Fast Mode (2x Speed).

**Schwäche**: Nur 3/20 Tasks erfolgreich abgeschlossen (Tests). Senior bei Codebase-Verständnis, Junior bei Execution. Kann keine Mid-Task Requirement Changes. Keine Stakeholder-Interaktion.

**vs. Forschungsleitstelle**: Devin ist ein autonomer Coding-Agent. Forschungsleitstelle koordiniert mehrere solcher Agents. Komplementär, nicht konkurrierend.

Quellen:
- https://cognition.ai/blog/devin-annual-performance-review-2025
- https://trickle.so/blog/devin-ai-review

### 4.2 OpenAI Codex (Desktop App)

"Command Center for Agents" — Parallel Coding Tasks, bis 30 Min autonom, >1 Mio Nutzer/Monat. macOS only (Windows Ende 2026).

### 4.3 Claude Code

Agent Teams (s.o. unter 1.6). Plus: Subagents, Agent Skills, Git Worktrees für parallele Sessions. Claude Agent SDK für Custom Agents.

### 4.4 Cursor / Windsurf / GitHub Copilot

Single-Context-Agent-IDEs. Mächtig für Individual-Workflows, aber keine Multi-Projekt-Koordination.

---

## 5. Aktualisierte Vergleichstabelle

| Dimension | Forschungsleitstelle | CrewAI | AutoGen/MS Agent FW | LangGraph | Google ADK | Claude Code Agent Teams | Codex |
|-----------|---------------------|--------|---------------------|-----------|------------|------------------------|-------|
| **Koordination** | Human-dispatched | Autonom/hierarchisch | Actor Model | Graph-basiert | Pattern-basiert | AI Lead Agent | Parallel Tasks |
| **Infrastruktur** | Zero (nur .md) | Python | Python/.NET | Python | Python/TS/Go | CLI (built-in) | Cloud Sandbox |
| **Multi-Projekt** | ✓ (Lanes) | Begrenzt | Begrenzt | ✗ | ✗ | ✗ (ein Repo) | ✗ |
| **Cross-Projekt-Synthese** | ✓ (Kernfunktion) | ✗ | ✗ | ✗ | ✗ | Begrenzt (Lead) | ✗ |
| **Operator Query Phase** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Session Persistence** | `/export` + `/brief` | Framework-abhängig | Framework-abhängig | State Machine | Framework-abhängig | ✗ (kein Resume) | Begrenzt |
| **HITL** | Kern-Architektur | Optional | Optional | Node-basiert | Pattern | Optional (Delegate) | Supervision |
| **Einstiegshürde** | Niedrigst (1 File) | Mittel | Hoch | Hoch | Mittel | Niedrig (CLI) | Niedrig (App) |
| **Zielgruppe** | Forscher, Multi-Projekt | Entwickler-Teams | Enterprise | ML Engineers | Google-Ökosystem | Entwickler | Entwickler |
| **Abstraktion** | Lanes, Modes, Horizons | Roles, Tasks, Processes | Actors, Messages | Nodes, Edges, State | Agents, Patterns | Lead, Teammates, Tasks | Tasks |

---

## 6. Positionierungs-Empfehlung für Whitepaper

### Differenzierungsmerkmale (bestätigt durch Recherche):

1. **Human-as-Dispatcher ist ein neuer Begriff** — nicht in der Literatur etabliert. Eigener Beitrag.
2. **Zero Infrastructure bleibt einzigartig** — kein anderes Framework arbeitet rein Prompt-basiert.
3. **Operator Query Phase / Assumption Management** — in keinem Framework vorhanden.
4. **Cross-Projekt-Synthese** — nicht einmal Agent Teams können über Repo-Grenzen hinweg synthetisieren.
5. **Forschungsorientierung** — alle Vergleichssysteme sind Code/Task-orientiert, nicht Forschungs-orientiert.

### Neue Positionierung (post Agent Teams):

> "Die Forschungsleitstelle operiert auf einer höheren Abstraktionsebene als Agent Teams, CrewAI oder LangGraph. Während diese Frameworks einzelne Tasks innerhalb eines Projekts koordinieren, koordiniert die Forschungsleitstelle ganze Projekte — einschließlich solcher, die intern Agent Teams nutzen. Sie ist der Methodenlayer, nicht der Technologielayer."

### Integration-These für Whitepaper:

Layer 0: CLAUDE.md (Methode)
Layer 1: Web-Dashboard (UI, optional)
Layer 2: Agent Teams / Subagents (Execution innerhalb einer Lane, optional)
Layer 3: Individual Tools (Cursor, Devin, Codex — als Lane-Agents)
