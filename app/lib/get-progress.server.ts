import { db } from './db.server'

export async function getProgress(
  userId: string,
  courseId: string,
): Promise<number> {
  try {
    const publishedChapters = await db.chapter.findMany({
      where: {
        courseId,
        isPublished: true,
      },
      select: {
        id: true,
      },
    })

    const publishedChapterIds = publishedChapters.map(
      (chapter: { id: string }) => chapter.id,
    )

    const validCompletedChapters = await db.userProgress.count({
      where: {
        userId,
        chapterId: { in: publishedChapterIds },
        isCompleted: true,
      },
    })

    const progressPercentage =
      (validCompletedChapters / publishedChapterIds.length) * 100

    return progressPercentage
  } catch {
    console.log('[GET_PROGRESS] Error fetching progress')
    return 0
  }
}
