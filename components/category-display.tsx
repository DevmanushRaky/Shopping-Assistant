import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface CategoryDisplayProps {
  categories: Array<{
    id: number
    name: string
    image: string
    count: number
  }>
}

export function CategoryDisplay({ categories }: CategoryDisplayProps) {
  if (!categories.length) return null

  return (
    <div className="my-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((category) => (
          <Card key={category.id} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
            <div className="relative h-32 w-full bg-gray-100">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="text-center text-white p-2">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <p className="text-sm">{category.count} items</p>
                </div>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs text-gray-500">Browse {category.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
