import { Button } from '~/components/ui/button'
import { Link } from 'react-router-dom'

export default function TeacherCoursesPage() {
  return (
    <div className="p-6">
      <Link to="/teacher/create">
        <Button>New Course</Button>
      </Link>
    </div>
  )
}
