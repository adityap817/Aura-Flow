Here is the official Product Blueprint and technical documentation for **Aura-Flow**. This document is structured like a professional PRD (Product Requirements Document) that you would hand to an engineering team (or in this case, to Antigravity) to start building.

---

# Product Blueprint: Aura-Flow

**Version:** 1.0
**Product Type:** Autonomous AI Engineering Orchestrator
**Primary Domain:** AI & Software Engineering

## 1. Executive Summary

**Aura-Flow** is an autonomous AI engineering team that takes a software issue, researches the codebase, writes the fix, and runs automated tests to verify the code without human intervention. Building upon the foundation of the original Aura triage agent, Aura-Flow bridges the gap between identifying a problem and deploying a tested, verified solution.

## 2. Problem Statement

The modern software development lifecycle (SDLC) is plagued by context-switching and manual overhead. While standard AI assistants (like ChatGPT or Copilot) can generate code snippets, they lack *autonomy* and *contextual awareness*.

* **The Gap:** Developers still have to manually research the codebase, paste snippets, stitch files together, and write the unit tests to ensure the AI's code didn't break existing logic.
* **The Solution:** An agentic workflow that loops through Research, Execution, and Verification autonomously, only requiring human approval at the final pull request.

## 3. Core Features & Product Scope

Aura-Flow operates as a multi-agent system governed by a **Supervisor Agent** that delegates tasks to specialized workers.

* **The Researcher (Context Gathering):** Connects to local file systems, vector databases, and external graph databases to understand the system architecture and the specific bug/feature request.
* **The Coder (Execution):** Ingests the Researcher's context and writes the actual code, modifying local files directly via the Model Context Protocol (MCP).
* **The Verifier (QA & Testing):** Autonomously writes and executes test cases. It applies robust methodologies—like equivalence partitioning and boundary value analysis—to rigorously test the Coder's output against the original issue. If a test fails, it kicks the issue back to the Coder with the error logs.
* **Live Reasoning Dashboard:** A web-based UI that streams the real-time "thoughts" and terminal actions of the agents, allowing the human manager to monitor the process.

## 4. Target Architecture & Tech Stack

To ensure this project hits the highest standards for 2026, we are using a stateful, graph-based architecture.

| Component | Technology | Rationale for Selection |
| --- | --- | --- |
| **Agent Orchestration** | **LangGraph** (Python) | Allows for cyclic, stateful workflows (loops) necessary for the "Code -> Test -> Fail -> Recode" loop, unlike standard linear chains. |
| **Core AI Models** | **Claude 3.5 Sonnet / GPT-4o** | State-of-the-art reasoning and coding capabilities. |
| **Backend & API** | **FastAPI** (Python) | High-performance, async framework perfect for streaming agent reasoning via Server-Sent Events (SSE). |
| **Frontend UI** | **Next.js + Tailwind CSS** | For building a highly responsive, aesthetic dashboard featuring a sleek glassmorphism UI to track agent progress. |
| **Context Integration** | **Model Context Protocol (MCP)** | The industry standard for allowing AI models to securely read local files, execute terminal commands, and query external databases. |
| **Knowledge/Memory** | **Neo4j (GraphDB) / SQLite** | SQLite for short-term agent memory; GraphDB integrations for deep contextual retrieval. |

## 5. The "Portfolio Flex" (Ecosystem Integration)

To truly stand out, Aura-Flow won't just be tested on dummy data. You will configure the **Researcher Agent** to directly interface with your existing projects.

For example, when tasked with building a new API route for a complex data structure, the Researcher will use MCP to query an external knowledge graph—like the Hazard-KG—to instantly understand the domain entities, relationships, and safety constraints before the Coder writes a single line of Express.js backend logic. This proves you can build interconnected, enterprise-scale AI ecosystems.

## 6. Development Phases (The Blueprint)

### Phase 1: The Engine (Backend & Orchestration)

* Set up the FastAPI server.
* Define the LangGraph nodes (Supervisor, Researcher, Coder, Verifier).
* Implement state management so the agents can share the same memory space during a task.

### Phase 2: The Hands (MCP & Tooling)

* Equip the Coder with terminal access to create and edit files.
* Equip the Verifier with the ability to run `npm test` or `mvn test` and capture the `stdout`/`stderr` logs.

### Phase 3: The Face (Frontend UI)

* Build the Next.js dashboard.
* Implement WebSockets or SSE to stream the terminal output and agent reasoning to the browser in real-time.

---

**Next Step:** We can either generate the exact prompt to feed into Antigravity to start coding **Phase 1: The Engine**, or we can break Phase 1 down into smaller Jira-style user stories. Which do you prefer?