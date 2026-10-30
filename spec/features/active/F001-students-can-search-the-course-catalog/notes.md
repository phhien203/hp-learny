# Catalog search

The catalog loader reads `q` as `getCourses.title` and passes `categoryId` to the existing published-course query. The database filter retains its existing case-sensitive PostgreSQL `LIKE` behavior and literal wildcard escaping.

`SearchInput` starts from the URL value. Only input events schedule debounced navigation; mounting does not write the URL. Each input tracks its submitted URL so a completed search does not overwrite newer typing or cancel its debounce. External URL changes synchronize both mounted desktop/mobile inputs and cancel pending edits; unmounting clears the timer. Search navigation copies existing query parameters and deletes `q` when empty. The existing category controls are restored without a second filtering mechanism.

The input has an accessible name. The course-list empty state suggests changing the term or category.

The committed lockfile originally lacked 15 optional Rollup platform entries. `npm ci`, `npm ci --omit=optional`, and `npm ci --legacy-peer-deps` failed validation. `npm install --package-lock-only --ignore-scripts` restored those entries; no existing package versions changed. Installation then succeeded with `npm ci`.

Browser evidence uses actual catalog, navbar, category, search-input, and course-list components in a local fixture with synthetic courses and a fixture loader. Clerk's user button is omitted, and the catalog server loader is removed only in the temporary fixture transform. This proves browser interaction and responsive layout, not authenticated application or database integration. No production credentials or migrations are used.

Durable verification artifacts are outside the candidate worktree at `/home/worker/projects/hp-learny/.limen/jobs/2026-10-30-issue-9-task-6523617520-6a94fa58/evidence/`. Desktop and mobile screenshots show direct `q=Piano&categoryId=music` navigation and no-match search. Browser assertions cover refresh, typing, category preservation, keyboard clearing, removal of `q`, and restoration of the two fixture music courses.

The first independent review found that a delayed loader could discard newer typing. The 600 ms delayed-loader regression now retains `Piano` after submitting `Pi` and typing `ano` while the first navigation is outstanding. Both viewports also pass direct navigation, refresh, category/clear/no-match scenarios, and Back/Forward synchronization with the same loader delay. See `fixed-browser-results.json` and `mobile-delayed-fixed.png` in the artifact directory. The actual catalog loader and `getCourses` also passed an isolated SQL-generation smoke with stubbed Clerk/database boundaries (`loader-smoke.json`); no SQL was executed.

Full application startup without credentials fails at Stripe construction with `Neither apiKey nor config.authenticator provided`. `DATABASE_URL`, `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `STRIPE_API_KEY` are absent. Authenticated SSR/hydration and real database results require a nonproduction runtime environment.
