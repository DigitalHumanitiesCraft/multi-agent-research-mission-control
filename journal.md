# Research Journal

Chronological record of decisions, milestones, and insights in the development of Multi-Agent Research Mission Control.

---

## 2026-02-18 — Project renamed to Multi-Agent Research Mission Control

The project name evolved from "Forschungsleitstelle" (German: research dispatch center) through several iterations. "Multi-Agent Research Mission Control" was chosen because it communicates all five core properties: multi-agent coordination, research domain, and institutional mission control as organizational pattern. The German term "Forschungsleitstelle" remains as the internal codename and whitepaper title.

The naming process revealed an important insight: "Dispatch" (the original English term) implies a one-way action — send and forget. The system does far more: it maintains situational awareness, detects dependencies, synthesizes cross-project patterns, and escalates stagnation. "Mission Control" captures all seven core functions, not just task formulation.

## 2026-02-18 — Obsidian vault knowledge architecture

Built an integrated knowledge architecture in the existing Obsidian vault. Migrated all 8 project documents (specifications, whitepaper, design docs, UI concept), created 14 literature notes from whitepaper sources, established a Forschungsleitstelle MOC as navigation hub, and wrote a new concept note for the Human-as-Dispatcher pattern. Connected the project to existing concept notes (Context Engineering, Agentic AI, Multi-Agent Research Workflow) via bidirectional links.

Design decision: flat-with-typed-links over deep folder hierarchies. Three new frontmatter types registered (specification, design-document, academic-writing). Lane-readable documents marked with `lane-readable: true` for future agent querying.

## 2026-02-17 — UI prototype: 7 UX improvements

After building the initial dashboard prototype, seven UX problems were identified and fixed in priority order: (P1) blocker visibility via persistent footer strip, (P2) lane card information density with 4-line format, (P3) output panel as resizable bottom drawer, (P4) keyboard-first interaction model, (P5) command autocomplete with fuzzy matching, (P6) mode color consistency across all views, (P7) empty state guidance with progressive disclosure.

Key insight: The dashboard follows "Persistent Overview + Transient Detail" — the status board is always visible, all detail views are overlays or side panels. This mirrors real mission control room design (ISO 11064).

## 2026-02-17 — Whitepaper draft completed

Full German whitepaper written: "Die Forschungsleitstelle — Human-as-Dispatcher Context Engineering für parallele AI-Forschungsprojekte." Covers the context window problem, naive parallelization failures, autonomous agent limitations, theoretical framework (context engineering + dispatch pattern), architecture, seven core functions, comparison with five frameworks, and roadmap.

Central argument: The bottleneck in AI-assisted research is not task execution — it is coordination across project boundaries. This coordination requires human judgment, but it needs a system that makes that judgment scalable.

## 2026-02-17 — v0.5 specification designed

Systematic weakness analysis of v0.4 revealed five problem areas: scaling (status board unreadable at 10+ Lanes), context loss (decision history lost between sessions), operator bottleneck (copy-paste overhead), missing automation (no escalation paths), and protocol gaps (no pause, merge, split). Designed 18 features across three priority tiers (P0-P2). Key additions: Decision Log, Operator Answer Cache, Batch Update, Lane Briefing, typed dependency graph, three-stage escalation.

The three-stage evolution model emerged: v0.4 (manual dispatch) → v0.5 (semi-autonomous coordination) → v0.6+ (programmable orchestration). Core principle across all stages: the operator retains decision authority. Automation targets routing and mechanics, not judgment and prioritization.

## 2026-02-17 — Framework comparison completed

Compared the Forschungsleitstelle against CrewAI, AutoGen/Microsoft Agent Framework, LangGraph, Google ADK, Claude Code Agent Teams, and OpenAI Codex. Critical finding: Claude Code introduced "Agent Teams" in February 2026, requiring a positioning update.

New positioning: The Forschungsleitstelle operates at a higher abstraction level than Agent Teams. While frameworks coordinate tasks within a project, Mission Control coordinates entire projects — including those that internally use Agent Teams. It is the method layer, not the technology layer.

Confirmed: "Human-as-Dispatcher" does not exist as an established pattern in prior literature. This is an original contribution.

## 2026-02-17 — v0.4 specification written

First formal specification of the coordination protocol. Defined the Lane Model (Number, Name, Scope, Mode, Next, Horizon, Blockers, Deps, Type), seven core functions, Operator Query Phase, Task Instruction Template, Query Protocol for infrastructure Lanes, Handoff Protocol, Status Display Format, Session Persistence via `/export`, and 11 commands.

The Operator Query Phase was the key v0.4 innovation: mandatory assumption identification before any task formulation. This prevents the most common coordination failure — acting on unconfirmed assumptions.

## 2026-02-17 — UI prototype built

Vanilla JavaScript dashboard with ES modules. No framework, no build step, no dependencies. Implements the full command set (`/status`, `/next`, `/blocker`, `/deps`, `/synth`, `/export`, `/add`, `/demo`, `/reset`), lane CRUD, state persistence via localStorage, and markdown export/import. Dark mode design system with CSS custom properties.

Architecture decision: Layer 0 (CLAUDE.md) must always work without Layer 1 (UI). The dashboard reads state and generates protocol-compliant output, but the method is never dependent on it.
