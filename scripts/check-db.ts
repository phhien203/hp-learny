import { randomUUID } from 'node:crypto'
import { closeDatabase, db, sqlDb } from '../app/lib/db.server'
import { categories, courses } from '../app/lib/schema'
import { eq } from 'drizzle-orm'

const userId = `drizzle-check-${randomUUID()}`
let categoryId: string | undefined
let courseId: string | undefined

try {
  const category = await db.category.create({ data: { name: userId } })
  categoryId = category.id
  const course = await db.course.create({
    data: { title: userId, userId, categoryId },
  })
  courseId = course.id
  const chapter = await db.chapter.create({
    data: { title: 'Smoke test', courseId, position: 1, isPublished: true },
  })
  await db.purchase.create({ data: { userId, courseId } })
  await db.userProgress.upsert({
    where: { userId_chapterId: { userId, chapterId: chapter.id } },
    create: { userId, chapterId: chapter.id, isCompleted: true },
    update: { isCompleted: true },
  })
  await db.userProgress.upsert({
    where: { userId_chapterId: { userId, chapterId: chapter.id } },
    create: { userId, chapterId: chapter.id, isCompleted: true },
    update: { isCompleted: true },
  })

  const found = await db.course.findUnique({
    where: { id: courseId, userId },
    include: {
      category: true,
      chapters: {
        where: { isPublished: true },
        orderBy: { position: 'asc' },
        include: { userProgress: { where: { userId } } },
      },
      purchases: { where: { userId } },
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
  const nextChapter = await db.chapter.findFirst({
    where: { courseId, position: { gt: 0 } },
    orderBy: { position: 'asc' },
  })
  const selectedCourse = await db.course.findUnique({
    where: { id: courseId },
    select: { id: true, price: true },
  })
  const purchase = await db.purchase.findUnique({
    where: { userId_courseId: { userId, courseId } },
  })
  if (
    nextChapter?.id !== chapter.id ||
    selectedCourse?.id !== courseId ||
    !purchase
  ) {
    throw new Error('Unique, first, or selected query returned unexpected data')
  }
  if (await db.course.findUnique({ where: { id: undefined } })) {
    throw new Error('Missing identity must not return an arbitrary row')
  }
  const filtered = await db.purchase.findMany({
    where: { course: { userId } },
    include: { course: true },
  })
  if (filtered.length !== 1 || filtered[0].course.id !== courseId) {
    throw new Error('Related-table filter returned unexpected data')
  }
  const dashboard = await db.purchase.findMany({
    where: { userId },
    select: {
      course: {
        include: {
          category: true,
          chapters: { where: { isPublished: true } },
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
  const searched = await db.course.findMany({
    where: { title: { contains: userId }, isPublished: false },
    orderBy: { createdAt: 'desc' },
  })
  if (searched.length !== 1)
    throw new Error('Search filter returned unexpected data')
  const completed = await db.userProgress.count({
    where: { userId, chapterId: { in: [chapter.id] }, isCompleted: true },
  })
  if (completed !== 1)
    throw new Error('Progress count returned unexpected data')
  const selected = await db.chapter.findMany({
    where: { courseId },
    select: { id: true },
  })
  if (selected.length !== 1 || selected[0].id !== chapter.id) {
    throw new Error('Column selection returned unexpected data')
  }
  const attachment = await db.attachment.create({
    data: { courseId, name: 'Smoke test', url: 'https://example.com/test' },
  })
  await db.attachment.delete({ where: { id: attachment.id, courseId } })
  const updated = await db.course.update({
    where: { id: courseId, userId },
    data: { title: 'Updated' },
  })
  if (updated.title !== 'Updated' || !(updated.updatedAt instanceof Date)) {
    throw new Error('Update returned unexpected data')
  }
  console.log('Drizzle read, relation, write, and upsert checks passed')
} finally {
  if (courseId) await sqlDb.delete(courses).where(eq(courses.id, courseId))
  if (categoryId)
    await sqlDb.delete(categories).where(eq(categories.id, categoryId))
  await closeDatabase()
}
