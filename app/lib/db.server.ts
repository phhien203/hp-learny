/* eslint-disable @typescript-eslint/no-explicit-any */
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  inArray,
  isNull,
  like,
  type SQL,
} from 'drizzle-orm'
import * as schema from './schema'

declare global {
  // eslint-disable-next-line no-var
  var pgPool: Pool | undefined
}

const pool =
  globalThis.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== 'production') globalThis.pgPool = pool

export const sqlDb = drizzle(pool, { schema })
export const closeDatabase = () => pool.end()

// The repositories keep the route-level operations stable while the underlying
// schema, driver, and query execution are entirely managed by Drizzle.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>
type Query = {
  where?: Row
  include?: Row
  select?: Row
  orderBy?: Row
  data?: Row
}

const tables = {
  course: schema.courses,
  category: schema.categories,
  attachment: schema.attachments,
  chapter: schema.chapters,
  muxData: schema.muxData,
  userProgress: schema.userProgress,
  purchase: schema.purchases,
  stripeCustomer: schema.stripeCustomers,
}

type TableName = keyof typeof tables

function flattenWhere(where: Row = {}): Row {
  const result = { ...where }
  for (const key of ['userId_courseId', 'userId_chapterId']) {
    if (result[key]) {
      Object.assign(result, result[key])
      delete result[key]
    }
  }
  return result
}

function hasDefinedIdentity(where: Row): boolean {
  const flat = flattenWhere(where)
  return (
    typeof flat.id === 'string' ||
    (typeof flat.userId === 'string' &&
      (typeof flat.courseId === 'string' || typeof flat.chapterId === 'string'))
  )
}

function condition(fields: Row, where: Row = {}): SQL | undefined {
  const parts: SQL[] = Object.entries(flattenWhere(where)).flatMap(
    ([key, value]): SQL[] => {
      if (value === undefined) return []
      if (key === 'course' && typeof value === 'object' && value !== null) {
        return [
          inArray(
            fields.courseId,
            sqlDb
              .select({ id: schema.courses.id })
              .from(schema.courses)
              .where(condition(schema.courses, value)),
          ),
        ]
      }
      const column = fields[key]
      if (!column) throw new Error(`Unknown database filter: ${key}`)
      if (value === null) return [isNull(column)]
      if (typeof value !== 'object' || value instanceof Date)
        return [eq(column, value)]
      if ('contains' in value) {
        if (value.contains === undefined) return []
        const escaped = String(value.contains).replace(/[\\%_]/g, '\\$&')
        return [like(column, `%${escaped}%`)]
      }
      if ('gt' in value) return [gt(column, value.gt)]
      if ('in' in value) return [inArray(column, value.in)]
      throw new Error(`Unsupported database filter: ${key}`)
    },
  )
  return and(...parts)
}

function ordering(fields: Row, orderBy?: Row) {
  if (!orderBy) return undefined
  return Object.entries(orderBy).map(([key, direction]) =>
    direction === 'desc' ? desc(fields[key]) : asc(fields[key]),
  )
}

function relationOptions(relation: true | Query): true | Row {
  if (relation === true) return true
  return {
    ...(relation.where && {
      where: (fields: Row) => condition(fields, relation.where),
    }),
    ...(relation.orderBy && {
      orderBy: (fields: Row) => ordering(fields, relation.orderBy),
    }),
    ...(relation.select && { columns: scalarColumns(relation.select) }),
    ...((relation.include || relation.select) && {
      with: relationsFor(relation.include ?? relation.select),
    }),
  }
}

function relationsFor(selection?: Row): Row | undefined {
  if (!selection) return undefined
  const result: Row = {}
  for (const [key, value] of Object.entries(selection)) {
    if (
      [
        'category',
        'chapters',
        'attachments',
        'purchases',
        'course',
        'userProgress',
        'muxData',
      ].includes(key)
    ) {
      result[key] = relationOptions(value)
    }
  }
  return Object.keys(result).length ? result : undefined
}

function scalarColumns(selection?: Row): Row | undefined {
  if (!selection) return undefined
  const result: Row = {}
  for (const [key, value] of Object.entries(selection)) {
    if (value === true) result[key] = true
  }
  return Object.keys(result).length ? result : undefined
}

function repository(name: TableName) {
  // Drizzle's table-specific types cannot be indexed by a runtime model name.
  // Keep this dynamic boundary here; route code uses the concrete model types.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = tables[name] as any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = (sqlDb.query as any)[
    {
      course: 'courses',
      category: 'categories',
      attachment: 'attachments',
      chapter: 'chapters',
      muxData: 'muxData',
      userProgress: 'userProgress',
      purchase: 'purchases',
      stripeCustomer: 'stripeCustomers',
    }[name]
  ] as any
  return {
    async findMany(args: Query = {}): Promise<any[]> {
      return query.findMany({
        ...(args.where && {
          where: (fields: Row) => condition(fields, args.where),
        }),
        ...(args.orderBy && {
          orderBy: (fields: Row) => ordering(fields, args.orderBy),
        }),
        ...(args.select && { columns: scalarColumns(args.select) }),
        ...((args.include || args.select) && {
          with: relationsFor(args.include ?? args.select),
        }),
      })
    },
    async findFirst(args: Query = {}): Promise<any> {
      return (
        (await query.findFirst({
          ...(args.where && {
            where: (fields: Row) => condition(fields, args.where),
          }),
          ...(args.orderBy && {
            orderBy: (fields: Row) => ordering(fields, args.orderBy),
          }),
          ...(args.select && { columns: scalarColumns(args.select) }),
          ...((args.include || args.select) && {
            with: relationsFor(args.include ?? args.select),
          }),
        })) ?? null
      )
    },
    async findUnique(args: Query): Promise<any> {
      if (!args.where || !hasDefinedIdentity(args.where)) return null
      return this.findFirst(args)
    },
    async create(args: { data: Row }): Promise<Row> {
      const [row] = (await sqlDb
        .insert(table)
        .values(args.data)
        .returning()) as Row[]
      return row
    },
    async createMany(args: { data: Row[] }) {
      const rows = (await sqlDb
        .insert(table)
        .values(args.data)
        .returning()) as Row[]
      return { count: rows.length }
    },
    async update(args: { where: Row; data: Row }): Promise<Row> {
      if (!hasDefinedIdentity(args.where))
        throw new Error(`Missing ${name} identity`)
      const [row] = (await sqlDb
        .update(table)
        .set(args.data)
        .where(condition(table, args.where))
        .returning()) as Row[]
      if (!row) throw new Error(`${name} not found`)
      return row
    },
    async delete(args: { where: Row }): Promise<Row> {
      if (!hasDefinedIdentity(args.where))
        throw new Error(`Missing ${name} identity`)
      const [row] = (await sqlDb
        .delete(table)
        .where(condition(table, args.where))
        .returning()) as Row[]
      if (!row) throw new Error(`${name} not found`)
      return row
    },
    async upsert(args: { where: Row; create: Row; update: Row }): Promise<Row> {
      const keys = Object.keys(flattenWhere(args.where))
      const [row] = (await sqlDb
        .insert(table)
        .values(args.create)
        .onConflictDoUpdate({
          target: keys.map((key) => table[key]),
          set: { ...args.update, updatedAt: new Date() },
        })
        .returning()) as Row[]
      return row
    },
    async count(args: Query = {}) {
      const [row] = await sqlDb
        .select({ value: count() })
        .from(table)
        .where(condition(table, args.where))
      return row.value
    },
  }
}

export const db = {
  course: repository('course'),
  category: repository('category'),
  attachment: repository('attachment'),
  chapter: repository('chapter'),
  muxData: repository('muxData'),
  userProgress: repository('userProgress'),
  purchase: repository('purchase'),
  stripeCustomer: repository('stripeCustomer'),
}
