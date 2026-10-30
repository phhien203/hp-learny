# Catalog search

The catalog loader reads `q` as `getCourses.title` and passes `categoryId` to the existing published-course query. The database filter retains its existing case-sensitive PostgreSQL `LIKE` behavior and literal wildcard escaping.

`SearchInput` starts from the URL value. Only input events schedule debounced navigation; mounting does not write the URL. URL changes synchronize both mounted desktop/mobile inputs and cancel pending edits. Search navigation copies existing query parameters and deletes `q` when empty. The existing category controls are restored without a second filtering mechanism.

The input has an accessible name. The course-list empty state suggests changing the term or category.

The committed lockfile originally lacked 15 optional Rollup platform entries. `npm ci`, `npm ci --omit=optional`, and `npm ci --legacy-peer-deps` failed validation. `npm install --package-lock-only --ignore-scripts` restored those entries; no existing package versions changed. Installation then succeeded with `npm ci`.

Browser evidence uses actual catalog, navbar, category, search-input, and course-list components in a local fixture with synthetic courses and a fixture loader. Clerk's user button is omitted, and the catalog server loader is removed only in the temporary fixture transform. This proves browser interaction and responsive layout, not authenticated application or database integration. No production credentials or migrations are used.

Durable verification artifacts are outside the candidate worktree at `/home/worker/projects/hp-learny/.limen/jobs/2026-10-30-issue-9-task-6523617520-6a94fa58/evidence/`. Desktop and mobile screenshots show direct `q=Piano&categoryId=music` navigation and no-match search. Browser assertions cover refresh, typing, category preservation, keyboard clearing, removal of `q`, and restoration of the two fixture music courses.
