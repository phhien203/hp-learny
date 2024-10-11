import { Attachment, Chapter } from '@prisma/client'
import { db } from './db.server'
import crypto from 'crypto'

export interface GetChapterParams {
  userId: string
  courseId: string
  chapterId: string
}

export async function getChapter({
  userId,
  courseId,
  chapterId,
}: GetChapterParams) {
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

    const unsignedVideoUrl = chapter.videoUrl
    let signedVideoUrl = ''

    if (unsignedVideoUrl) {
      const parsedUrl = new URL(unsignedVideoUrl)

      const pathSegments = parsedUrl.pathname.split('/') // Example: ['', 'embed', '228530', 'cbf30637-b0de-4f8f-9e43-2199a5c5e967']
      const videoId = pathSegments[3]
      const expires = Math.floor(new Date().valueOf() / 1000) + 60 * 60 // 1 hour
      const data = `${process.env.BUNNY_TOKEN}${videoId}${expires}`
      const hash = crypto.createHash('sha256')
      const token = hash.update(data).digest('hex')

      parsedUrl.searchParams.set('token', token)
      parsedUrl.searchParams.set('expires', expires.toString())
      signedVideoUrl = parsedUrl.toString()
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
