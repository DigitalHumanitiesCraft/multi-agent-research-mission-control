# Die Forschungsleitstelle — Human-as-Dispatcher Context Engineering fuer parallele AI-Forschungsprojekte

**Version 1.0 | Februar 2026**

---

## 1. Abstract

Komplexe Forschungsprojekte uebersteigen das Context Window eines einzelnen AI-Agents. Gleichzeitig scheitern vollautonome Multi-Agent-Systeme an Koordination, Qualitaetskontrolle und fehlender Forschungslogik. Die Forschungsleitstelle loest dieses Problem durch ein "Human-as-Dispatcher"-Pattern: Ein menschlicher Operator agiert als aktive Koordinationsschicht zwischen isolierten, spezialisierten AI-Agents. Die gesamte Methode ist als Context Engineering in einer einzigen Markdown-Datei implementiert -- ohne Code, ohne Framework, ohne Cloud-Infrastruktur.

Dieses Paper beschreibt die Architektur, die sieben Kernfunktionen, die Abgrenzung zu existierenden Multi-Agent-Frameworks (CrewAI, AutoGen, LangGraph, Claude Code Agent Teams) und die Roadmap zur semi-autonomen Koordination. Die zentrale These: In einer Welt, in der AI-Agents immer leistungsfaehiger werden, liegt der entscheidende Engpass nicht in der Ausfuehrung einzelner Tasks, sondern in deren Koordination ueber Projektgrenzen hinweg. Diese Koordination erfordert menschliches Urteilsvermoegen -- aber sie braucht ein System, das dieses Urteilsvermoegen skalierbar macht.

---

## 2. Das Problem: Warum ein einzelner AI-Agent nicht reicht

### 2.1 Das Context-Window-Problem

Jeder AI-Agent operiert innerhalb eines endlichen Kontextfensters. Selbst bei 200.000 Tokens -- dem aktuellen oberen Ende -- ist diese Grenze in realen Forschungsprojekten schnell erreicht. Ein typisches Projekt erfordert simultanes Wissen ueber die Codebasis, relevante Literatur, Datenstrukturen, den aktuellen Projektstand, Abhaengigkeiten zu anderen Systemen und externe Deadlines. All das gleichzeitig im Kontext zu halten ist nicht moeglich.

Dazu kommt Context Degradation: Die Qualitaet der Antworten sinkt mit zunehmender Kontextlaenge. Liu et al. (2023) haben diesen "Lost-in-the-Middle"-Effekt systematisch dokumentiert -- Informationen, die weder am Anfang noch am Ende des Kontexts stehen, werden signifikant schlechter verarbeitet. In der Praxis bedeutet das: Je mehr ein Agent gleichzeitig wissen muss, desto weniger zuverlaessig wird er.

Die gaengige Antwort auf dieses Problem -- den Kontext manuell kurz halten und nur die "wichtigsten" Informationen bereitstellen -- verschiebt die Komplexitaet lediglich zum menschlichen Operator. Dieser muss dann entscheiden, welche Informationen relevant sind, ohne dass der Agent ihm dabei helfen kann. Das ist kein System, das ist ein Workaround.

### 2.2 Naive Parallelisierung ist keine Loesung

Der naheliegende Ansatz, mehrere Agents parallel auf verschiedenen Teilprojekten arbeiten zu lassen, erzeugt neue Probleme. Ohne Koordination entstehen Duplikation, Inkonsistenz und divergente Entscheidungen. Wenn Agent A eine REST-API mit JSON-Response baut und Agent B denselben Endpunkt mit Protobuf erwartet, ist das Ergebnis nicht parallelisierte Arbeit, sondern parallelisierter Muell.

Das Kernproblem ist das Blindflug-Problem: Kein Agent sieht den Gesamtzustand. Agent A weiss nicht, dass Agent B gerade dieselbe Bibliothek evaluiert. Agent C weiss nicht, dass Agent D bereits eine Designentscheidung getroffen hat, die C's Ansatz obsolet macht. In verteilten Systemen loest man das durch geteilten Zustand (Shared State). AI-Agents in separaten Sessions haben aber keinen geteilten Zustand -- zumindest nicht automatisch.

Noch gravierender ist die fehlende Synthese. Wenn zwei Agents unabhaengig voneinander zu aehnlichen Ergebnissen kommen, erkennt das niemand. Wenn drei Agents dasselbe Embedding-Modell evaluieren und unterschiedlich bewerten, gibt es keinen Mechanismus, der diese Bewertungen zusammenfuehrt. Die Ueberlappungen und Konvergenzen zwischen parallelen Arbeitsstroemen bleiben unsichtbar.

### 2.3 Vollautonome Multi-Agent-Systeme und ihre Grenzen

Die Geschichte vollautonomer Multi-Agent-Systeme ist eine Geschichte der Ernuechterung. AutoGPT und BabyAGI (2023) demonstrierten eindrucksvoll, wie LLMs sich selbst Tasks geben und abarbeiten koennen -- und ebenso eindrucksvoll, wie fragil diese Systeme sind. Endlosschleifen, Ziel-Drift und eine fundamentale Unfaehigkeit, die eigene Unsicherheit einzuschaetzen, machten sie fuer ernsthafte Forschungsarbeit unbrauchbar.

Das zugrundeliegende Problem ist tiefer als technische Unreife. AI-Agents koennen schlecht einschaetzen, wann sie fragen sollten statt zu entscheiden. In der Forschung ist genau diese Einschaetzung oft die kritischste Kompetenz. Soll das Modell auf Precision oder Recall optimiert werden? Ist die Stichprobe gross genug? Rechtfertigen die bisherigen Ergebnisse eine Aenderung der Methodik? Diese Fragen erfordern nicht mehr Rechenleistung oder groessere Kontextfenster, sondern Urteilsvermoegen unter Ambiguitaet. Die "letzte Meile" der Entscheidungsfindung bleibt beim Menschen.

---

## 3. Theoretischer Rahmen

### 3.1 Context Engineering

Gartner hat es im Juli 2025 auf den Punkt gebracht: "Context engineering is in, and prompt engineering is out." Prompt Engineering optimiert die Formulierung einzelner Eingaben an ein LLM. Context Engineering architektoniert den gesamten Informationsraum, in dem das LLM operiert.

Die Definition, die sich 2025/2026 als Industriekonsens etabliert hat: Context Engineering ist die Disziplin, dynamische Systeme zu entwerfen, die die richtige Information und die richtigen Tools, im richtigen Format, zum richtigen Zeitpunkt bereitstellen, damit ein LLM alles hat, was es braucht, um eine Aufgabe zu erfuellen. Es geht nicht um "Wie frage ich?", sondern um "Was stelle ich bereit?" -- Daten, Knowledge, Tools, Memory, Struktur.

Anthropics eigene Forschung zum Thema konzentriert sich auf ein Kernprinzip: die kleinste moegliche Menge hochwertiger Tokens finden, die die Wahrscheinlichkeit des gewuenschten Ergebnisses maximieren. Fuer lang laufende Agents empfehlen sie drei Techniken: Compaction (Zusammenfassung des bisherigen Kontexts), Structured Note-Taking (der Agent fuehrt eigene Notizen) und Multi-Agent-Architekturen als Context-Engineering-Strategie -- die Verteilung von Aufgaben auf Sub-Agenten mit jeweils sauberen Kontextfenstern.

Die Forschungsleitstelle ist Context Engineering in Reinform. Die CLAUDE.md-Datei ist kein Prompt, sondern ein Betriebssystem-Prompt: Sie definiert eine vollstaendige Verhaltensarchitektur mit Identitaet, Protokollen, Templates, Fehlerbehandlung und State Management. Sie ist das "Wie stelle ich bereit?" fuer die Koordination paralleler Forschungsprojekte.

### 3.2 Multi-Agent-Systeme

Die klassische Multi-Agent-Systemtheorie (Wooldridge und Jennings) beschreibt autonome Agents mit partieller Weltsicht, die durch Kommunikation kooperieren. Zwei Koordinationsparadigmen dominieren die Literatur: zentrale Koordination (ein Agent oder System verteilt Aufgaben) und dezentrale Koordination (Agents verhandeln untereinander).

In der Praxis hat sich 2025/2026 ein klares Bild ergeben: Zentrale Koordination funktioniert besser fuer strukturierte Aufgaben. Google nennt das den "Coordinator/Dispatcher Pattern" und listet es als eines von acht Design Patterns fuer Multi-Agent-Systeme. CrewAI implementiert hierarchische Koordination mit Manager-Agents. LangGraph nutzt DAG-basierte Orchestrierung mit einem zentralen StateGraph. Microsoft's AutoGen (jetzt Agent Framework) setzt auf das Actor Model.

Der gemeinsame Nenner aller aktuellen Frameworks: Der Koordinator ist immer ein AI-Agent. Das ist eine Designentscheidung mit weitreichenden Konsequenzen, denn es setzt voraus, dass die Koordination selbst automatisierbar ist. Fuer klar definierte Engineering-Tasks mag das funktionieren. Fuer Forschungskoordination -- wo die naechste Entscheidung oft von Informationen abhaengt, die kein Agent hat -- ist es eine Schwaeche.

Die Forschungsleitstelle implementiert das Mediator-Pattern aus dem klassischen Software-Design (Gamma et al.), aber mit einem entscheidenden Unterschied: Der Mediator ist kein Agent, sondern ein AI-gestuetzter Mensch. Die Forschungsleitstelle als AI-Agent unterstuetzt den menschlichen Operator bei der Koordination, trifft aber keine Entscheidungen selbst.

### 3.3 Von Human-in-the-Loop zu Human-as-Dispatcher

Das klassische Human-in-the-Loop-Pattern (HITL) positioniert den Menschen als Qualitaetskontrolle am Ende einer Pipeline: Der Agent produziert, der Mensch bewertet. Google ADK formalisiert das als eines von acht Design Patterns -- der Agent pausiert via `interrupt()`, der Mensch reviewed und approved oder rejected, der Agent setzt fort.

Der Trend 2026 ist klar: Je praeziser AI-Agents werden, desto mehr verschiebt sich die menschliche Rolle von routinemaessiger Ueberwachung zu strategischen Entscheidungen. Der Mensch fokussiert auf Judgement, Innovation und Problem-Solving.

Die Forschungsleitstelle geht einen Schritt weiter und definiert eine neue Rolle, die in der aktuellen Literatur nicht als etabliertes Pattern existiert: Human-as-Dispatcher. Der Unterschied zu HITL ist strukturell: Der Mensch ist nicht Qualitaetskontrolle am Ende einer Pipeline, sondern aktiver Router, Uebersetzer und Gedaechtnis in der Mitte eines Netzwerks. Drei Rollen fallen zusammen.

Als Dispatcher entscheidet der Operator, welcher Agent welche Aufgabe bekommt, wann eine Aufgabe fertig ist und wann ein Ergebnis von einem Agent zum naechsten wandert. Als Translator uebersetzt der Operator zwischen den Kontexten der Agents, die einander nicht sehen koennen. Ein Ergebnis aus Lane 1 muss fuer Lane 3 neu formuliert werden, weil Lane 3 einen anderen Wissensstand hat. Als Memory ist der Operator das einzige Element im System, das den Gesamtzustand ueber alle Agents und Sessions hinweg kennt. Die Forschungsleitstelle unterstuetzt diese Memory-Funktion durch strukturierte Export- und Briefing-Mechanismen, aber der Mensch bleibt der primaere Informationstraeger.

### 3.4 Dispatch-Pattern aus verteilten Systemen

Die Parallele zu Kubernetes ist aufschlussreich: Der Operator ist der "Human Scheduler", Lanes sind Pods, Modes sind Pod-States (Running, Pending, Succeeded, Failed). Der Scheduler entscheidet, welcher Pod auf welchem Node laeuft, basierend auf Ressourcen, Constraints und Prioritaeten.

Der entscheidende Unterschied: In Kubernetes haben Pods geteilten Zustand via etcd. AI-Agents in separaten Terminal-Sessions haben keinen geteilten Zustand. Der Mensch IST der geteilte Zustand. Das macht die Architektur fundamentaler als ein Scheduling-Problem -- es ist ein Informationsarchitektur-Problem. Die Forschungsleitstelle ist das System, das den menschlichen geteilten Zustand strukturiert und skalierbar macht.

---

## 4. Die Methode: Forschungsleitstelle v0.4

### 4.1 Architektur im Ueberblick

Die Forschungsleitstelle implementiert eine Drei-Schichten-Architektur: Der Operator interagiert mit der Forschungsleitstelle (einem Koordinations-Agenten), die ihrerseits Instruktionen fuer Lane-Agents formuliert. Die Topologie ist ein Stern -- alle Kommunikation laeuft ausschliesslich ueber den Operator. Kein Lane-Agent kommuniziert direkt mit einem anderen.

Diese Star-Topologie ist eine bewusste Designentscheidung, keine technische Einschraenkung. Sie stellt sicher, dass der Operator vollstaendige Sichtbarkeit ueber alle Informationsfluesse hat. In einer Forschungsumgebung, wo eine fehlerhafte Information sich ueber mehrere Projekte propagieren kann, ist diese Sichtbarkeit nicht optional, sondern kritisch.

Die gesamte Implementierung besteht aus einer einzigen Markdown-Datei (CLAUDE.md), die als System Prompt in eine Claude-Code-Instanz geladen wird. Diese Datei definiert Identitaet, Protokolle, Templates, Zustandsmodell und Fehlerbehandlung. Es gibt keinen Server, keine Datenbank, kein Framework. Die Methode laeuft ueberall dort, wo ein LLM einen System Prompt akzeptiert.

### 4.2 Das Lane-Modell

Die Lane ist die zentrale Abstraktionseinheit der Forschungsleitstelle. Jede Lane repraesentiert einen eigenstaendigen Arbeitsstream -- typischerweise ein Forschungsprojekt, eine Implementierung oder eine Infrastrukturkomponente. Eine Lane traegt neun Properties: eine feste Nummer (Identifier), einen Namen, den Scope (woran die Lane arbeitet), den aktuellen Mode, den naechsten konkreten Schritt, den Horizon (naechste externe Deadline), aktive Blocker, Abhaengigkeiten zu anderen Lanes und einen Typ.

Beim Typ unterscheidet die Forschungsleitstelle zwischen `project`-Lanes und `infra`-Lanes. Project-Lanes produzieren Output -- Code, Analysen, Dokumente. Infra-Lanes sind Read-Only-Orakel: Sie empfangen keine Aufgaben, sondern beantworten Anfragen. Ein typisches Beispiel ist eine Obsidian-Vault-Lane, die Forschungsnotizen und Literatur bereithaelt und von anderen Lanes ueber den Operator befragt werden kann.

Die Modes bilden eine Zustandsmaschine: IDLE (wartend auf Zuweisung), PLANNING (Analyse oder Design, keine Implementierung), WORKING (aktive Implementierung), REVIEW (Output bereit, wartet auf Operator-Review), BLOCKED (kann nicht fortfahren ohne externen Input) und DONE (Meilenstein abgeschlossen). Diese Zustaende sind nicht dekorativ -- sie steuern die Priorisierung, die Abhaengigkeitserkennung und die Stagnations-Detektion.

### 4.3 Die sieben Kernfunktionen

Die Forschungsleitstelle definiert sieben Kernfunktionen, die zusammen das Koordinationssystem bilden.

**Status Tracking** ist die Grundlage: Der Zustand jeder Lane wird gepflegt, aber nie angenommen. Nur explizit berichteter Fortschritt wird als Fortschritt gewertet. Letzer bekannter Zustand gilt, bis ein Update kommt. Das klingt trivial, ist aber eine bewusste Gegenmassnahme gegen das "Optimismus-Bias"-Problem, bei dem Koordinationssysteme annehmen, dass Arbeit planmaessig laeuft, bis das Gegenteil bewiesen ist.

**Task Formulation** uebersetzt Operator-Absichten in selbststaendige, ausfuehrbare Instruktionen fuer einen spezifischen Lane-Agent. Jede Instruktion folgt einem festen Template (Context, Schritte, Constraints, Ask Clause) und ist so formuliert, dass sie direkt per Copy-Paste in ein Terminal eingefuegt werden kann. Die Ask Clause ist besonders wichtig: Sie definiert explizit, bei welchen Themen der Agent den Operator fragen soll, statt autonom zu entscheiden.

**Dependency Detection** erkennt, wenn eine Lane Output produziert, den eine andere Lane braucht, oder wenn zwei Lanes an ueberlappenden Konzepten arbeiten. In v0.4 ist das eine manuelle Funktion der Forschungsleitstelle -- sie wird bei jedem Status-Update und jeder Task-Formulierung ausgefuehrt.

**Prioritization** rangiert Lanes nach vier Kriterien in fester Reihenfolge: Deadline-Naehe, Unblocking-Potential fuer andere Lanes, unmittelbare Ausfuehrbarkeit (keine offenen Fragen) und Wert pro Aufwand. Entscheidend: Wenn mehrere Lanes unabhaengig und gleichrangig sind, werden sie als Parallelgruppe praesentiert, nicht als Sequenz. Nur echte Abhaengigkeiten erzwingen eine Reihenfolge.

**Synthesis** ist die Funktion, die die Forschungsleitstelle von einem reinen Task-Manager unterscheidet. Sie identifiziert Cross-Lane-Muster, die kein einzelner Agent sehen kann: geteilte methodische Ansaetze, konvergierende empirische Ergebnisse aus verschiedenen Domaenen, wiederverwendbare Komponenten und theoretische Rahmen, die separate Outputs verbinden. Synthesis ist nicht optional -- sie wird bei jedem Status-Report und jeder Priorisierung ausgefuehrt und im Export persistiert.

**Stagnation Detection** ueberwacht den Fortschritt. Wenn eine Lane zwei aufeinanderfolgende Updates ohne messbaren Fortschritt meldet oder ein externer Blocker ueber zwei Status-Runden persistiert, wird das explizit geflaggt. Das System reagiert, bevor der Operator das Problem bemerkt.

**Quality Control** faengt Duplikate, Inkonsistenzen zwischen Lanes und Instruktionen ab, die mit bekannten Blockern konfligieren. Wenn der Operator eine Aufgabe an Lane 3 formulieren will, die vom Output aus Lane 1 abhaengt, und Lane 1 im Status BLOCKED ist, wird das gemeldet, bevor die Instruktion rausgeht.

### 4.4 Die Operator Query Phase

Die Operator Query Phase (OQP) ist der Mechanismus, der "halluzinierte Entscheidungen" verhindert. Bevor die Forschungsleitstelle eine Task-Instruktion formuliert, durchlaeuft sie drei Schritte.

Im ersten Schritt identifiziert sie Annahmen, die nicht aus dem Wissensstand der Lane oder aus vorherigen Updates ableitbar sind. Diese Annahmen fallen in vier Kategorien: Goal-Annahmen (Was will der Operator erreichen?), External-State-Annahmen (Hat eine externe Partei etwas bestaetigt?), Preference-Annahmen (Hat der Operator eine Praeferenz, die die Ausfuehrung beeinflusst?) und Data-Annahmen (Existieren die benoetigten Daten?).

Im zweiten Schritt werden alle identifizierten Annahmen als kompakte nummerierte Liste praesentiert, gruppiert nach Lane. Die Forschungsleitstelle formuliert keine Instruktionen, bis der Operator geantwortet hat.

Im dritten Schritt werden die Antworten integriert und die Instruktionen formuliert.

Dieses Vorgehen ist in keinem der verglichenen Multi-Agent-Frameworks vorhanden. CrewAI, AutoGen, LangGraph und selbst Claude Code Agent Teams treffen Annahmen implizit und arbeiten darauf basierend weiter. Die OQP externalisiert diesen Prozess und macht ihn transparent. Das kostet einen Interaktionsschritt, verhindert aber Situationen, in denen ein Agent stundenlang in die falsche Richtung arbeitet, weil eine Annahme falsch war.

Fuer Situationen, in denen der Operator bewusst auf Rueckfragen verzichten will ("keine Rueckfragen"), existiert eine Ausnahme: Die Forschungsleitstelle formuliert direkt, markiert aber alle Annahmen explizit mit `[ASSUMED]`.

### 4.5 Task Instruction Template

Jede Instruktion an einen Lane-Agent folgt einer festen Struktur:

```
-> Claude N (Project Name):

[Context -- aktueller Zustand der Lane in einem Satz.]

[Nummerierte Schritte in Ausfuehrungsreihenfolge.]
1. ...
2. ...
3. ...

[Constraints -- was nicht getan werden soll.]

[Ask Clause -- Themen, bei denen der Agent fragen statt
autonom entscheiden soll.]
```

Dieses Template ist kein Vorschlag, sondern ein Protokoll. Es stellt sicher, dass jede Instruktion selbststaendig verstaendlich ist (Context), ausfuehrbar ist (Schritte), Leitplanken hat (Constraints) und Eskalationspunkte definiert (Ask Clause). Die Instruktion muss direkt per Copy-Paste in das Terminal des Lane-Agents eingefuegt werden koennen, ohne zusaetzlichen Kontext.

### 4.6 Handoff und Query Protocol

Wenn Ergebnisse von einer Lane zu einer anderen wandern, formuliert die Forschungsleitstelle einen Handoff-Block: Was wurde produziert, warum ist es fuer die Ziel-Lane relevant, und was soll die Ziel-Lane damit tun. Fuer Infra-Lanes (die keine Aufgaben empfangen, sondern Fragen beantworten) gibt es ein separates Query Protocol, das strukturiert formuliert, welche Information benoetigt wird, warum, und in welchem Format.

Beide Protokolle folgen demselben Prinzip: Jeder Block muss Copy-Paste-faehig sein und ohne zusaetzlichen Kontext funktionieren. Der Operator ist der Bote, aber er muss die Nachricht nicht umformulieren.

### 4.7 Session Persistence

Die Forschungsleitstelle hat kein Gedaechtnis zwischen Sessions. Jede neue Konversation startet bei Null. Um Sessions zu ueberbruecken, gibt es den `/export`-Befehl, der den vollstaendigen Zustand als kompaktes Markdown-Dokument mit drei Sektionen ausgibt: Lane States (Mode, naechster Schritt, Blocker, Abhaengigkeiten, Horizon fuer jede Lane), Active Synthesis (Cross-Lane-Muster, die Priorisierung oder Task-Formulierung beeinflussen) und Open Operator Questions (unbeantwortete Fragen plus neue Fragen aus der Session).

Das System speichert seinen eigenen Zustand in einem Format, das es spaeter selbst parsen kann. Wenn eine neue Session mit einem State-Dokument beginnt, wird es geparst, das Status Board angezeigt und die Arbeit fortgesetzt. Das ist im Kern das Konzept von "Evolving Contexts for Self-Improving Language Models", das in der akademischen Literatur als "Agentic Context Engineering" diskutiert wird (arXiv:2510.04618).

---

## 5. Vergleich mit existierenden Ansaetzen

Die Landschaft der Multi-Agent-Koordination hat sich seit Anfang 2025 dramatisch veraendert. Statt einer Handvoll experimenteller Frameworks gibt es nun ein reifes Oekosystem mit unterschiedlichen Ansaetzen. Der folgende Vergleich positioniert die Forschungsleitstelle in diesem Oekosystem -- nicht als Konkurrent, sondern als komplementaere Schicht.

### 5.1 Die Frameworks im Einzelnen

**CrewAI** hat sich mit ueber 100.000 zertifizierten Entwicklern als eines der meistverbreiteten Frameworks etabliert. Die Architektur basiert auf Crews (Agent-Teams mit Autonomie) und Flows (event-driven Orchestrierung). Koordination kann sequentiell, hierarchisch oder konsensbasiert erfolgen. Die Enterprise-Version (AMP Suite) bietet Tracing, Observability und ein Control Plane. Der zentrale Unterschied zur Forschungsleitstelle: CrewAI optimiert Agent-Zusammenarbeit innerhalb einer Laufzeit. Die Forschungsleitstelle koordiniert ueber isolierte Agents und Projekte hinweg. CrewAI hat keinen Mechanismus, der dem Operator Query Phase entspricht.

**Microsoft AutoGen** wurde in v0.4 (Januar 2025) komplett neu designt und fusioniert inzwischen mit Semantic Kernel zum Microsoft Agent Framework (GA Q1 2026). Die Architektur basiert auf dem Actor Model fuer asynchrone, event-driven Multi-Agent-Orchestrierung. Der Setup ist schwerer als bei CrewAI und stark an das Microsoft-Oekosystem gebunden. Im Vergleich zur Forschungsleitstelle ist AutoGen ein Software-Framework fuer Agenten-Konversationen -- es erfordert Code-Infrastruktur, die Forschungsleitstelle nur ein Markdown-File.

**LangGraph** ist das schnellste Framework mit der niedrigsten Latenz in Benchmarks. Die Architektur basiert auf DAG-basierter Orchestrierung: Nodes sind Agents, Functions oder Decision Points; Edges sind Datenfluesse. Ein zentraler StateGraph sorgt fuer persistenten Zustand ueber Workflows hinweg. LangGraph ist am naechsten bei State Management, aber es erfordert Python-Infrastruktur, ist nicht fuer Multi-Projekt-Koordination gedacht und hat weder eine Synthesis-Funktion noch einen Operator Query Phase.

**Google Agent Development Kit (ADK)**, Open-Source seit Google Cloud NEXT 2025, bietet den formalsten Pattern-Katalog aller Frameworks: acht Design Patterns von Sequential Pipeline ueber Parallel Execution bis Human-in-the-Loop. Der Coordinator Pattern -- ein zentraler Agent, der basierend auf Agent-Beschreibungen delegiert -- ist der naechste Verwandte der Forschungsleitstelle, aber automatisiert statt human-dispatched.

**OpenAI Codex** positioniert sich als "Command Center for Agents" -- multiple Coding-Tasks parallel, bis zu 30 Minuten autonom, ueber eine Million Nutzer pro Monat. Fokus liegt klar auf Coding, nicht auf Forschungskoordination. Keine Cross-Projekt-Synthese, keine Session Persistence im Forschungsleitstelle-Sinne.

### 5.2 Claude Code Agent Teams -- der naechste Nachbar

Claude Code Agent Teams (Februar 2026, experimentell) verdienen besondere Aufmerksamkeit, weil sie auf derselben Plattform operieren und das naechstliegende Vergleichssystem sind. Die Architektur besteht aus einem Team Lead, der koordiniert und Teammates spawnt, Teammates als separate Claude-Code-Instanzen mit eigenem Context Window, einer Shared Task List mit Dependencies und einer Mailbox fuer direkte Inter-Agent-Kommunikation.

Der Unterschied zu Subagents ist strukturell: Subagents berichten nur zurueck; Teammates kommunizieren untereinander direkt. Agent Teams koennen im Delegate Mode operieren (Lead macht nur Koordination) und bieten Plan Approval (Review vor Implementierung).

| Dimension | Agent Teams | Forschungsleitstelle |
|-----------|-------------|---------------------|
| Scope | Ein Codebase/Repo | Multiple Projekte/Repos |
| Koordination | AI Lead Agent | Menschlicher Operator |
| Kommunikation | Automatisch (Mailbox) | Manuell (Copy-Paste) |
| Synthese | Lead synthetisiert Code-Ergebnisse | Forschungs-Synthese ueber Projekte |
| Session Persistence | Begrenzt (kein Resume) | `/export` + `/brief` |
| Assumption Management | Keines | Operator Query Phase |
| Abstraktion | Tasks + Code | Lanes + Modes + Horizons |

Die kritische Erkenntnis: Die Forschungsleitstelle konkurriert nicht mit Agent Teams -- sie operiert auf einer hoeheren Abstraktionsebene. Agent Teams koordinieren Code-Tasks innerhalb eines Repos. Die Forschungsleitstelle koordiniert ganze Forschungsprojekte, die intern jeweils Agent Teams nutzen koennten.

### 5.3 Aktualisierte Vergleichstabelle

| Dimension | Forschungsleitstelle | CrewAI | AutoGen/MS | LangGraph | Google ADK | Agent Teams | Codex |
|-----------|---------------------|--------|------------|-----------|------------|-------------|-------|
| Koordination | Human-dispatched | Autonom/hier. | Actor Model | Graph-basiert | Pattern-basiert | AI Lead | Parallel Tasks |
| Infrastruktur | Zero (nur .md) | Python | Python/.NET | Python | Python/TS/Go | CLI (built-in) | Cloud Sandbox |
| Multi-Projekt | Ja (Lanes) | Begrenzt | Begrenzt | Nein | Nein | Nein (ein Repo) | Nein |
| Cross-Projekt-Synthese | Ja (Kernfunktion) | Nein | Nein | Nein | Nein | Begrenzt (Lead) | Nein |
| Operator Query Phase | Ja | Nein | Nein | Nein | Nein | Nein | Nein |
| Session Persistence | `/export` + `/brief` | Framework-abh. | Framework-abh. | State Machine | Framework-abh. | Nein (kein Resume) | Begrenzt |
| HITL | Kern-Architektur | Optional | Optional | Node-basiert | Pattern | Optional (Delegate) | Supervision |
| Einstiegshuerde | Niedrigst (1 File) | Mittel | Hoch | Hoch | Mittel | Niedrig (CLI) | Niedrig (App) |

### 5.4 Der 4-Layer-Stack

Die Vergleichsrecherche hat eine Architektur-Vision ergeben, die die Forschungsleitstelle nicht als Alternative zu diesen Systemen positioniert, sondern als Schicht darueber:

| Layer | Komponente | Rolle |
|-------|-----------|-------|
| 0 | CLAUDE.md (Methode) | Immer aktiv. Zero Infrastructure. |
| 1 | Web-Dashboard (UI) | Optional. Enhanced Experience. |
| 2 | Agent Teams / Subagents | Optional. Execution innerhalb einer Lane. |
| 3 | Individual Tools (Cursor, Devin, Codex) | Optional. Lane-Agents auf Tool-Ebene. |

Layer 0 ist immer da -- die Methode funktioniert mit nichts ausser einem Markdown-File und einem LLM. Layer 1 macht sie komfortabler. Layer 2 macht die Ausfuehrung innerhalb einzelner Lanes leistungsfaehiger. Layer 3 erlaubt den Einsatz spezialisierter Tools als Lane-Agents. Jeder Layer ist optional und unabhaengig aktivierbar.

---

## 6. Ein konkretes Beispiel: Die Forschungsleitstelle koordiniert sich selbst

Dieses Whitepaper hat ein eingebautes Meta-Beispiel: Die Forschungsleitstelle hat ihre eigene Weiterentwicklung koordiniert. In der Entstehung dieses Papers liefen drei parallele Lanes plus eine Infra-Lane, koordiniert durch eine Forschungsleitstelle-Instanz.

### 6.1 Das Setup

Lane 1 (Gliederung/Whitepaper) arbeitete an der inhaltlichen Struktur und der Vergleichsrecherche. Lane 2 (UI-Design) entwarf das Web-Dashboard-Konzept. Lane 4 (v0.5-Design) analysierte die Schwachstellen von v0.4 und formulierte den Feature-Katalog fuer v0.5. Eine Infra-Lane (Obsidian-Vault) stellte Forschungsnotizen und Literaturverweise bereit.

### 6.2 Der Ablauf

Die Forschungsleitstelle initialisierte die Lanes, fuehrte fuer jede die Operator Query Phase durch und formulierte parallele Task-Instruktionen. Lane 2 und Lane 4 konnten unabhaengig arbeiten -- das UI-Design und das v0.5-Feature-Design hatten keine gegenseitigen Abhaengigkeiten auf Task-Ebene. Lane 1 hing von den Ergebnissen beider ab (die Gliederung musste UI-Konzept und v0.5-Features referenzieren), wurde aber mit der Vergleichsrecherche gestartet, die unabhaengig war.

Waehrend der parallelen Arbeit setzte die Forschungsleitstelle alle sieben Kernfunktionen ein: Status Tracking dokumentierte den Fortschritt jeder Lane. Task Formulation uebersetzte "schreib das UI-Konzept" in eine ausfuehrbare Instruktion mit konkreten Schritten, Constraints und Ask-Clause. Dependency Detection erkannte, dass Lane 1 auf Outputs von Lane 2 und Lane 4 wartete, und priorisierte diese entsprechend. Die Priorisierung gruppierte Lane 2 und Lane 4 als Parallelgruppe.

### 6.3 Die Synthese

Der entscheidende Moment war die Synthese. Als die Ergebnisse aller drei Lanes vorlagen, erkannte die Forschungsleitstelle ein uebergreifendes Muster: Alle drei Lanes adressierten dasselbe Kernproblem aus verschiedenen Blickwinkeln -- den Operator-Bottleneck.

Lane 2 (UI-Design) entwarf ein Dashboard mit Copy-to-Clipboard als First-Class-Feature und drei Integrationsstufen (Copy-Paste, Log-File-Watching, MCP), weil der manuelle Copy-Paste-Overhead bei fuenf oder mehr Lanes zum Engpass wird. Lane 4 (v0.5-Design) identifizierte "Operator-Bottleneck" als eine von sechs Schwachstellen-Kategorien und entwarf Batch-Update, Auto-Suggest und Lane-Briefing als Gegenmassnahmen. Lane 1 (Recherche) fand, dass kein existierendes Framework dieses Problem adressiert, weil alle anderen den Operator durch Automatisierung ersetzen statt ihn zu unterstuetzen.

Ohne die Synthese-Funktion waeren das drei separate Ergebnisse geblieben. Mit der Synthese wurde klar: Die drei Lanes konvergieren auf eine gemeinsame Erkenntnis, die in keiner einzelnen Lane sichtbar war. Der Operator-Bottleneck ist nicht ein Problem unter vielen, sondern das zentrale Designproblem der Forschungsleitstelle -- und die Loesung muss auf allen drei Ebenen (Methode, UI, Protokoll) gleichzeitig ansetzen.

### 6.4 Was ohne die Methode passiert waere

Ohne die Forschungsleitstelle haette der Forscher drei AI-Agents parallel gestartet, jedem eine Aufgabe gegeben und die Ergebnisse am Ende manuell zusammengefuehrt. Die Wahrscheinlichkeit, dass alle drei Agents unabhaengig voneinander denselben Engpass identifizieren und ihre Loesungen dafuer kompatibel formulieren, ist gering. Wahrscheinlicher waere: Das UI-Design haette Features entworfen, die v0.5 bereits im Protokoll loest. Die v0.5-Analyse haette Probleme adressiert, die das UI-Design bereits visuell loest. Und die Vergleichsrecherche haette eine Positionierung vorgeschlagen, die weder zum UI noch zu v0.5 passt.

Die Forschungsleitstelle hat nicht die Arbeit gemacht -- das haben die Lane-Agents. Aber sie hat sichergestellt, dass die Arbeit zusammenpasst.

---

## 7. Design-Entscheidungen und Trade-offs

### Warum Human-as-Dispatcher und nicht vollautonom

Die Entscheidung fuer menschliche Koordination statt vollautonomer Orchestrierung ist keine Konzession an den Stand der Technik, sondern eine Designentscheidung aus der Natur der Aufgabe. Forschung erfordert Urteile unter Ambiguitaet. Soll eine Hypothese verworfen oder modifiziert werden? Ist ein negativer Befund eine Sackgasse oder ein interessantes Ergebnis? Rechtfertigt der bisherige Aufwand eine Kursaenderung? Diese Entscheidungen sind nicht automatisierbar, weil sie auf Wissen beruhen, das ausserhalb des Agenten-Kontexts liegt -- Erfahrung, Intuition, Kenntnis des Forschungsfelds, organisatorische Constraints.

Der Trade-off ist klar: Menschliche Koordination skaliert schlechter als automatische. Die Forschungsleitstelle ist designt fuer drei bis zehn parallele Lanes, nicht fuer hundert. Jenseits von zehn Lanes wird die kognitive Last des Operators zum Engpass, den auch Batch-Updates und Auto-Suggest nur begrenzt kompensieren koennen.

### Warum Zero Infrastructure

Die niedrigste Einstiegshuerde gewinnt. Ein Forscher, der morgen frueh parallele AI-Agents koordinieren will, kann die CLAUDE.md in sein Terminal kopieren und loslegen. Kein `pip install`, kein Docker, kein API-Key fuer einen Orchestrierungs-Service. Das ist nicht Anti-Technologie, sondern Pragmatismus: Jede Infrastruktur-Abhaengigkeit ist eine potenzielle Fehlerquelle und eine Huerde fuer Adoption.

Der Trade-off: Zero Infrastructure bedeutet keine automatische Persistenz, keine automatische Synchronisation, keinen automatischen Handoff. Der Operator muss Copy-Pasten, manuell exportieren, manuell importieren. Die UI- und v0.5-Roadmap adressieren das schrittweise, ohne die Zero-Infrastructure-Basis aufzugeben -- Layer 0 bleibt immer das Markdown-File.

### Warum Star-Topologie

Vollstaendige Sichtbarkeit und einfaches Debugging. Wenn etwas schiefgeht, weiss der Operator genau, welche Information wohin geflossen ist, weil alles durch ihn lief. In einer Mesh-Topologie, in der Agents direkt kommunizieren, kann ein Fehler sich propagieren, bevor der Operator ihn bemerkt. Claude Code Agent Teams erlauben direkte Inter-Agent-Kommunikation via Mailbox -- das ist schneller, aber weniger transparent.

Der Trade-off: Hoeherer manueller Aufwand und hoehere Latenz. Jeder Informationstransfer erfordert einen Operator-Schritt. Bei zeitkritischen Projekten mit vielen Handoffs ist das ein realer Nachteil.

### Warum strukturierte Templates

Das Task Instruction Template (Context, Schritte, Constraints, Ask Clause) und das Handoff Protocol sind rigide Strukturen in einem ansonsten flexiblen System. Der Grund: Sie reduzieren Ambiguitaet auf beiden Seiten. Der Operator weiss, welche Informationen er bereitstellen muss. Der Lane-Agent weiss, was erwartet wird und wo die Grenzen seiner Autonomie liegen. Gleichzeitig sind die Templates maschinenparsfaehig -- eine Voraussetzung fuer die spaetere UI-Integration und Auto-Suggest.

---

## 8. UI-Konzept: Das Forschungsleitstelle Web-Dashboard

### 8.1 Architekturprinzip: Das Layer-Modell

Die Forschungsleitstelle folgt einem strikten Layer-Modell. Layer 0 ist die CLAUDE.md -- die Methode funktioniert immer, auch ohne UI, auch ohne Internet, auch ohne irgendetwas ausser einem LLM und einem Terminal. Layer 1 ist das Web-Dashboard -- es macht die Methode komfortabler, ersetzt sie aber nicht. Die App unterstuetzt die Methode; sie definiert sie nicht.

Dieses Prinzip hat konkrete Konsequenzen: Jede Funktion des Dashboards muss auch ohne Dashboard funktionieren. Das Dashboard visualisiert den Zustand, der in der CLAUDE.md definiert ist -- es erfindet keinen eigenen. Wenn das Dashboard ausfall, aendert sich an der Methode nichts. Der Operator oeffnet ein neues Terminal und arbeitet weiter.

### 8.2 Dashboard-First, Keyboard-First

Das Design folgt dem Muster "Persistent Overview + Transient Detail", inspiriert von Leitstand-Systemen (ISO 11064), NASA Mission Control und moderner Produktivitaets-Software wie Linear. Das Dashboard -- das Status Board -- ist immer sichtbar. Alle anderen Views sind Overlays, Side Panels oder Modals. Es gibt keine klassische Seitennavigation. Der Operator muss den Gesamtzustand immer im Blick behalten, wie bei einem realen Leitstand.

Lane-Karten zeigen das kompakte 4-Zeilen-Format aus der Spezifikation: Zustandszusammenfassung, naechster Schritt, Blocker, Deadline. Die Karten sind farbkodiert nach Mode (Gruen fuer WORKING, Rot fuer BLOCKED, Blau fuer PLANNING, Amber fuer REVIEW). Lanes werden nicht flach gelistet, sondern in Dependency-Gruppen: Parallel-Gruppen nebeneinander mit gestrichelter Klammer, Sequenz-Gruppen nebeneinander mit Pfeil, Infra-Lanes in einem separaten Bereich.

Eine zentrale Command Bar (Ctrl+K) macht alle `/commands` der Spezifikation verfuegbar, mit Fuzzy-Search ueber Commands und Lane-Namen und Autocomplete fuer Lane-Nummern. Jede Aktion ist ueber Keyboard Shortcuts erreichbar: Ctrl+1 bis Ctrl+9 fuer Lane-Details, Ctrl+D fuer den Dependency Graph, Ctrl+E fuer Export. Das Interaktionsmodell ist auf einen Operator optimiert, der schneller tippt als klickt.

### 8.3 Interaktionsmodell und Task Formulation

Copy-to-Clipboard ist ein First-Class-Feature, nicht ein nachtraeglicher Export-Button. Solange Lane-Agents in Terminals laufen, ist das Clipboard der primaere Output-Kanal. Jede generierte Task-Instruktion, jeder Handoff-Block, jedes Query kann mit einem Klick oder Shortcut in die Zwischenablage kopiert werden.

Das Task Formulation Modal implementiert die Operator Query Phase visuell: Identifizierte Annahmen werden als Checkliste dargestellt, gruppiert nach Kategorie. Der Operator beantwortet sie inline. Erst wenn alle beantwortet sind, wird die Task-Instruktion generiert und als Live-Vorschau angezeigt. Der "Keine Rueckfragen"-Modus markiert alle Annahmen automatisch mit `[ASSUMED]`.

Die Progressive Disclosure folgt drei Stufen: Kompakte Lane-Karte auf dem Dashboard, Side Panel (400px rechts) fuer den vollstaendigen Lane-Zustand mit Mode-Verlauf, Dependencies und Update-Historie, und Fullscreen fuer den interaktiven Dependency Graph.

### 8.4 Dependency Graph

Der Dependency Graph ist ein interaktiver DAG (Directed Acyclic Graph), implementiert mit @xyflow/react als Fullscreen Overlay. Jeder Lane-Node zeigt den aktuellen Mode als Farbe. Kanten sind typisiert: durchgezogene Pfeile fuer Output-Abhaengigkeiten, gepunktete fuer Queries, gesperrte fuer Blocks. Blockierte Kanten pulsieren rot. Hover auf einem Node zeigt die kompakte 4-Zeilen-Info; Klick oeffnet das Lane Detail Panel.

### 8.5 Tech-Stack und Integrationsstufen

Der Tech-Stack ist auf Kontrolle und Geschwindigkeit optimiert: Next.js 15 mit App Router, React 19, shadcn/ui und Tailwind CSS v4 fuer die UI-Komponenten, Zustand fuer State Management, @xyflow/react fuer den Graph, cmdk (via shadcn) fuer die Command Bar, und framer-motion fuer Status-Transitions. Persistenz laeuft ueber IndexedDB via idb fuer Session-Snapshots. Im MVP gibt es kein Backend -- alles laeuft clientseitig.

Die Integration mit den Terminal-Agents erfolgt in drei Stufen. Stufe 1 (MVP) ist Copy-Paste: Task-Instruktionen werden ins Clipboard kopiert und manuell in das Terminal eingefuegt. Stufe 2 ist Log-File-Watching: Ein Bridge-Server ueberwacht Terminal-Logs und generiert automatische Updates. Stufe 3 ist MCP-Integration: Bidirektionale Kommunikation zwischen Dashboard und Claude Code, bei der das Dashboard direkt mit den Lane-Agents sprechen kann.

---

## 9. Roadmap: Von v0.4 zu v0.5

### 9.1 Identifizierte Schwachstellen

Die systematische Analyse von v0.4 hat sechs Schwachstellen-Kategorien ergeben, die die Weiterentwicklung zu v0.5 treiben.

Das Skalierungsproblem zeigt sich ab zehn Lanes: Das Status Board umfasst dann ueber 40 Zeilen und sprengt die Aufmerksamkeitsspanne des Operators. Es gibt keine Gruppierung, keine Filterung, keine Kollabierung von IDLE- oder DONE-Lanes. Die Dependency-Darstellung als Freitext wird bei Kreuzabhaengigkeiten unleserlich. Der Export waechst linear und kann das Context Window der naechsten Session dominieren.

Der Context-Verlust betrifft mehrere Ebenen: Die Lane-Historie geht verloren, weil der Export nur den aktuellen Zustand speichert, nicht die Entscheidungshistorie. Operator-Antworten aus der Query Phase sind nicht persistent -- dieselbe Frage kann in der naechsten Session erneut gestellt werden. Lane-Agents nach einem Terminal-Neustart haben keinen kumulativen Kontext, nur den Next-Step.

Der Operator-Bottleneck -- das Kernproblem, das auch die Synthese der drei parallelen Lanes identifiziert hat -- manifestiert sich als Copy-Paste-Overhead (zehn oder mehr Vorgaenge pro Runde bei fuenf Lanes), als Query-Relay-Latenz (drei Hops fuer jede Infra-Query) und als Synthese-Last (der Operator muss alle Implikationen simultan bewerten).

Hinzu kommen fehlende Automatisierung (keine Blocker-Eskalationspfade, keine Task-Templates, keine Fortschritts-Metriken), Protokoll-Luecken (kein Lane-Merge, Split oder Pause, kein Partial Handoff, keine Konflikterkennung) und ein Evaluation-Gap (keine definierten Erfolgskriterien, kein Vergleichsrahmen).

### 9.2 v0.5 Features

Die v0.5-Features sind in drei Prioritaetsstufen gegliedert, wobei P0-Features die kritischsten Probleme adressieren.

Auf P0-Ebene (kritisch) stehen vier Features. Das Decision Log fuehrt eine kompakte Entscheidungshistorie pro Lane -- maximal fuenf Eintraege im FIFO-Verfahren, mit Datum, Entscheidung, Begruendung und verworfener Alternative. Es wird im Export persistiert und bei Lane-Briefings bereitgestellt. Der Operator Answer Cache speichert beantwortete Fragen als Key-Value-Paare und prueft sie automatisch bei jeder neuen Query Phase, bevor dieselbe Frage erneut gestellt wird. Antworten, die aelter als 14 Tage sind, werden mit "Noch aktuell?" erneut validiert. Das Batch-Update (`/update-batch`) erlaubt Multi-Lane-Updates in einem einzigen Operator-Turn -- alle Lane-States werden atomar aktualisiert, Dependencies gecheckt und eine konsolidierte Priorisierung ausgegeben. Das Lane-Briefing (`/brief N`) generiert ein Copy-Paste-fertiges Kontext-Dokument fuer Terminal-Neustarts, das Scope, Entscheidungshistorie, aktuellen Zustand, naechsten Schritt und relevante Handoffs umfasst.

Auf P1-Ebene (wichtig) stehen Skalierungs- und Strukturfeatures. Lane-Cluster ermoeglichen benannte Gruppierungen (zum Beispiel `cluster: frontend`) mit kollabierbarer Ansicht. Status-Filter erlauben `/status BLOCKED`, `/status WORKING` oder `/status cluster:X` statt nur der Gesamtansicht. Auto-Suggest generiert nach jedem Update automatisch Handoff-, Archivierungs- und Eskalationsvorschlaege. Der formale Dependency Graph ersetzt Freitext-Dependencies durch typisierte Kanten (`--output-->`, `--query-->`, `--blocks-->`) mit Zykluserkennung. Lane-Lifecycle-Befehle (`/merge`, `/split`, `/pause`, `/resume`) ermoeglichen die dynamische Strukturierung von Lanes. Das Context-Budget begrenzt den Export auf circa 200 Woerter pro Lane mit automatischer Kompression. Dreistufige Eskalationspfade formalisieren die Reaktion auf Stagnation: Stufe 1 (zwei Updates ohne Fortschritt) flaggt und schlaegt Scope-Reduktion vor, Stufe 2 (vier Updates) empfiehlt Pause oder Scope-Aenderung, Stufe 3 (sechs Updates) setzt ein STAGNANT-Tag und erfordert eine explizite Operator-Entscheidung.

P2-Features (Nice-to-have) umfassen automatische Handoff-Trigger, Task-Templates, ein Konflikt-Protokoll, ein Metriken-Dashboard, Retrospektive-Mechanismen, Partial Handoffs und Multi-Repo-Awareness.

### 9.3 Drei-Stufen-Evolutionsmodell

Die Entwicklung der Forschungsleitstelle folgt einem Drei-Stufen-Modell:

| Stufe | Version | Protokoll | UI | Paradigma |
|-------|---------|-----------|-----|-----------|
| 1 | v0.4 | Manueller `/update` | Copy-Paste | Human-as-Dispatcher |
| 2 | v0.5 | Batch-Update + Auto-Suggest | Log-File-Watching | Semi-autonome Koordination |
| 3 | v0.6+ | Auto-Handoff-Trigger | MCP-Integration | Programmable Orchestration |

Das Grundprinzip bleibt ueber alle Stufen konstant: Der Operator behaelt die Entscheidungshoheit. Automatisierung betrifft Routing und Mechanik, nicht Urteil und Priorisierung. Stufe 3 ist nicht "der Mensch wird ersetzt", sondern "der Mensch entscheidet schneller, weil die Mechanik automatisiert ist".

---

## 10. Limitationen und offene Fragen

Dieses Paper waere unvollstaendig ohne eine ehrliche Bestandsaufnahme dessen, was die Forschungsleitstelle nicht kann oder noch nicht gezeigt hat.

Die Skalierungsgrenzen sind real. Die kognitive Last des Operators steigt linear mit der Anzahl der Lanes, weil jede Lane Aufmerksamkeit, Entscheidungen und Copy-Paste-Interaktionen erfordert. Batch-Updates und Auto-Suggest mildern das, loesen es aber nicht. Jenseits von zehn Lanes wird das System unpraktikabel, sofern nicht ein signifikanter Teil der Koordination automatisiert wird -- was dem Human-as-Dispatcher-Prinzip teilweise widerspricht.

Die Reproduzierbarkeit ist eingeschraenkt. Zwei verschiedene Operatoren, die dieselbe Forschungsleitstelle mit denselben Lanes betreiben, werden unterschiedliche Ergebnisse erzielen, weil die Qualitaet der Koordination von der Qualitaet der menschlichen Entscheidungen abhaengt. Das ist kein Bug, sondern eine Konsequenz des Human-as-Dispatcher-Ansatzes -- aber es macht quantitative Evaluation schwieriger.

Es gibt derzeit keine quantitative Evaluation. Die Forschungsleitstelle ist beschrieben, implementiert und in der Praxis eingesetzt (einschliesslich der Koordination dieses Papers), aber es gibt keinen systematischen Vergleich mit alternativen Koordinationsmethoden. Fragen wie "Wieviel schneller ist die Arbeit mit Forschungsleitstelle vs. ohne?" oder "Wie viele Fehler verhindert die OQP?" sind empirisch noch nicht beantwortet. Eine solche Evaluation wuerde ein kontrolliertes Setup erfordern, das die natuerliche Variabilitaet von Forschungsprojekten beruecksichtigt -- methodisch anspruchsvoll, aber notwendig.

Die Modellabhaengigkeit ist relevant. Die Forschungsleitstelle wurde mit Claude entwickelt und getestet. Ob das Systemprotokoll mit GPT-4, Gemini oder Open-Source-Modellen gleichwertig funktioniert, ist nicht systematisch evaluiert. Die strukturierte Natur des Protokolls (feste Templates, definierte Zustaende, explizite Fehlerbehandlung) sollte die Portabilitaet erhoehen, aber das ist eine Hypothese, kein Befund.

Die Frage der optimalen Automatisierungsstufe bleibt offen. Das Drei-Stufen-Evolutionsmodell prognostiziert einen Weg von manueller zu semi-autonomer zu programmierbarer Orchestrierung. Aber wo genau die Grenze liegt, an der Automatisierung die Qualitaet der Koordination verbessert statt verschlechtert, ist unklar. Zu wenig Automatisierung macht den Operator zum Flaschenhals; zu viel Automatisierung nimmt ihm die Sichtbarkeit, die das System wertvoll macht.

---

## 11. Verwandte Arbeiten

Die Forschungsleitstelle baut auf Ideen aus mehreren Forschungsstroemungen auf und grenzt sich gleichzeitig von ihnen ab.

Im Bereich der Multi-Agent-Systeme sind Wu et al. (2023) mit AutoGen und Hong et al. (2023) mit MetaGPT die relevantesten Arbeiten. Beide Systeme implementieren autonome Agent-Koordination fuer Software-Engineering-Tasks. AutoGen nutzt Konversationsmuster zwischen Agents; MetaGPT weist Agents Rollen zu (Architekt, Entwickler, Tester) und laesst sie ein Software-Entwicklungsprozess durchlaufen. Li et al. (2023) mit CAMEL erforschen kommunikative Agenten, die durch Rollenspiel-Szenarien kooperieren. Park et al. (2023) simulieren mit Generative Agents eine Gemeinschaft von 25 AI-Agenten, die autonom interagieren -- eindrucksvoll, aber nicht auf strukturierte Forschungskoordination ausgelegt.

Die "Lost in the Middle"-Ergebnisse von Liu et al. (2023) liefern die empirische Grundlage fuer das Context-Window-Problem, das die Forschungsleitstelle adressiert. Ihre Ergebnisse zeigen, dass LLMs Informationen am Anfang und Ende des Kontexts deutlich besser verarbeiten als Informationen in der Mitte -- ein fundamentales Problem fuer jeden Ansatz, der auf grosse Kontextfenster als Loesung setzt.

Das Mediator-Pattern aus der Design-Patterns-Literatur (Gamma et al., 1994) ist der naechste architektonische Verwandte. Das Muster beschreibt ein Objekt, das die Interaktion zwischen anderen Objekten kapselt und zentralisiert. Die Forschungsleitstelle implementiert dieses Muster, ersetzt aber den Software-Mediator durch einen AI-gestuetzten menschlichen Mediator.

Anthropics eigene Arbeiten zu Context Engineering und effektiven Agent-Architekturen (2025/2026) bilden die methodische Grundlage. Insbesondere die Empfehlung, Multi-Agent-Architekturen als Context-Engineering-Strategie einzusetzen -- Aufgaben auf Sub-Agenten mit sauberen Kontextfenstern verteilen -- ist genau das, was die Forschungsleitstelle auf Projektebene implementiert.

Die akademische Arbeit zu "Agentic Context Engineering" (arXiv:2510.04618) mit dem Konzept von "Evolving Contexts for Self-Improving Language Models" ist fuer den `/export`-Mechanismus relevant: Das System speichert seinen eigenen Zustand in einem Format, das es spaeter parsen und fortsetzen kann -- ein Kontext, der sich selbst verbessert.

Googles Developer Guide zu Multi-Agent-Patterns in ADK (2025) liefert den formalsten Pattern-Katalog und definiert den Coordinator/Dispatcher Pattern als Industriestandard. Der entscheidende Unterschied zur Forschungsleitstelle: In allen dokumentierten Patterns ist der Dispatcher ein AI-Agent. Die Forschungsleitstelle ist die erste dokumentierte Implementierung, in der der Dispatcher ein Mensch ist, unterstuetzt durch einen AI-Agent.

---

## 12. Fazit

Die Forschungsleitstelle leistet drei Beitraege, die in der aktuellen Landschaft der Multi-Agent-Systeme einzigartig sind.

Der erste Beitrag ist das **Human-as-Dispatcher Pattern** als neue Rollendefinition des Menschen in Multi-Agent-Systemen. Der Mensch ist nicht Fallback, nicht Qualitaetskontrolle am Ende einer Pipeline und nicht optionaler Supervisor -- sondern aktiver Koordinator, Uebersetzer und Gedaechtnis im Zentrum eines Agent-Netzwerks. Der Begriff "Human-as-Dispatcher" existiert nicht als etabliertes Pattern in der aktuellen Literatur; er ist ein eigener Beitrag dieses Papers. Die Forschung zeigt, dass die Rolle des Menschen sich verschiebt, je praeziser AI-Agents werden -- von routinemaessiger Ueberwachung zu strategischen Entscheidungen. Die Forschungsleitstelle formalisiert diese strategische Rolle als System.

Der zweite Beitrag ist **Zero-Infrastructure Context Engineering**. Ein vollstaendiges Koordinationssystem fuer parallele AI-Agents, implementiert als einzelne Markdown-Datei. Keine Code-Infrastruktur, kein Framework, kein Server. Das ist kein Minimalismus um seiner selbst willen, sondern eine Designentscheidung mit praktischen Konsequenzen: niedrigste Einstiegshuerde, maximale Portabilitaet, kein Vendor-Lock-in. In einer Welt, in der jedes Multi-Agent-Framework Python-Infrastruktur und spezifische APIs erfordert, ist ein System, das mit Copy-Paste und einem Markdown-File funktioniert, eine Aussage.

Der dritte Beitrag ist **Structured Synthesis** als explizite Kernfunktion. Die Lane-uebergreifende Mustererkennung -- das Erkennen von Konvergenzen, geteilten Methoden und wiederverwendbaren Ergebnissen ueber Projektgrenzen hinweg -- ist in keinem der verglichenen Frameworks implementiert. Selbst Claude Code Agent Teams, die innerhalb eines Repos synthetisieren koennen, haben keine Funktion fuer Cross-Projekt-Synthese. In der Forschung, wo die wertvollsten Erkenntnisse oft an den Schnittstellen zwischen Projekten liegen, ist das ein signifikanter Mehrwert.

Die Forschungsleitstelle ist kein Ersatz fuer Agent Teams, CrewAI oder LangGraph. Sie ist der Methoden-Layer darueber -- Layer 0 in einem Stack, in dem die Ausfuehrungsschicht austauschbar ist. Ein Forscher, der morgen drei parallele Projekte mit AI-Agents koordinieren will, braucht keine neue Software. Er braucht ein Protokoll, das seine Entscheidungen strukturiert, seine Informationsfluesse sichtbar macht und die Erkenntnisse ueber Projektgrenzen hinweg synthetisiert. Dieses Protokoll ist die Forschungsleitstelle.

---

## Anhang

### A. Glossar

| Begriff | Definition |
|---------|-----------|
| Lane | Eigenstaendiger Arbeitsstream innerhalb der Forschungsleitstelle. Repraesentiert ein Forschungsprojekt, eine Implementierung oder eine Infrastrukturkomponente. |
| Operator | Der menschliche Forscher, der die Forschungsleitstelle bedient und die Lane-Agents koordiniert. |
| Lane-Agent | Eine Claude-Code-Instanz (oder vergleichbarer AI-Agent), die in einem separaten Terminal auf einer Lane arbeitet. |
| Mode | Aktueller Zustand einer Lane (IDLE, PLANNING, WORKING, REVIEW, BLOCKED, PAUSED, DONE). |
| Horizon | Naechste externe Deadline oder Meilenstein einer Lane. |
| Handoff | Strukturierter Transfer von Ergebnissen von einer Lane zu einer anderen. |
| OQP | Operator Query Phase -- obligatorischer Schritt zur Identifikation und Klaerung von Annahmen vor der Task-Formulierung. |
| Infra-Lane | Lane vom Typ `infra`, die keine Aufgaben empfaengt, sondern Wissensanfragen beantwortet. |
| Synthesis | Kernfunktion der Forschungsleitstelle: Erkennung von Cross-Lane-Mustern, die kein einzelner Agent sehen kann. |
| Context Engineering | Systematische Gestaltung des gesamten Informationsflusses zu einem LLM -- ueber den einzelnen Prompt hinaus. |
| Human-as-Dispatcher | Architekturpattern, bei dem ein Mensch als aktiver Koordinator (nicht als passiver Reviewer) im Zentrum eines Multi-Agent-Netzwerks agiert. |
| Star-Topologie | Kommunikationsstruktur, bei der alle Informationsfluesse ueber den Operator laufen und kein Agent direkt mit einem anderen kommuniziert. |
| CLAUDE.md | Die Markdown-Datei, die das vollstaendige Systemprotokoll der Forschungsleitstelle enthaelt. |

### B. Quick-Start-Anleitung

**In 5 Minuten zur ersten Forschungsleitstelle.**

**Schritt 1: CLAUDE.md herunterladen.** Die aktuelle Version liegt im Repository. Das ist die einzige Datei, die benoetigt wird.

**Schritt 2: Koordinations-Terminal oeffnen.** Einen Claude-Code-Agenten starten und die CLAUDE.md als System Prompt laden (oder den Inhalt in das erste Prompt-Feld kopieren). Die Forschungsleitstelle meldet sich mit: "Forschungsleitstelle v0.4 aktiv. Warte auf Eingabe."

**Schritt 3: Lanes definieren.** Dem Koordinations-Agenten die Projekte beschreiben -- Name, Scope, aktueller Stand, naechster Schritt, Abhaengigkeiten. Die Forschungsleitstelle baut das Status Board auf und stellt Rueckfragen ueber die Operator Query Phase.

**Schritt 4: Lane-Terminals oeffnen.** Fuer jede Lane einen separaten Claude-Code-Agenten in einem eigenen Terminal starten. Diese Agents bekommen keine CLAUDE.md, sondern die Task-Instruktionen, die die Forschungsleitstelle formuliert.

**Schritt 5: Koordinieren.** Task-Instruktionen aus dem Koordinations-Terminal kopieren und in die Lane-Terminals einfuegen. Ergebnisse von den Lane-Agents zurueck an die Forschungsleitstelle melden via `/update N`. Handoffs zwischen Lanes via `/handoff N->M` anstoessen. Am Ende der Session `/export` ausfuehren und das State-Dokument fuer die naechste Session speichern.

**Tipp:** Mit `/next` priorisiert die Forschungsleitstelle die naechsten Schritte. Mit `/synth` zeigt sie Lane-uebergreifende Muster. Mit `/status` gibt sie den Gesamtueberblick. Die drei Befehle, die man am haeufigsten braucht.

### C. Referenzen

1. Liu, N. F., Lin, K., Hewitt, J., Paranjape, A., Bevilacqua, M., Petroni, F., & Liang, P. (2023). Lost in the Middle: How Language Models Use Long Contexts.
2. Wu, Q., et al. (2023). AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation.
3. Hong, S., et al. (2023). MetaGPT: Meta Programming for Multi-Agent Collaborative Framework.
4. Li, G., et al. (2023). CAMEL: Communicative Agents for "Mind" Exploration of Large Language Model Society.
5. Park, J. S., et al. (2023). Generative Agents: Interactive Simulacra of Human Behavior.
6. Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). Design Patterns: Elements of Reusable Object-Oriented Software.
7. Wooldridge, M., & Jennings, N. R. (1995). Intelligent Agents: Theory and Practice. The Knowledge Engineering Review.
8. Anthropic. (2025). Effective Context Engineering for AI Agents.
9. Anthropic. (2025). Effective Harnesses for Long-Running Agents.
10. Anthropic. (2025). Building Effective Agents.
11. Gartner. (2025). Context Engineering Is In, Prompt Engineering Is Out.
12. Ye, J., et al. (2025). Agentic Context Engineering. arXiv:2510.04618.
13. Google. (2025). Developer's Guide to Multi-Agent Patterns in ADK.
14. Anthropic. (2026). Claude Code Agent Teams Documentation.
