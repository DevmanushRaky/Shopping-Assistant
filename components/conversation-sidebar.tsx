"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, MessageSquare, Plus, ShoppingBag, Tag, BarChart2, Trash2 } from "lucide-react"
import { format } from "date-fns"

type Conversation = {
  id: string
  title: string
  messages: any[]
  createdAt: Date
  displayType?: string
}

interface ConversationSidebarProps {
  conversations: Conversation[]
  currentConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  isOpen: boolean
  onToggle: () => void
  onDeleteConversation: (id: string) => void
}

export function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  isOpen,
  onToggle,
  onDeleteConversation,
}: ConversationSidebarProps) {
  // Function to get the appropriate icon based on conversation type
  const getConversationIcon = (type?: string) => {
    switch (type) {
      case "products":
        return <ShoppingBag className="h-4 w-4" />
      case "categories":
        return <Tag className="h-4 w-4" />
      case "comparison":
        return <BarChart2 className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <>
      {/* Mobile sidebar toggle */}
      <Button variant="outline" size="icon" className="fixed left-4 top-4 z-40 md:hidden" onClick={onToggle}>
        {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 bg-gray-100 dark:bg-gray-800 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <Button onClick={onNewConversation} className="w-full justify-start gap-2" variant="default">
              <Plus className="h-4 w-4" />
              {isOpen && <span>New Chat</span>}
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center w-full mb-1">
                    <Button
                      variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                      className={cn(
                        "flex-1 justify-start overflow-hidden",
                        isOpen ? "px-3 py-2 text-left" : "px-2 py-2",
                      )}
                      onClick={() => onSelectConversation(conversation.id)}
                    >
                      <div className="flex items-center w-full">
                        <div className="mr-2 flex-shrink-0">{getConversationIcon(conversation.displayType)}</div>
                        {isOpen && (
                          <span className="truncate text-xs font-medium max-w-[90px]">{conversation.title}</span>
                        )}
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      title="Delete chat"
                      onClick={(e) => { e.stopPropagation(); onDeleteConversation(conversation.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  {isOpen && <p>No conversations yet</p>}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
