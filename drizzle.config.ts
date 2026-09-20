import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL_UNPOOLED) {
  throw new Error('DATABASE_URL_UNPOOLED is required for Drizzle migrations')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './app/lib/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED },
  schemaFilter: ['public'],
  tablesFilter: [
    'Course',
    'Category',
    'Attachment',
    'Chapter',
    'MuxData',
    'UserProgress',
    'Purchase',
    'StripeCustomer',
  ],
})
