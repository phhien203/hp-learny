import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { Pool } from 'pg'

const url = process.env.DATABASE_URL_UNPOOLED
if (!url) throw new Error('DATABASE_URL_UNPOOLED is required for bootstrap')
if (new URL(url).hostname.includes('-pooler')) {
  throw new Error('Bootstrap requires the direct Neon connection, not the pooled URL')
}

const ddl = await readFile(new URL('../database/bootstrap.sql', import.meta.url), 'utf8')
const pool = new Pool({ connectionString: url, max: 1 })
let client

try {
  client = await pool.connect()
  await client.query('BEGIN')
  const existing = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' LIMIT 1",
  )
  if (existing.rowCount) {
    throw new Error('Bootstrap requires an empty public schema; use db:migrate for an existing database')
  }
  await client.query(ddl)
  await client.query('COMMIT')
  console.log('Initial Drizzle schema created; run npm run db:migrate next')
} catch (error) {
  if (client) await client.query('ROLLBACK')
  throw error
} finally {
  client?.release()
  await pool.end()
}
