This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Mandatory Expo Skills Workflow

This is a permanent requirement for **all** Expo / Expo Router / React Native (Expo project) / Expo-package work in DRIO Eats.

1. **Always load `expo-overview` first** (even for simple tasks or known SDK versions). Let it route to specialized skills.
2. **Select and read only relevant specialized skills** for the actual task (e.g. `expo-router` for layouts/navigation/tabs/routes, `expo-native-ui` for native screen presentation, `expo-design-system` for theme/tokens/reusable components, `expo-animation`, `expo-data-fetching`, `expo-examples`, `expo-dev-client`, `expo-upgrade`, `eas-simulator` as needed). Do **not** list skills without applying their guidance.
3. **Use official, version-appropriate documentation and installed package APIs** (current baseline: Expo SDK 58). Prefer https://docs.expo.dev/skills.md, https://docs.expo.dev/agents.md, https://docs.expo.dev/llms.txt, and https://docs.expo.dev/versions/v58.0.0/ over assumptions/outdated examples. Use Expo MCP tooling when available and relevant. Do not upgrade SDK/deps just to solve an unrelated issue.
4. **Inspect existing architecture before changing code; respect working code.** Do not invent unsupported APIs/props or blindly replace the root `Stack`/route architecture.
5. **Verify with actual execution** (lint/typecheck and relevant runtime/tooling). Do not claim runtime success based only on static checks or export.

Official skills repo/catalog: https://github.com/expo/skills. If skills are missing, install via `pnpm dlx skills add expo/skills` (or `npx skills add expo/skills`) and verify they are discoverable; do not duplicate installs unnecessarily.

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
