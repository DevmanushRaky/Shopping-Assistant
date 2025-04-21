import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-8">ShopSmart</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/products">
          <Button size="lg">Browse Products</Button>
        </Link>
        <Link href="/chat">
          <Button size="lg" variant="outline">
            Chat with Assistant
          </Button>
        </Link>
      </div>
    </div>
  )
}
