"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { ShoppingMessage } from "@/components/shopping-message"
import { ProductDisplay } from "@/components/product-display"
import { CategoryDisplay } from "@/components/category-display"
import { ComparisonDisplay } from "@/components/comparison-display"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mic, MicOff, Send, Plus, ShoppingBag } from "lucide-react"
import { ConversationSidebar } from "@/components/conversation-sidebar"
import { cn } from "@/lib/utils"
import { sampleConversations } from "@/lib/sample-data"
import Link from "next/link"
import type { Message } from "ai"

type Conversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  displayType?: string
  displayData?: any
}

// Add TypeScript declaration for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    speechRecognition: any
  }
}

export default function ShoppingAssistant() {
  const [showProducts, setShowProducts] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    onResponse: async (response) => {
      // Parse the response as JSON
      const data = await response.json();
      console.log("Assistant response data:", data);

      // Add the assistant's message to the chat
      if (data && data.content) {
        const assistantMsg: Message = {
          id: data.id || Date.now().toString(),
          role: "assistant",
          content: data.content,
        };
        setMessages((prev: Message[]) => {
          const updated = [...prev, assistantMsg];
          if (currentConversationId) {
            setConversations((prevConvs) => {
              const updatedConvs = prevConvs.map((conv) => {
                if (conv.id === currentConversationId) {
                  // Save products/categories with the conversation for this message
                  let displayType = conv.displayType;
                  let displayData = conv.displayData;
                  if (data.products) {
                    displayType = "products";
                    displayData = data.products;
                  } else if (data.categories) {
                    displayType = "categories";
                    displayData = data.categories;
                  }
                  return { ...conv, messages: updated, displayType, displayData };
                }
                return conv;
              });
              localStorage.setItem("shoppingConversations", JSON.stringify(updatedConvs));
              return updatedConvs;
            });
          }
          // Set product/category display for the UI
          if (data.products) {
            setSearchResults(data.products);
            setShowProducts(true);
            setShowCategories(false);
            setShowComparison(false);
          } else if (data.categories) {
            setSearchResults(data.categories);
            setShowProducts(false);
            setShowCategories(true);
            setShowComparison(false);
          }
          return updated;
        });
      }
      // If there are products, display them
      if (data.products) {
        setSearchResults(data.products);
        setShowProducts(true);
        setShowCategories(false);
        setShowComparison(false);
      }
      // If there are categories, display them (if you have a CategoryDisplay component)
      if (data.categories) {
        setSearchResults(data.categories);
        setShowProducts(false);
        setShowCategories(true);
        setShowComparison(false);
      }
    },
    onFinish: (message) => {
      // Save conversation after each message
      saveCurrentConversation()
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("shoppingConversations")
    if (stored) {
      const parsed: Conversation[] = JSON.parse(stored)
      setConversations(parsed)
      if (parsed.length > 0) setCurrentConversationId(parsed[0].id)
    }
  }, [])

  const fetchMockProducts = () => {
    // This is a mock function - in a real app, you would fetch from your product API
    const mockProducts = [
      {
        id: 1,
        name: "Wireless Headphones",
        price: 129.99,
        image: "/diverse-music-lovers.png",
        description: "Premium noise-cancelling wireless headphones",
      },
      {
        id: 2,
        name: "Smart Watch",
        price: 249.99,
        image: "/modern-smartwatch-display.png",
        description: "Fitness and health tracking smartwatch",
      },
      {
        id: 3,
        name: "Bluetooth Speaker",
        price: 79.99,
        image: "/audio-system.png",
        description: "Portable waterproof bluetooth speaker",
      },
      {
        id: 4,
        name: "Laptop Backpack",
        price: 59.99,
        image: "/colorful-travel-backpack.png",
        description: "Durable laptop backpack with USB charging port",
      },
    ]

    setSearchResults(mockProducts)
    setShowProducts(true)
    setShowCategories(false)
    setShowComparison(false)
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      console.log("User message:", input)
      let convId = currentConversationId
      if (!convId) {
        convId = createNewConversation()
      }
      setCurrentConversationId(convId);
      // Only call handleSubmit, do not manually add the user message
      handleSubmit(e)
    }
  }

  const createNewConversation = () => {
    const newId = Date.now().toString()
    const newConversation: Conversation = {
      id: newId,
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    const updated = [newConversation, ...conversations]
    setConversations(updated)
    setCurrentConversationId(newId)
    setMessages([])
    setShowProducts(false)
    setShowCategories(false)
    setShowComparison(false)
    localStorage.setItem("shoppingConversations", JSON.stringify(updated))
    return newId
  }

  const saveCurrentConversation = () => {
    if (!currentConversationId) return
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === currentConversationId) {
        // Use the first user message as the title
        const firstUserMessage = conv.messages.find((m) => m.role === "user")
        let title = "New Chat"
        if (firstUserMessage) {
          title = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
        }
        return {
          ...conv,
          messages: [...messages],
          title,
        }
      }
      return conv
    })
    setConversations(updatedConversations)
    localStorage.setItem("shoppingConversations", JSON.stringify(updatedConversations))
  }

  const loadConversation = (id: string) => {
    const conversation = conversations.find((c) => c.id === id)
    if (conversation) {
      setCurrentConversationId(id)
      setMessages(conversation.messages as Message[])
      setShowProducts(conversation.displayType === "products")
      setShowCategories(conversation.displayType === "categories")
      setShowComparison(conversation.displayType === "comparison")
      if (conversation.displayData) {
        setSearchResults(conversation.displayData)
      } else {
        setSearchResults([])
      }
    }
  }

  const onDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    if (currentConversationId === id) {
      setCurrentConversationId(updated[0]?.id || null)
      setMessages(updated[0]?.messages || [])
    }
    localStorage.setItem("shoppingConversations", JSON.stringify(updated))
  }

  const toggleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  const startRecording = () => {
    setIsRecording(true)

    // Check if browser supports SpeechRecognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        handleInputChange({ target: { value: transcript } } as React.ChangeEvent<HTMLInputElement>)
      }

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
      }

      // Store the recognition instance to stop it later
      window.speechRecognition = recognition
      recognition.start()
    } else {
      alert("Speech recognition is not supported in your browser")
      setIsRecording(false)
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (window.speechRecognition) {
      window.speechRecognition.stop()
    }
  }

  // Update conversation title after first user message is added
  useEffect(() => {
    if (!currentConversationId) return
    const conv = conversations.find((c) => c.id === currentConversationId)
    if (!conv) return
    const firstUserMessage = messages.find((m) => m.role === "user")
    if (firstUserMessage && conv.title === "New Chat") {
      const newTitle = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
      const updatedConvs = conversations.map((c) =>
        c.id === currentConversationId ? { ...c, title: newTitle } : c
      )
      setConversations(updatedConvs)
      localStorage.setItem("shoppingConversations", JSON.stringify(updatedConvs))
    }
  }, [messages, currentConversationId])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header for mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 md:hidden">
        <div className="flex items-center justify-between p-4">
          <h1 className="font-bold text-lg">Shopping Assistant</h1>
          <Link href="/products">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={loadConversation}
        onNewConversation={createNewConversation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onDeleteConversation={onDeleteConversation}
      />

      {/* Main Content */}
      <div
        className={cn("flex flex-col flex-1 h-full transition-all duration-300", isSidebarOpen ? "md:ml-64" : "ml-0")}
      >
        {/* Desktop header with link to products */}
        <div className="hidden md:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="font-bold text-xl">Shopping Assistant</h1>
          <Link href="/products">
            <Button variant="outline" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Browse Products
            </Button>
          </Link>
        </div>

        <main className="flex flex-col flex-1 h-full max-w-4xl mx-auto w-full">
          {/* Messages Container */}
          <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 mt-16 md:mt-0">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold">Shopping Assistant</h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    Ask me about products or search for something specific.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  const isLastAssistant =
                    index === messages.length - 1 && message.role === "assistant" && searchResults.length > 0;
                  return (
                    <div key={message.id}>
                      <ShoppingMessage message={message} />
                      {isLastAssistant && <ProductDisplay products={searchResults} />}
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            <form onSubmit={handleFormSubmit} className="flex items-center gap-2 max-w-3xl mx-auto">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={createNewConversation}
                title="New conversation"
              >
                <Plus className="h-4 w-4" />
              </Button>
              <div className="relative flex-1">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Message the shopping assistant..."
                  className="pr-10 py-6"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={toggleRecording}
                >
                  {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
