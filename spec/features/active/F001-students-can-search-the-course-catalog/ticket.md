---
opened: 2026-10-30
---

# F001 · Students can search the course catalog

## Outcome

Students can find courses by title on desktop and mobile. Search links retain their term and category when opened or refreshed.

## Scope

- Restore the existing catalog search input and server-side title filtering.
- Keep search text and the `q` query parameter synchronized.
- Preserve category selection while searching or clearing the term.
- Show a useful message when no courses match.

## Out of scope

- Database schema or migrations.
- Authentication, payment behavior, and production credentials.
- Approval, merge, push, or deployment.

## Acceptance

- Search is visible and usable on desktop and mobile.
- Typing updates `q`; opening and refreshing a URL with `q` preserves the input value.
- Search preserves the selected category.
- Clearing search removes `q` and restores courses in the selected category.
- A search with no matches shows a useful empty state.
- Typecheck, lint, build, and browser scenarios have recorded results; schema, authentication, and payments remain unchanged.

## Notes

Implements GitHub issue #9. Implementation and independent review use `--engine omp --provider openai-codex --model gpt-6.1-sol --thinking medium`. The candidate remains local for separate owner authorization.
