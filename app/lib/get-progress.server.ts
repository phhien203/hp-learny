import { and, eq, inArray } from 'drizzle-orm'
import { chapters, userProgress } from '~/lib/schema'
import { db } from './db.server'

export async function getProgress(
  userId: string,
  courseId: string,
): Promise<number> {
  try {
    const publishedChapters = await db.query.chapters.findMany({
      where: and(
        eq(chapters.courseId, courseId ?? ''),
        eq(chapters.isPublished, true),
      ),
      columns: { id: true },
    })

    const publishedChapterIds = publishedChapters.map(
      (chapter: { id: string }) => chapter.id,
    )

    const validCompletedChapters = await db.$count(
      userProgress,
      and(
        eq(userProgress.userId, userId),
        inArray(userProgress.chapterId, publishedChapterIds),
        eq(userProgress.isCompleted, true),
      ),
    )

    const progressPercentage =
      (validCompletedChapters / publishedChapterIds.length) * 100

    return progressPercentage
  } catch {
    console.log('[GET_PROGRESS] Error fetching progress')
    return 0
  }
}
