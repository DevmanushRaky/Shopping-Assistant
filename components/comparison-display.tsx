import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface ComparisonDisplayProps {
  products: Array<{
    id: number
    name: string
    price: number
    image: string
    specs: {
      display: string
      battery: string
      waterResistant: string
      connectivity: string
      healthFeatures: string[]
    }
  }>
}

export function ComparisonDisplay({ products }: ComparisonDisplayProps) {
  if (!products.length) return null

  return (
    <div className="my-4 max-w-3xl mx-auto overflow-x-auto">
      <Card>
        <CardHeader className="pb-0">
          <h3 className="text-lg font-medium">Product Comparison</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="col-span-1"></div>
            {products.map((product) => (
              <div key={product.id} className="text-center">
                <div className="relative h-24 w-24 mx-auto mb-2">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
                </div>
                <h4 className="font-medium text-sm">{product.name}</h4>
                <p className="text-primary font-bold">${product.price}</p>
              </div>
            ))}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                {products.map((product) => (
                  <TableHead key={product.id} className="text-center">
                    {product.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Display</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    {product.specs.display}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Battery Life</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    {product.specs.battery}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Water Resistance</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    {product.specs.waterResistant}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Connectivity</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    {product.specs.connectivity}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Health Features</TableCell>
                {products.map((product) => (
                  <TableCell key={product.id} className="text-center">
                    <div className="flex flex-col gap-1">
                      {product.specs.healthFeatures.map((feature, index) => (
                        <Badge key={index} variant="outline" className="justify-center">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
