# Guesso

Guesso is an ultra-fast Canvas LMS client built for students. Help students find their coursework, understand what is due, and get back to their work.

Keep the implementation small. Understand the constraint before adding an abstraction, dependency, or background process. Existing complexity is not a reason to preserve it.

## What we protect

### Speed is part of the product

Students open their LMS between classes, on phones, and with unreliable connections. Every extra request and blocking interaction costs them time.

- Start independent requests together. Avoid request waterfalls and one request per list item where Canvas offers a suitable batch or include option.
- Fetch what the current view needs. Prefer pagination for growing lists; use `canvasAllPages` only when the feature needs the complete collection.
- Keep existing content visible during refreshes where possible. Distinguish initial loading, refresh, empty results, and failure.
- Avoid unnecessary reactive effects, repeated sorting during rendering, and continuously repainting animations. Consider bundle size before adding a dependency.
- Measure performance claims. For changes to fetching or large lists, check request count, payload size, or rendering cost as appropriate.

### Students must be able to trust what they see

A wrong deadline or a false submission confirmation is worse than a slow page.

- Canvas is the source of truth for coursework, grades, and submissions. Do not infer success from a click or treat a failed request as an empty result.
- Preserve the difference between ungraded, missing, excused, and a grade of zero. Likewise, no due date does not mean no assignment.
- Handle time zones explicitly. Preserve date-only values and distinguish due dates from availability and lock dates.
- Show submission success only after Canvas confirms it. Prevent duplicate sends, preserve drafts on failure, and provide a useful recovery path.
- After a mutation, refresh or update every affected view. Reversible actions need a way back, including unfavoriting a course or undoing a local filter.

### Keep student workflows obvious

- Use shadcn-svelte components wherever possible. Reuse the components in `src/lib/components/ui/`, and add the appropriate shadcn-svelte component when one is missing before building a custom control.
- Never use eyebrow text, the small label placed above a heading.
- Question every page, section, and card header. Include a heading only when it helps students orient themselves or understand the content. Omit headings that repeat the navigation, restate obvious content, or merely fill space. Preserve semantic headings where they help assistive navigation.
- Prioritize reading coursework, finding deadlines, checking grades, and communicating. Do not expand into instructor or administrator workflows unless requested.
- Use familiar Canvas terminology. A course, assignment, submission, module, and calendar event are different things.
- Make navigation and actions work with a keyboard and touch. Preserve focus indicators, accessible names, readable contrast, and reduced-motion preferences.
- Check narrow and wide layouts, long course names, and courses with little or no content. Hover must not be the only way to discover an action.
- When a Canvas feature is unsupported, make that clear and link to the original Canvas page when possible.

## How the project works

The app uses Svelte 5, SvelteKit, TypeScript, and Tailwind CSS 4. It uses Bun for dependencies and scripts. Vite configures the Vercel adapter, async Svelte support, and SvelteKit remote functions.

- `src/routes/` contains pages and layouts. `src/routes/(app)/` contains the dashboard, courses, calendar, and inbox routes.
- `src/lib/remote/canvas/*.remote.ts` exposes Canvas queries and commands, grouped by Canvas resource.
- `src/lib/server/canvas.ts` handles authenticated HTTP requests, pagination, error translation, and shared input helpers.
- `src/lib/components/ui/` contains the existing shadcn-svelte and Bits UI primitives. Reuse them before creating competing controls.
- `src/routes/layout.css` contains shared styles and theme tokens.
- `vite.config.ts` contains the SvelteKit and deployment configuration.

Keep Canvas transport details in the server helper and resource operations in remote functions. Pages should focus on presentation and interaction. Use Svelte 5 runes and existing remote query patterns rather than introducing a second state or fetching framework.

Prefer inferred types. Define the Canvas response fields a feature uses instead of spreading casts or `any` through components. TypeScript inputs do not validate network requests: remote functions using `unchecked` still need runtime checks at the boundary.

## Working with Canvas

The current connection uses server-private `CANVAS_INSTANCE_URL` and `CANVAS_API_TOKEN`. This is a configured Canvas account, not an implemented per-student sign-in system. Do not assume account isolation exists.

- Keep tokens on the server. Never put them in public environment variables, browser storage, logs, screenshots, or committed fixtures.
- Use the configured Canvas instance. Do not hardcode a school domain or localhost origin into client code.
- Follow Canvas pagination links and preserve the same-origin check before sending credentials to a next-page URL.
- Respect rate limits. Avoid unbounded parallel requests, aggressive polling, and automatic retries of submissions or messages.
- Treat Canvas HTML as untrusted when rendering rich content. Use a deliberate sanitization policy before introducing `{@html}` for API content.
- Account for school configuration and permissions. A disabled feature, locked assignment, or forbidden request needs an appropriate state in the UI.
- Use synthetic or redacted student data for fixtures. Never commit real grades, messages, submissions, or credentials.
- Do not submit coursework, send messages, or modify a real Canvas account while testing unless the maintainer explicitly authorizes that action. Prefer mocked responses or a designated test account.

## Development and verification

- `bun install` installs dependencies using `bun.lock`.
- `bun run dev` starts Vite. Read its output for the actual address and port.
- `bun run check` runs SvelteKit sync and Svelte/TypeScript checks.
- `bun run build` checks the production build when changes affect bundling, server/client boundaries, or deployment.
- `bun run lint` checks formatting and ESLint across the project. For small changes, target changed files with `bunx prettier --check <files>` and `bunx eslint <files>` where applicable.
- `bun run format` rewrites formatting across the project. Prefer formatting only the files you changed.

There is currently no test script configured. Do not claim tests passed when only lint or type checks ran. For new logic, add focused behavioral coverage when appropriate; avoid tests that only repeat implementation details. Prioritize pagination, date handling, error recovery, and mutation outcomes over assertions about component wiring.

Use the smallest verification that proves the change. Documentation-only edits need a content and formatting review, not an app build. Report what you checked and what remains unverified.

Ask before launching browsers or using computer automation unless the maintainer already requested it. When an integrated UI check is authorized, cover the affected workflow once, including its loading, empty, and error states.

Do not stop unrelated dev servers. Track processes you start and stop only those processes. Never kill processes by matching a name or worktree path. Keep local secrets and personal data out of cleanup commands.

## Before calling a change done

- Follow the behavior through each existing entry point and affected page. A course favorite change can affect both the course view and dashboard.
- Check direct navigation and reloads, not just navigation from another page. Keep server rendering and browser-only APIs separated.
- Consider slow requests, expired credentials, pagination, and failed mutations where relevant.
- Keep shared state consistent without caching one account's private data for another.
- Preserve unrelated work. Avoid broad refactors and dependency changes that the task does not need.

## Documentation and collaboration

Explain the problem, the change, and the evidence that it works. State assumptions and limitations plainly. Ask when a product decision materially changes the task; handle routine implementation choices yourself.

Update documentation when setup, usage, or an architectural constraint changes. Keep local implementation explanations next to the code. Do not add feature inventories, agent work logs, or implementation plans to the repository.

Create commits or pull requests only when requested. Use plain, conventional titles such as `fix(calendar): preserve date-only deadlines`. Keep each change focused on one concern.
