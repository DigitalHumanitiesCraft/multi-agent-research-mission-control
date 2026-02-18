# Design

## The Core Artifact

This repository is organized around a single file: **CLAUDE.md**.

CLAUDE.md is not configuration. It is not documentation. It is a **complete institutional coordination architecture**, encoded as context engineering in plain Markdown. When loaded as a system prompt into an LLM, it transforms the model into a Mission Control instance that can track parallel research projects, formulate agent instructions, detect dependencies, synthesize cross-project patterns, and persist state across sessions.

The research question is: *How must a system prompt be structured so that an LLM can assume the role of an institutional coordination layer for multi-agent research — with the same rigor as a real-world dispatch center?*

CLAUDE.md is the answer. Everything else in this repository documents, evolves, visualizes, or positions that answer.

## Architecture

### The Human-as-Dispatcher Pattern

In all existing multi-agent frameworks (CrewAI, AutoGen, LangGraph, Google ADK, Claude Code Agent Teams), coordination is automated: an AI orchestrator routes tasks between AI workers. The Forschungsleitstelle inverts this. The human researcher is the dispatcher — supported by an AI coordination agent (the CLAUDE.md instance), but never replaced by one.

This is not a limitation. It is the thesis: **Research coordination under ambiguity requires human judgment. The system's job is to make that judgment scalable, not to replace it.**

```
Human Operator (Dispatcher)
    │
    ├── CLAUDE.md instance (Mission Control agent)
    │   Tracks state, formulates instructions, detects dependencies,
    │   synthesizes patterns, flags stagnation
    │
    ├── Lane 1: Project A (autonomous coding agent)
    ├── Lane 2: Project B (autonomous coding agent)
    ├── Lane 3: Project C (autonomous coding agent)
    └── Lane 4: Knowledge Base (infra lane, read-only oracle)

No lane sees any other lane.
The overall picture exists only at Mission Control.
```

### What CLAUDE.md Encodes

The specification defines seven core functions as an institutional process:

1. **Status Tracking** — State machine for each Lane (IDLE → PLANNING → WORKING → REVIEW → DONE, with BLOCKED and PAUSED)
2. **Task Formulation** — Translation of operator intent into self-contained, copy-paste-ready agent instructions, preceded by mandatory Operator Query Phase
3. **Dependency Detection** — Recognition of output dependencies, query dependencies, and overlapping scopes between Lanes
4. **Prioritization** — Ranking by deadline proximity, unblocking potential, executability, value/effort — with parallel groups for independent Lanes
5. **Synthesis** — Identification of cross-Lane patterns: shared methods, converging findings, reusable components, connecting frameworks
6. **Stagnation Detection** — Flagging of missing progress with escalation paths
7. **Quality Control** — Detection of duplicates, inconsistencies, and conflicting instructions

Plus three protocols (Task Instruction, Query, Handoff) and a session persistence mechanism (`/export` + `/brief`).

### The Layer Model

```
Layer 0: CLAUDE.md          ← The method. Always works. Zero infrastructure.
Layer 1: Web Dashboard      ← Optional visualization. Makes the method comfortable.
Layer 2: Agent Teams        ← Optional. Lanes can internally use sub-agent teams.
Layer 3: Individual Tools   ← Cursor, Devin, Codex — as Lane-level agents.
```

Layer 0 is the research contribution. Layers 1-3 are engineering convenience.

## Key Design Decisions

### Why Markdown, not code?

A system prompt is context engineering. Adding a code layer between the method and the LLM adds complexity without adding capability. The CLAUDE.md is directly executable — copy it into any LLM chat with sufficient context window, describe your projects, and the system runs.

Zero infrastructure means: no Python environment, no API keys, no deployment, no vendor lock-in. Any LLM with system prompt capability can be a Mission Control instance.

### Why isolated Lanes?

Agent isolation is not a workaround for missing inter-agent communication. It is the architecture. Each Lane has a clean context window, focused on one project. The synthesis function — recognizing patterns across Lanes — is explicitly a human function, supported by the Mission Control agent but not delegated to it.

This avoids the fundamental failure mode of autonomous multi-agent systems: cascading errors through shared state, goal drift through unsupervised agent-to-agent communication, and the inability to recognize when to stop and ask.

### Why Operator Query Phase?

Before formulating any task instruction, the system must identify assumptions it cannot derive from existing knowledge. This is unique among all surveyed frameworks — no other system has explicit assumption management.

The Query Phase prevents the most common coordination failure: the dispatcher sends an instruction based on an assumption the operator hasn't confirmed, the agent executes confidently, and the output is wrong in a way that's expensive to detect and fix.

### Why Level 4 Autonomy (Approver)?

Wang et al. (2025) define five autonomy levels. Level 4 means: the agent acts autonomously, the human approves critical decisions. This is a conscious design choice — not a ceiling imposed by technical limitations, but a floor chosen for research quality.

The system could automate more. It deliberately doesn't.

## Specification Evolution

| Version | Key Additions | Design Driver |
|---------|--------------|---------------|
| v0.3 | Basic Lane Model, Status Tracking | Proof of concept |
| v0.4 | Operator Query Phase, Synthesis, Infra Lanes, Query Protocol | Scaling from 2 to 5+ Lanes revealed coordination gaps |
| v0.5 | Decision Log, Answer Cache, Batch Update, Lane Lifecycle, Typed Dependencies, Escalation Paths | Context loss across sessions, operator bottleneck at 10+ Lanes |

The evolution follows a pattern: each version addresses failure modes discovered in practice, not features imagined in theory. See [V05-DESIGN.md](V05-DESIGN.md) for the full weakness analysis.

## Positioning

### What this is not

- Not an agent framework (no code to install)
- Not a project management tool (no Gantt charts, no sprints)
- Not an AI orchestrator (the human orchestrates)
- Not a chatbot (it's a coordination protocol with memory)

### Differentiation (confirmed by research)

1. **Human-as-Dispatcher** is a new term — not established in prior literature
2. **Zero Infrastructure** remains unique — no other framework is purely prompt-based
3. **Operator Query Phase / Assumption Management** — absent from all surveyed systems
4. **Cross-Project Synthesis** — not even Agent Teams can synthesize across repository boundaries
5. **Research orientation** — all comparison systems are code/task-oriented, not research-oriented

Full comparison: [RESEARCH-COMPARISON.md](RESEARCH-COMPARISON.md)

## Open Design Questions

- **MCP Integration (v0.6+)**: Could the Mission Control agent directly query Lane repositories via MCP, reducing copy-paste overhead?
- **Auto-Handoff Triggers**: When a Lane reaches DONE with an existing output dependency, should the system auto-generate the handoff block?
- **Formalized Knowledge Documents**: Could Lane knowledge documents follow a strict schema that the CLAUDE.md can parse, enabling richer dependency detection?
- **Vault as Single Source of Truth**: Could the Obsidian knowledge base serve as the authoritative state store, with the dashboard reading from it?
