# Pet LMS

## Database: Neon PostgreSQL

This app uses Prisma with Neon PostgreSQL. Use `.env.example` when creating a new `.env`, or update the existing `.env` without replacing its other secrets. Set:

- `DATABASE_URL`: Neon pooled connection string for application traffic.
- `DATABASE_URL_UNPOOLED`: Neon direct connection string for Prisma migrations.

Choose both URLs for the same Neon project, branch, and database. Keep the other application values already in `.env`. The Neon CLI can fetch the URLs after you sign in and link the existing project with `npx neon@latest login` and `npx neon@latest link`. A Neon CLI env pull can update an existing `.env`, so review the file afterward.

The current local workspace is linked to the `hp-learny` project's `staging` branch and uses its separate `pet_lms` database. The `neondb` database on that branch belongs to another app. The production branch and Fly secrets have not been changed.

Install dependencies and create the PostgreSQL schema:

```sh
npm ci
npx prisma generate
npx prisma migrate deploy
```

Run the app locally:

```sh
npm run dev
```

For Fly deployment, set both database URLs as Fly secrets. The container applies Prisma migrations at startup and then serves the app on port 8080.
