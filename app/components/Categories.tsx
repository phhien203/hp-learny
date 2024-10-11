import { Category } from '@prisma/client'
import {
  FcEngineering,
  FcFilmReel,
  FcMultipleDevices,
  FcMusic,
  FcOldTimeCamera,
  FcSportsMode,
} from 'react-icons/fc'
import { IconType } from 'react-icons/lib'
import { CategoryItem } from './CategoryItem'

interface CategoriesProps {
  items: Category[]
}

const iconMap: Record<string, IconType> = {
  Music: FcMusic,
  Photography: FcOldTimeCamera,
  Fitness: FcSportsMode,
  Accounting: FcEngineering,
  'Computer Science': FcMultipleDevices,
  Filmmaking: FcFilmReel,
  Engineering: FcEngineering,
}

export function Categories({ items }: CategoriesProps) {
  return (
    <div className="flex items-center gap-x-2 overflow-x-auto pb-2">
      {items.map((item) => (
        <CategoryItem
          key={item.id}
          label={item.name}
          icon={iconMap[item.name] || null}
          value={item.id}
        />
      ))}
    </div>
  )
}
