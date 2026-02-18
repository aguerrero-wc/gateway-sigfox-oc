# PROJECT CONTEXT & MANDATORY INSTRUCTIONS

## ⚠️ CRITICAL INSTRUCTION FOR AI AGENTS ⚠️
**READ THIS FIRST.**
This project is **AGNOSTIC** of the specific AI Agent system being used (Cursor, Windsurf, OpenCode, Terminal Agent, etc.).
Regardless of the tool you are using, you **MUST** load and internalize the context from the files listed below **BEFORE** executing any task code. Failing to do so results in architectural incoherence and is considered a failure.

## 1. PROJECT MAP & DEFINITIONS
The source of truth for the project structure and rules is located in the `.instructions/` directory and the root files.

### 📂 CONTEXT FILE LOADING ORDER
You must read these files in this specific order to understand the architecture:

1.  **`SYSTEM_RULES.md`** (ROOT)
    *   *Purpose:* Contains the core coding standards, naming conventions, and NestJS best practices.
    *   *Action:* Apply these rules to every single line of code you write.

2.  **`.instructions/architecture.md`**
    *   *Purpose:* Defines the layered architecture, module communication, and database schema strategies.
    *   *Action:* Verify where your task fits within the macro-architecture.

3.  **`AGENTS.md`** (ROOT)
    *   *Purpose:* Defines your specific persona and limitations.


## 2. CURRENT TASK CONTEXT
The specific requirements for your current job are located in the `tasks/` folder (referenced by the user in the prompt).
*   **DO NOT** invent new patterns.
*   **DO NOT** ignore existing relationships (e.g., Device <-> DeviceMessage).

## 3. SPECIFIC DOMAIN RULES (SIGFOX)
*   **Database:** TypeORM with PostgreSQL.
*   **Entities:** We are currently adding `Location` and `DeviceLocationHistory`.
*   **Validation:** Use `class-validator` and DTOs strictly.

## 4. OPERATIONAL SKILLS LAYER (Executable)
*Defines your capabilities within the infrastructure.*
*   **`.skills/docker-deploy.md`**: Deployment tiers, recovery protocols, and hot-reload rules.
    *   *Trigger:* Use this when asked to "deploy", "fix startup", or "restart".

---
**SUMMARY:**
If the user asks you to implement "Task-00X", your process is:
1. READ `PROJECT_CONTEXT.md` (This file).
2. READ `SYSTEM_RULES.md` & `.instructions/architecture.md`.
3. READ the specific task file (e.g., `.instructions/tasks/`).

4. EXECUTE code generation.