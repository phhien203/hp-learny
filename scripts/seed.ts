import 'dotenv/config'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { categories } from '../app/lib/schema'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)
const names = [
  'Phát triển bản thân',
  'Artificial Intelligence',
  'Blockchain Development',
  'Cloud Computing',
  'Cybersecurity',
  'Data Analytics',
  'Data Engineering',
  'Data Governance',
  'Data Integration',
  'Data Mining',
  'Data Modeling',
  'Data Processing',
  'Data Quality',
  'Data Science',
  'Data Security',
  'Data Transformation',
  'Data Visualization',
  'Data Warehousing',
  'Database Management',
  'DevOps',
  'Game Development',
  'IT Infrastructure',
  'Machine Learning',
  'Mobile App Development',
  'Network Security',
  'Project Management',
  'Software Engineering',
  'Software Testing',
  'System Administration',
  'UI/UX Design',
  'Web Development',
]

try {
  const existing = await db.select({ name: categories.name }).from(categories)
  const known = new Set(existing.map((row) => row.name))
  const missing = names.filter((name) => !known.has(name))
  if (missing.length)
    await db.insert(categories).values(missing.map((name) => ({ name })))
  console.log(`Seeded ${missing.length} categories`)
} finally {
  await pool.end()
}
