# DRIO Eats — AI Agent Engineering Rules

These instructions apply to every coding task in this repository. They take precedence over generic model knowledge, outdated examples, and assumptions.

## 1. Retrieval-first development

- Never guess framework APIs, configuration options, package behavior, or version compatibility.
- Before implementing unfamiliar or version-sensitive code, retrieve the relevant official documentation.
- Inspect the installed package versions in `package.json` and the lockfile before selecting APIs.
- Prefer documentation matching the exact installed version.
- Use official documentation, official examples, installed package types, and actual source code as evidence.
- Use local `grep`, `rg`, and source inspection to verify existing implementations and APIs.
- If documentation and installed package behavior disagree, investigate rather than guessing.
- Never invent methods, imports, configuration properties, decorators, or package capabilities.
- If something cannot be verified, explicitly identify the uncertainty before relying on it.

## 2. Mandatory Expo workflow

For EVERY task involving Expo or React Native within this Expo project:

1. Load `expo-overview` FIRST.
2. Identify the relevant Expo SDK version from the installed project.
3. Load the task-specific Expo skill before implementation.
4. Retrieve version-compatible official Expo documentation when necessary.
5. Inspect existing project patterns before changing architecture or components.
6. Use the installed package versions and their actual APIs.

Relevant skills include:
- `expo-overview`
- `expo-router`
- `expo-native-ui`
- `expo-animation`
- `expo-data-fetching`
- `expo-examples`
- `expo-dev-client`
- `expo-upgrade`

Only load skills relevant to the task. Do not merely announce that a skill was loaded: apply its actual guidance.

## 3. Mandatory NestJS workflow

For EVERY NestJS backend task:

1. Load `nestjs-best-practices`.
2. Inspect the installed NestJS version and relevant dependencies.
3. Retrieve the corresponding official NestJS documentation.
4. Inspect the existing module, provider, controller, DTO, service, and database patterns.
5. Follow existing architecture unless there is a demonstrated reason to change it.
6. Verify framework APIs against documentation or installed package types.

Important project-specific overrides:

- Database: Neon PostgreSQL with Drizzle ORM.
- Validation: Zod.
- Do not introduce TypeORM, Prisma, or class-validator simply because a generic skill recommends them.
- Use existing authentication and authorization architecture.
- Respect existing module boundaries and dependency injection.
- Do not duplicate database access or business logic across controllers.
- Use transactions where multiple related database changes require atomicity.
- Preserve existing API contracts unless a change is explicitly required.

## 4. Project-specific technology boundaries

Before implementation, inspect the relevant workspace and its package dependencies.

- Mobile: Expo / React Native.
- Backend: NestJS.
- Database: Neon PostgreSQL and Drizzle ORM.
- Validation: Zod.
- State management: Zustand.
- Caching and suitable transient state: Redis.

Do not introduce another library or architectural pattern without a concrete requirement and compatibility verification.

Do not assume that a library's latest online examples are compatible with the installed version.

## 5. Alignment before implementation

For substantial or ambiguous tasks:

- Clarify missing requirements before coding.
- Identify affected screens, modules, routes, database entities, and external integrations.
- Map the requested behavior to the existing implementation.
- Identify dependencies, constraints, and potential regressions.
- Produce a concise implementation specification when the task warrants one.
- Break substantial work into independently verifiable tasks.

Use grilling/questioning and specification skills when useful. Do not turn simple, clearly specified fixes into lengthy planning exercises.

If requirements are already sufficiently clear, proceed.

## 6. Existing-codebase preservation

- Read relevant files before modifying them.
- Understand the existing execution flow and dependencies.
- Make the smallest coherent change that solves the actual problem.
- Do not rewrite working modules to impose personal architectural preferences.
- Do not create duplicate utilities, providers, services, or components.
- Do not remove existing functionality without explicit justification.
- Do not fabricate files, APIs, routes, or functionality.
- Avoid speculative refactoring and unrelated cleanup.

## 7. Verification is part of implementation

After making changes, run the relevant checks:

- TypeScript type checking.
- Linting.
- Unit tests.
- Integration or API tests where relevant.
- Expo export/build checks for mobile changes.
- Actual runtime or UI verification when the task concerns visible behavior.
- Database migration and schema verification when database changes are involved.

Do not report a check as successful unless it was actually executed and its result inspected.

Distinguish clearly between:
- Implemented.
- Type-checked.
- Unit-tested.
- Integration-tested.
- Build-tested.
- Runtime-verified.

A successful TypeScript check does not prove an application works.

## 8. Execution behavior

- Execute the requested work rather than repeatedly producing plans and audits.
- Do not stop after identifying issues; fix the issues within the authorized scope.
- Do not repeatedly ask for confirmation when the user has already authorized implementation.
- Ask only when an essential decision is genuinely missing.
- Do not expand the scope without a good reason.
- Provide concise progress updates and evidence-based completion reports.

## 9. Final report

Report:

1. What changed.
2. Which files or modules were affected.
3. Which skills and documentation were consulted.
4. Which tests and checks were actually run.
5. Their actual results.
6. Any remaining limitations or unverified behavior.

Never claim complete verification when only static checks or builds were performed.

## Mandatory Expo 58 Competency Gate (AI sessions)

For every task:
1. Load expo-overview first for Expo/RN work; then task-specific skills.
2. Inspect installed versions before version-specific advice (Expo SDK 58, Expo Router 58.0.30, RN 0.88.x baseline).
3. Research official docs for the installed version before implementing.
4. Safe-area: use eact-native-safe-area-context (SafeAreaView/useSafeAreaInsets), never RN core SafeAreaView; avoid double insets; Expo Router provides safe-area context.
5. Preserve DRIO Eats design system tokens/components/visual identity; no redesign.
6. Workflow: Understand -> Research -> Inspect -> Implement -> Verify -> Report.
7. Report evidence: skills loaded, docs consulted, versions, decisions, verification.
8. Stop if prerequisites (skills, docs, versions, API verification) are missing.

Available project skills: .claude/skills/{expo-overview,expo-native-ui,expo-design-system,expo-animation}.
expo-router is NOT an installed skill; use official Expo Router docs.
