# Pet LMS

## Database

Pet LMS uses Neon PostgreSQL and Drizzle. The schema lives in `app/lib/schema.ts`; versioned changes live in `drizzle/`. The current staging database is `pet_lms` on the `hp-learny` project's `staging` branch. Keep Pet LMS in its own database: `neondb` is used by another app.

The app needs two URLs for the **same project, branch, and database**:

- `DATABASE_URL`: pooled Neon connection for application queries.
- `DATABASE_URL_UNPOOLED`: direct Neon connection for bootstrap and migrations.

Use `.env.example` as the variable checklist. Keep local values in the ignored `.env` file and production values in your host's secret store.

### Local development

```sh
npm ci
npm run db:migrate
npm run dev
```

The staging `pet_lms` database already has the initial schema and Drizzle baseline. To develop against a new empty database, run `npm run db:bootstrap` before `npm run db:migrate`.

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
