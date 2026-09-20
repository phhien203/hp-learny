import { and, asc, desc, eq, gt, like, inArray } from 'drizzle-orm'
import {
  categories,
  courses,
  chapters,
  purchases,
  userProgress,
  attachments,
} from '../app/lib/schema'
import { randomUUID } from 'node:crypto'
import { closeDatabase, db } from '../app/lib/db.server'

const userId = `drizzle-check-${randomUUID()}`
let categoryId: string | undefined
let courseId: string | undefined

try {
  const category = (
    await db.insert(categories).values({ name: userId }).returning()
  )[0]
  categoryId = category.id
  const course = (
    await db
      .insert(courses)
      .values({ title: userId, userId, categoryId })
      .returning()
  )[0]
  courseId = course.id
  const chapter = (
    await db
      .insert(chapters)
      .values({ title: 'Smoke test', courseId, position: 1, isPublished: true })
      .returning()
  )[0]
  await (await db.insert(purchases).values({ userId, courseId }).returning())[0]
  await (
    await db
      .insert(userProgress)
      .values({ userId, chapterId: chapter.id, isCompleted: true })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.chapterId],
        set: { ...{ isCompleted: true }, updatedAt: new Date() },
      })
      .returning()
  )[0]
  await (
    await db
      .insert(userProgress)
      .values({ userId, chapterId: chapter.id, isCompleted: true })
      .onConflictDoUpdate({
        target: [userProgress.userId, userProgress.chapterId],
        set: { ...{ isCompleted: true }, updatedAt: new Date() },
      })
      .returning()
  )[0]

  const found = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)),
    with: {
      category: true,
      chapters: {
        where: eq(chapters.isPublished, true),
        orderBy: [asc(chapters.position)],
        with: { userProgress: { where: eq(userProgress.userId, userId) } },
      },
      purchases: { where: eq(purchases.userId, userId) },
    },
  })
  if (
    found?.category?.id !== categoryId ||
    found.chapters.length !== 1 ||
    found.chapters[0].userProgress.length !== 1 ||
    found.purchases.length !== 1
  ) {
    throw new Error('Nested relation query returned unexpected data')
  }
  const nextChapter = await db.query.chapters.findFirst({
    where: and(eq(chapters.courseId, courseId ?? ''), gt(chapters.position, 0)),
    orderBy: [asc(chapters.position)],
  })
  const selectedCourse = await db.query.courses.findFirst({
    where: eq(courses.id, courseId ?? ''),
    columns: { id: true, price: true },
  })
  const purchase = await db.query.purchases.findFirst({
    where: and(
      eq(purchases.userId, userId),
      eq(purchases.courseId, courseId ?? ''),
    ),
  })
  if (
    nextChapter?.id !== chapter.id ||
    selectedCourse?.id !== courseId ||
    !purchase
  ) {
    throw new Error('Unique, first, or selected query returned unexpected data')
  }
  if (await db.query.courses.findFirst({ where: eq(courses.id, '') })) {
    throw new Error('Missing identity must not return an arbitrary row')
  }
  const filtered = await db.query.purchases.findMany({
    where: inArray(
      purchases.courseId,
      db
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.userId, userId)),
    ),
    with: { course: true },
  })
  if (filtered.length !== 1 || filtered[0].course.id !== courseId) {
    throw new Error('Related-table filter returned unexpected data')
  }
  const dashboard = await db.query.purchases.findMany({
    where: eq(purchases.userId, userId),
    columns: {},
    with: {
      course: {
        with: {
          category: true,
          chapters: { where: eq(chapters.isPublished, true) },
        },
      },
    },
  })
  if (
    dashboard[0]?.course?.category?.id !== categoryId ||
    dashboard[0].course.chapters.length !== 1
  ) {
    throw new Error('Dashboard relation selection returned unexpected data')
  }
  const searched = await db.query.courses.findMany({
    where: and(
      like(courses.title, '%' + userId + '%'),
      eq(courses.isPublished, false),
    ),
    orderBy: [desc(courses.createdAt)],
  })
  if (searched.length !== 1)
    throw new Error('Search filter returned unexpected data')
  const completed = await db.$count(
    userProgress,
    and(
      eq(userProgress.userId, userId),
      inArray(userProgress.chapterId, [chapter.id]),
      eq(userProgress.isCompleted, true),
    ),
  )
  if (completed !== 1)
    throw new Error('Progress count returned unexpected data')
  const selected = await db.query.chapters.findMany({
    where: eq(chapters.courseId, courseId ?? ''),
    columns: { id: true },
  })
  if (selected.length !== 1 || selected[0].id !== chapter.id) {
    throw new Error('Column selection returned unexpected data')
  }
  const attachment = (
    await db
      .insert(attachments)
      .values({ courseId, name: 'Smoke test', url: 'https://example.com/test' })
      .returning()
  )[0]
  await (
    await db
      .delete(attachments)
      .where(
        and(
          eq(attachments.id, attachment.id ?? ''),
          eq(attachments.courseId, courseId ?? ''),
        ),
      )
      .returning()
  )[0]
  const updated = (
    await db
      .update(courses)
      .set({ title: 'Updated' })
      .where(and(eq(courses.id, courseId ?? ''), eq(courses.userId, userId)))
      .returning()
  )[0]
  if (updated.title !== 'Updated' || !(updated.updatedAt instanceof Date)) {
    throw new Error('Update returned unexpected data')
  }
  console.log('Drizzle read, relation, write, and upsert checks passed')
} finally {
  if (courseId) await db.delete(courses).where(eq(courses.id, courseId))
  if (categoryId)
    await db.delete(categories).where(eq(categories.id, categoryId))
  await closeDatabase()
}
