import { and, asc, eq, gt } from 'drizzle-orm'
import {
  purchases,
  courses,
  chapters,
  attachments as attachmentsTable,
  userProgress as userProgressTable,
} from '~/lib/schema'
import type { Attachment, Chapter } from './schema'
import { signVideoUrl } from './bunny.server'
import { db } from './db.server'

export interface GetChapterArgs {
  userId: string
  courseId: string
  chapterId: string
}

export async function getChapter({
  userId,
  courseId,
  chapterId,
}: GetChapterArgs) {
  try {
    const purchase = await db.query.purchases.findFirst({
      where: and(
        eq(purchases.userId, userId),
        eq(purchases.courseId, courseId ?? ''),
      ),
    })

    const course = await db.query.courses.findFirst({
      where: and(eq(courses.id, courseId ?? ''), eq(courses.isPublished, true)),
      columns: { id: true, price: true },
    })

    const chapter = await db.query.chapters.findFirst({
      where: and(
        eq(chapters.id, chapterId ?? ''),
        eq(chapters.courseId, courseId ?? ''),
        eq(chapters.isPublished, true),
      ),
    })

    if (!chapter || !course) {
      throw new Error('Chapter or course not found')
    }

    let attachments: Attachment[] = []
    let nextChapter: Chapter | null = null

    if (purchase) {
      attachments = await db.query.attachments.findMany({
        where: eq(attachmentsTable.courseId, courseId ?? ''),
      })
    }

    if (chapter.isFree || purchase) {
      nextChapter =
        (await db.query.chapters.findFirst({
          where: and(
            eq(chapters.courseId, courseId ?? ''),
            eq(chapters.isPublished, true),
            gt(chapters.position, chapter.position),
          ),
          orderBy: [asc(chapters.position)],
        })) ?? null
    }

    const userProgress = await db.query.userProgress.findFirst({
      where: and(
        eq(userProgressTable.userId, userId),
        eq(userProgressTable.chapterId, chapterId ?? ''),
      ),
    })

    const videoId = chapter.videoUrl
    let signedVideoUrl = ''

    if (videoId) {
      signedVideoUrl = signVideoUrl(videoId)
    }

    return {
      chapter,
      course,
      attachments,
      nextChapter,
      userProgress,
      purchase,
      signedVideoUrl,
    }
  } catch (error) {
    console.error('[GET_CHAPTER]', error)
    return {
      chapter: null,
      course: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
      signedVideoUrl: '',
    }
  }
}
