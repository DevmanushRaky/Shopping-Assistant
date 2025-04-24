import type { Message } from "ai"
import { cn } from "@/lib/utils"
import { User, Bot } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface ShoppingMessageProps {
  message: Message
}

export function ShoppingMessage({ message }: ShoppingMessageProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 max-w-3xl mx-auto",
        message.role === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div className={cn("flex items-start gap-3 w-full")}>
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
            message.role === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
          )}
        >
          {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
        </div>
        <div className="flex-1 space-y-2">
          <div className="font-medium">{message.role === "user" ? "You" : "Shopping Assistant"}</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.role === "assistant" ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : (
              message.content
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
