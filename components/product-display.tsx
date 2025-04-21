import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ShoppingCart, Star } from "lucide-react"

interface ProductDisplayProps {
  products: Array<{
    id: number
    name: string
    price: number
    originalPrice?: number
    image: string
    description: string
    rating?: number
  }>
}

export function ProductDisplay({ products }: ProductDisplayProps) {
  if (!products.length) return null

  return (
    <div className="my-4 max-w-3xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden flex flex-col h-full">
            <div className="relative h-32 w-full bg-gray-100">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              {product.originalPrice && (
                <Badge className="absolute top-2 right-2 bg-red-500">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              )}
            </div>
            <CardContent className="p-3 flex-1">
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <div className="flex items-center gap-2">
                {typeof product.price === 'number' ? (
                  <p className="text-primary font-bold text-sm">${product.price.toFixed(2)}</p>
                ) : (
                  <p className="text-primary font-bold text-sm">N/A</p>
                )}
                {typeof product.originalPrice === 'number' && (
                  <p className="text-gray-500 text-xs line-through">${product.originalPrice.toFixed(2)}</p>
                )}
              </div>
              {product.rating && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs">{product.rating}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">{product.description}</p>
            </CardContent>
            <CardFooter className="p-3 pt-0">
              <Button className="w-full" size="sm" variant="secondary">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
