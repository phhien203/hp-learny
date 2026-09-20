import { z } from 'zod'

export const chapterVideoFormSchema = z.object({
  videoUrl: z.string().min(1),
})
