# Multi-Agent Research Mission Control

**Institutional coordination architecture for parallel AI research agents — implemented as pure context engineering in a single Markdown file.**

> This repository is organized around one file: **[CLAUDE.md](CLAUDE.md)**. It is not configuration. It is the research artifact — a complete coordination protocol encoded as context engineering. Everything else documents, evolves, or visualizes it.

## The Problem

Complex research programs exceed the context window of any single AI agent. Fully autonomous multi-agent systems fail at coordination, quality control, and research judgment. Naive parallelization produces parallel garbage: agents that can't see each other make divergent decisions, duplicate work, and miss cross-project patterns.

The missing layer is not more automation. It is **institutional process design** — the kind of organizational architecture that real-world mission control centers, dispatch operations, and coordination units have refined for decades.

## The Approach

Multi-Agent Research Mission Control transfers institutional coordination patterns to AI agent teams. A human operator acts as the active control layer between isolated, specialized coding agents ("Lanes").

```
                    ┌─────────────────────┐
                    │   Mission Control    │
                    │   (Human Operator)   │
                    │                      │
                    │  · Situational       │
                    │    Awareness         │
                    │  · Dependency        │
                    │    Detection         │
                    │  · Cross-Lane        │
                    │    Synthesis         │
                    │  · Stagnation        │
                    │    Escalation        │
                    └──┬────┬────┬────┬────┘
                       │    │    │    │
              ┌────────┘    │    │    └────────┐
              ▼             ▼    ▼             ▼
         ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
         │ Lane 1  │ │ Lane 2  │ │ Lane 3  │ │ Lane 4  │
         │ Project │ │ Project │ │ Project │ │ Infra   │
         │         │ │         │ │         │ │ (Vault) │
         └─────────┘ └─────────┘ └─────────┘ └─────────┘
              ╳            ╳          ╳            ╳
         No agent sees any other agent.
         The overall picture exists only at Mission Control.
```

The entire method is specified as a `CLAUDE.md` file — a context engineering document that gives the coordination agent its structure, protocols, and memory. No code framework. No cloud infrastructure. No agent-to-agent communication.

## Why Not AutoGen / CrewAI / LangGraph?

| | Agent Frameworks | Mission Control |
|---|---|---|
| **Coordination model** | Agent-to-agent (fragile, loop-prone) | Human-as-Dispatcher (robust, judgment-capable) |
| **Complexity model** | Software architecture | Institutional process design |
| **Setup** | Python environment, API keys, configuration | One Markdown file |
| **Domain knowledge** | Must be programmed | The researcher brings it |
| **Error handling** | Retry logic, guardrails | Human judgment under ambiguity |
| **Vendor lock-in** | Framework-specific | Any LLM with system prompt capability |

The thesis: **As agent teams take on more complex tasks, they need correspondingly complex organizational structures — and these structures come from institutional knowledge, not from software patterns.**

Detailed comparison: [RESEARCH-COMPARISON.md](RESEARCH-COMPARISON.md)

## Core Functions

| # | Function | What it does |
|---|----------|-------------|
| 1 | **Status Tracking** | Maintains the state of every Lane (Mode, Next Step, Blocker, Horizon) |
| 2 | **Task Formulation** | Translates operator intent into self-contained, copy-paste-ready agent instructions |
| 3 | **Dependency Detection** | Flags when one Lane produces output another Lane needs |
| 4 | **Prioritization** | Ranks by deadline proximity, unblocking potential, executability, value/effort |
| 5 | **Synthesis** | Identifies cross-Lane patterns that no single agent can see |
| 6 | **Stagnation Detection** | Flags missing progress, recommends action |
| 7 | **Quality Control** | Catches duplicates, inconsistencies, conflicting instructions |

## Autonomy Level

Mission Control operates at **Level 4 (Approver)** of the autonomy framework (Wang et al., 2025):

> The agent acts autonomously; the human approves critical decisions.

This is a design decision, not a technical limitation.

## Specifications

| Version | Status | File | Key additions |
|---------|--------|------|--------------|
| v0.4 | Released | [CLAUDE.md](CLAUDE.md) | Operator Query Phase, Synthesis, Infra Lanes, Query Protocol |
| v0.5 | Released | [CLAUDE-v05.md](CLAUDE-v05.md) | Decision Log, Answer Cache, Batch Update, Lane Lifecycle, Typed Dependencies |

## Repository Structure

```
multi-agent-research-mission-control/
│
│  ★ The Research Artifact
├── CLAUDE.md                  ← v0.4 specification (the core)
├── CLAUDE-v05.md              ← v0.5 specification (evolution)
│
│  Documentation
├── README.md
├── SYSTEM-PROMPT-DESIGN.md    ← Why CLAUDE.md is designed the way it is
├── journal.md                 ← Research journal (chronological)
├── V05-DESIGN.md              ← Design rationale v0.4 → v0.5
│
│  Academic Output
├── WHITEPAPER.md              ← Full whitepaper (German)
├── WHITEPAPER-OUTLINE.md      ← Whitepaper outline
├── RESEARCH-COMPARISON.md     ← Framework comparison
│
│  Visualization Layer (optional)
├── UI-CONCEPT.md              ← Web dashboard concept
└── forschungsleitstelle-ui/   ← Dashboard prototype
    ├── index.html
    ├── css/
    ├── js/
    └── data/
        └── demo-state.json
```

## Quick Start

### Use the method (no UI)

1. Copy [CLAUDE.md](CLAUDE.md) as system prompt into a Claude chat
2. Describe your active projects (Lanes)
3. Mission Control tracks status, formulates instructions, detects dependencies

### Run the dashboard prototype

```bash
cd forschungsleitstelle-ui
python -m http.server 8000
# or: npx serve .
```

Open `http://localhost:8000`. The dashboard loads a demo scenario.

## Whitepaper

The full whitepaper (German) describes theory, architecture, and positioning:

**[WHITEPAPER.md](WHITEPAPER.md)** — *Die Forschungsleitstelle: Human-as-Dispatcher Context Engineering für parallele AI-Forschungsprojekte*

## License

TBD

## Author

Christopher Pollin — [DigitalHumanitiesCraft](https://github.com/DigitalHumanitiesCraft)
