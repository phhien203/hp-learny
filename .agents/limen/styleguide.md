# Styleguide

> Project-owned coding practice for every coordinator, worker, and reviewer turn. Keep this file at or below 1000 lines. The injected copy is capped at 1000 lines. Edit this file to change how agents write and organize code here. It is not product scope and not speech.

## Shape

- Register URLs in `app/routes.ts`. Use route loaders for reads and actions for mutations.
- Keep route-specific components near their routes. Share reusable UI through `app/components`.
- Keep secrets and service access server-side. Isolate browser-only editors and upload widgets from SSR.

## Prefer

- Use strict TypeScript and `~/` app imports. Follow Prettier: single quotes, no semicolons, trailing commas, and an 80-column print width.
- Use Conform and Zod for forms. Validate inputs on the server.
- Check authentication, roles, ownership, and course access on the server.
- Reuse Tailwind and Radix components. Provide labels, keyboard access, and visible error states.
- Change the Drizzle schema with reviewed, committed migrations. Keep the initial bootstrap SQL fixed.
- Run lint and typecheck for code changes, plus a direct check of the changed user flow. Verify UI changes in a browser.

## Avoid

- Do not rely on client-only authorization or expose service credentials.
- Do not add libraries or abstraction layers when existing code meets the need.
- Avoid unrelated formatting, silent error handling, and tests tied only to implementation details.
