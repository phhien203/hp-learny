import cuid from 'cuid'
import { relations, sql } from 'drizzle-orm'
import {
  pgTable,
  uniqueIndex,
  text,
  timestamp,
  index,
  foreignKey,
  boolean,
  doublePrecision,
  integer,
} from 'drizzle-orm/pg-core'

export const stripeCustomers = pgTable(
  'StripeCustomer',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    userId: text().notNull(),
    stripeCustomerId: text().notNull(),
  },
  (table) => [
    uniqueIndex('StripeCustomer_stripeCustomerId_key').using(
      'btree',
      table.stripeCustomerId.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('StripeCustomer_userId_key').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
  ],
)

export const categories = pgTable('Category', {
  id: text().primaryKey().notNull().$defaultFn(cuid),
  createdAt: timestamp({ precision: 3 })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp({ precision: 3 })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
  name: text().notNull(),
})

export const courses = pgTable(
  'Course',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    title: text().notNull(),
    userId: text().notNull(),
    isPublished: boolean().default(false).notNull(),
    description: text(),
    imageUrl: text(),
    price: doublePrecision(),
    categoryId: text(),
  },
  (table) => [
    index('Course_categoryId_idx').using(
      'btree',
      table.categoryId.asc().nullsLast().op('text_ops'),
    ),
    index('Course_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'Course_categoryId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('set null'),
  ],
)

export const attachments = pgTable(
  'Attachment',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    url: text().notNull(),
    name: text().notNull(),
    courseId: text().notNull(),
  },
  (table) => [
    index('Attachment_courseId_idx').using(
      'btree',
      table.courseId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: 'Attachment_courseId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const chapters = pgTable(
  'Chapter',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    title: text().notNull(),
    position: integer().notNull(),
    isFree: boolean().default(false).notNull(),
    isPublished: boolean().default(false).notNull(),
    description: text(),
    videoUrl: text(),
    courseId: text().notNull(),
  },
  (table) => [
    index('Chapter_courseId_idx').using(
      'btree',
      table.courseId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: 'Chapter_courseId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const muxData = pgTable(
  'MuxData',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    assetId: text().notNull(),
    playbackId: text(),
    chapterId: text().notNull(),
  },
  (table) => [
    uniqueIndex('MuxData_chapterId_key').using(
      'btree',
      table.chapterId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.chapterId],
      foreignColumns: [chapters.id],
      name: 'MuxData_chapterId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const userProgress = pgTable(
  'UserProgress',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    userId: text().notNull(),
    chapterId: text().notNull(),
    isCompleted: boolean().default(false).notNull(),
  },
  (table) => [
    index('UserProgress_chapterId_idx').using(
      'btree',
      table.chapterId.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('UserProgress_userId_chapterId_key').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
      table.chapterId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.chapterId],
      foreignColumns: [chapters.id],
      name: 'UserProgress_chapterId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const purchases = pgTable(
  'Purchase',
  {
    id: text().primaryKey().notNull().$defaultFn(cuid),
    createdAt: timestamp({ precision: 3 })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp({ precision: 3 })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
    userId: text().notNull(),
    courseId: text().notNull(),
  },
  (table) => [
    index('Purchase_courseId_idx').using(
      'btree',
      table.courseId.asc().nullsLast().op('text_ops'),
    ),
    uniqueIndex('Purchase_userId_courseId_key').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
      table.courseId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.courseId],
      foreignColumns: [courses.id],
      name: 'Purchase_courseId_fkey',
    })
      .onUpdate('cascade')
      .onDelete('cascade'),
  ],
)

export const categoriesRelations = relations(categories, ({ many }) => ({
  courses: many(courses),
}))
export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(categories, {
    fields: [courses.categoryId],
    references: [categories.id],
  }),
  attachments: many(attachments),
  chapters: many(chapters),
  purchases: many(purchases),
}))
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  course: one(courses, {
    fields: [attachments.courseId],
    references: [courses.id],
  }),
}))
export const chaptersRelations = relations(chapters, ({ one, many }) => ({
  course: one(courses, {
    fields: [chapters.courseId],
    references: [courses.id],
  }),
  muxData: one(muxData),
  userProgress: many(userProgress),
}))
export const muxDataRelations = relations(muxData, ({ one }) => ({
  chapter: one(chapters, {
    fields: [muxData.chapterId],
    references: [chapters.id],
  }),
}))
export const userProgressRelations = relations(userProgress, ({ one }) => ({
  chapter: one(chapters, {
    fields: [userProgress.chapterId],
    references: [chapters.id],
  }),
}))
export const purchasesRelations = relations(purchases, ({ one }) => ({
  course: one(courses, {
    fields: [purchases.courseId],
    references: [courses.id],
  }),
}))

export type Course = typeof courses.$inferSelect
export type Category = typeof categories.$inferSelect
export type Chapter = typeof chapters.$inferSelect
export type Attachment = typeof attachments.$inferSelect
export type Purchase = typeof purchases.$inferSelect
export type UserProgress = typeof userProgress.$inferSelect
