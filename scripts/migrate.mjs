import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'

const url = process.env.DATABASE_URL_UNPOOLED
if (!url) throw new Error('DATABASE_URL_UNPOOLED is required for migrations')
if (new URL(url).hostname.includes('-pooler')) {
  throw new Error(
    'Migrations require the direct Neon connection, not the pooled URL',
  )
}

const pool = new Pool({ connectionString: url, max: 1 })
try {
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  console.log('Drizzle migrations applied')
} finally {
  await pool.end()
}
