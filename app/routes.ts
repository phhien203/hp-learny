import {
  type RouteConfig,
  index,
  layout,
  route,
} from '@react-router/dev/routes'

export default [
  layout('./routes/auth/layout.tsx', [
    route('sign-in/*', './routes/auth/sign-in.tsx'),
    route('sign-up/*', './routes/auth/sign-up.tsx'),
  ]),

  layout('./routes/dashboard/layout.tsx', [
    index('./routes/dashboard/home.tsx'),
    route('search', './routes/dashboard/search.tsx'),
    route('teacher/analytics', './routes/dashboard/teacher/analytics.tsx'),
    route('teacher/courses', './routes/dashboard/teacher/courses.tsx'),
    route(
      'teacher/courses/:courseId',
      './routes/dashboard/teacher/course-details.tsx',
    ),
    route(
      'teacher/courses/:courseId/chapters/:chapterId',
      './routes/dashboard/teacher/chapter-details.tsx',
    ),
    route('teacher/create', './routes/dashboard/teacher/create.tsx'),
  ]),

  route('api/bunny/headers', './routes/api/bunny-headers.ts'),
  route(
    'api/courses/:courseId/attachments',
    './routes/api/course-attachments.ts',
    [route(':attachmentId', './routes/api/course-attachment.ts')],
  ),
  route('api/courses/:courseId/chapters', './routes/api/course-chapters.ts', [
    route(':chapterId/publish', './routes/api/course-chapter-publish.ts'),
    route(
      ':chapterId/toggle-complete',
      './routes/api/course-chapter-toggle-complete.ts',
    ),
    route(':chapterId/unpublish', './routes/api/course-chapter-unpublish.ts'),
    route('reorder', './routes/api/course-chapters-reorder.ts'),
  ]),
  route('api/courses/:courseId/checkout', './routes/api/course-checkout.ts'),
  route('api/courses/:courseId/publish', './routes/api/course-publish.ts'),
  route('api/courses/:courseId/unpublish', './routes/api/course-unpublish.ts'),
  route('api/upload', './routes/api/upload.ts'),
  route('api/webhook', './routes/api/webhook.ts'),

  route('courses/:courseId', './routes/courses/layout.tsx', [
    index('./routes/courses/overview.tsx'),
    route('chapters/:chapterId', './routes/courses/chapter.tsx'),
  ]),

  route('healthcheck', './routes/healthcheck.ts'),
] satisfies RouteConfig
