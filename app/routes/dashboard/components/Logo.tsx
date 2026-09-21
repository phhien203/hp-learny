import { Link } from 'react-router'

export function Logo() {
  return (
    <Link to="/" aria-label="HP Learny home" className="inline-flex">
      <img
        height={45}
        width={169}
        alt="HP Learny"
        src="/logo-light.svg"
        className="h-auto w-[169px]"
      />
    </Link>
  )
}
