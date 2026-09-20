# Pet LMS

Pet LMS is a course platform where teachers create and publish courses with chapters, videos, and attachments, and students enroll and track their progress.

## Tech stack

| Area            | Technology                                                               |
| --------------- | ------------------------------------------------------------------------ |
| App             | TypeScript, React 18, React Router 7 (server rendering), Vite 5, Node.js |
| UI              | Tailwind CSS, Radix UI components, Quill rich text editor                |
| Database        | Neon PostgreSQL, Drizzle ORM and Drizzle Kit migrations                  |
| Authentication  | Clerk; teacher access is controlled by `TEACHER_USER_IDS`                |
| Payments        | Stripe Checkout and webhooks (in progress)                               |
| Media and files | Bunny.net Stream and Storage, with Uppy for uploads                      |
| Analytics       | PostHog client analytics                                                 |

## Get started

You need Node.js 20 or later, npm, and credentials for Neon and Clerk. Configure Bunny.net to use video and file uploads. Stripe payment integration is in progress; configure Stripe credentials when working on it.

1. Install dependencies and create your local environment file:

   ```sh
   npm ci
   cp .env.example .env
   ```

2. Replace the placeholders in `.env` with your service credentials. The two database URLs must point to the **same Neon project, branch, and database**. Use the pooled URL (hostname containing `-pooler`) for `DATABASE_URL` and the direct URL for `DATABASE_URL_UNPOOLED`. Keep `.env` local and put production secrets in your host's secret store.

   | Variables                                   | Used for                                                               |
   | ------------------------------------------- | ---------------------------------------------------------------------- |
   | `DATABASE_URL`, `DATABASE_URL_UNPOOLED`     | Application queries and schema setup, respectively                     |
   | `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Sign-in and server-side authentication                                 |
   | `TEACHER_USER_IDS`                          | Comma-separated Clerk user IDs allowed to manage courses               |
   | `ENABLE_WHITELIST`, `USER_EMAIL_WHITELIST`  | Optional email allowlist when `ENABLE_WHITELIST=true`                  |
   | `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`   | Checkout and webhook verification                                      |
   | `BUNNY_*`                                   | Video streaming and file storage; see `.env.example` for the full list |

3. Prepare the database. For a new database with an empty `public` schema, run both commands. For an existing Pet LMS database, run only the migration command:

   ```sh
   npm run db:bootstrap # new, empty database only
   npm run db:migrate
   ```

4. Start the development server and open the URL printed in the terminal:

   ```sh
   npm run dev
   ```

   To manage courses, set `TEACHER_USER_IDS` to your Clerk user ID. You can optionally run `npm run db:seed` to add course categories.

Before committing, run `npm run lint` and `npm run typecheck`. To check a production build locally, run `npm run build` followed by `npm run start`.

## Routing

Routes are defined explicitly in `app/routes.ts` using React Router's `route`, `layout`, and `index` helpers. Add or change URL paths there; route module filenames do not determine URLs.

## Database

Pet LMS uses Neon PostgreSQL and Drizzle. The schema lives in `app/lib/schema.ts`; versioned changes live in `drizzle/`. The current staging database is `pet_lms` on the `hp-learny` project's `staging` branch. Keep Pet LMS in its own database: `neondb` is used by another app.

The app needs two URLs for the **same project, branch, and database**:

- `DATABASE_URL`: pooled Neon connection for application queries.
- `DATABASE_URL_UNPOOLED`: direct Neon connection for bootstrap and migrations.

Use `.env.example` as the variable checklist. Keep local values in the ignored `.env` file and production values in your host's secret store.

The staging `pet_lms` database already has the initial schema and Drizzle baseline, so it needs only `npm run db:migrate` during setup.

### Set up a production database

1. Create a separate, empty `pet_lms` database on the production Neon branch. In this repo's linked Neon project, the CLI command is:

   ```sh
   neon databases create --branch production --name pet_lms
   ```

   You can do the same in the Neon Console. Do not choose the existing `neondb` database.

2. Get that database's direct and pooled connection strings from the Neon Console, or use:

   ```sh
   neon connection-string production --database-name pet_lms
   neon connection-string production --database-name pet_lms --pooled
   ```

   Store the pooled URL as `DATABASE_URL` and the direct URL as `DATABASE_URL_UNPOOLED` in the production environment. Check that both URLs end in `/pet_lms` and point to the production branch. The direct hostname must not contain `-pooler`.

3. From a release environment configured with those production variables, install dependencies and initialize the **empty** database:

   ```sh
   npm ci --include=dev
   npm run db:bootstrap
   npm run db:migrate
   ```

   `db:bootstrap` creates the eight application tables from the frozen initial Drizzle schema and refuses to run if the public schema already contains tables. `db:migrate` records the initial baseline and applies later migrations. If you are adopting an existing Pet LMS database with those tables, skip bootstrap and run only `db:migrate`.

4. Build and start the app:

   ```sh
   npm run build
   npm prune --omit=dev
   npm run start
   ```

   Run `db:migrate` once before each later release. `npm run db:seed` optionally inserts the course categories; it is not required for schema setup.

### Change the schema

Edit `app/lib/schema.ts`, run `npm run db:generate`, review and commit the generated SQL, then test `npm run db:migrate` on a Neon branch before applying it to production. Keep `database/bootstrap.sql` fixed as the initial schema; later changes belong in `drizzle/` migrations. The initial migration checks that the eight tables exist, so it cannot initialize an empty database by itself.

`npx tsx scripts/check-db.ts` runs a create/read/update/delete check. Use it only on an isolated Neon branch; it removes its temporary rows afterward.
