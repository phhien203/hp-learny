import { Attachment, Chapter } from '@prisma/client'
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
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    })

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        isPublished: true,
      },
      select: {
        id: true,
        price: true,
      },
    })

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
        isPublished: true,
      },
    })

    if (!chapter || !course) {
      throw new Error('Chapter or course not found')
    }

    let attachments: Attachment[] = []
    let nextChapter: Chapter | null = null

    if (purchase) {
      attachments = await db.attachment.findMany({
        where: { courseId },
      })
    }

    if (chapter.isFree || purchase) {
      nextChapter = await db.chapter.findFirst({
        where: {
          courseId,
          isPublished: true,
          position: {
            gt: chapter.position,
          },
        },
        orderBy: {
          position: 'asc',
        },
      })
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
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
