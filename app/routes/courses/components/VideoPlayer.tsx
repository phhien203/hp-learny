import { LockIcon } from 'lucide-react'

interface VideoPlayerProps {
  chapterId: string
  title: string
  courseId: string
  nextChapterId?: string
  videoUrl: string
  isLocked: boolean
  completeOnEnd: boolean
}

export function VideoPlayer({
  videoUrl,
  isLocked,
}: VideoPlayerProps) {
  return (
    <div className="relative aspect-video">
      {/* {!isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2Icon className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )} */}

      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-2 bg-slate-800 text-secondary">
          <LockIcon className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}

      {!isLocked && (
        <iframe
          title="bunny-video"
          src={videoUrl}
          loading="lazy"
          className="absolute top-0 h-full w-full border-0"
          allow="accelerometer; gyroscope; encrypted-media; picture-in-picture"
          allowFullScreen={true}
        />
      )}
    </div>
  )
}
