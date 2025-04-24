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
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"
import type { Message } from "ai"

type Conversation = {
  id: string
  title: string
  messages: Message[]
  created_at: string
  display_type?: string
  display_data?: any
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<Message[]>([])

  // Fetch conversations from Supabase on mount
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) {
        console.error('Error fetching conversations:', error)
        return
      }
      setConversations(data || [])
      if (data && data.length > 0) {
        setCurrentConversationId(data[0].id)
        setMessages(data[0].messages || [])
        setShowProducts(data[0].display_type === "products")
        setShowCategories(data[0].display_type === "categories")
        setShowComparison(data[0].display_type === "comparison")
        setSearchResults(data[0].display_data || [])
      }
    }
    fetchConversations()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight
    }
  }, [messages])

  // Chat logic
  const { input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onResponse: async (response) => {
      const data = await response.json();
      if (data && data.content) {
        const assistantMsg: Message = {
          id: data.id || Date.now().toString(),
          role: "assistant",
          content: data.content,
        };
        setMessages((prev: Message[]) => {
          const updated = [...prev, assistantMsg];
          updateCurrentConversation({ messages: updated, display_type: getDisplayType(data), display_data: getDisplayData(data) })
          if (currentConversationId) {
            updateTitleFromGemini(updated, currentConversationId)
          }
          if (data.products) {
            setSearchResults(data.products)
            setShowProducts(true)
            setShowCategories(false)
            setShowComparison(false)
          } else if (data.categories) {
            setSearchResults(data.categories)
            setShowProducts(false)
            setShowCategories(true)
            setShowComparison(false)
          } else {
            setShowProducts(false)
            setShowCategories(false)
            setShowComparison(false)
            setSearchResults([])
          }
          return updated
        })
      }
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    },
    onFinish: () => {
      // No-op, handled in onResponse
    },
  })

  // Helper to get display type/data from LLM response
  function getDisplayType(data: any) {
    if (data.products) return "products"
    if (data.categories) return "categories"
    if (data.comparison) return "comparison"
    return null
  }
  function getDisplayData(data: any) {
    if (data.products) return data.products
    if (data.categories) return data.categories
    if (data.comparison) return data.comparison
    return null
  }

  // Create a new conversation in Supabase
  const createNewConversation = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          title: 'New Chat',
          messages: [],
          display_type: null,
          display_data: null,
        },
      ])
      .select()
      .single()
    if (error) {
      console.error('Error creating conversation:', error)
      return
    }
    const newConversation = data
    setConversations([newConversation, ...conversations])
    setCurrentConversationId(newConversation.id)
    setMessages([])
    setShowProducts(false)
    setShowCategories(false)
    setShowComparison(false)
    setSearchResults([])
    return newConversation.id
  }

  // Update the current conversation in Supabase
  const updateCurrentConversation = async (opts: { messages?: Message[], display_type?: string | null, display_data?: any }) => {
    if (!currentConversationId) return
    const conv = conversations.find((c) => c.id === currentConversationId)
    if (!conv) return
    const firstUserMessage = (opts.messages || conv.messages).find((m) => m.role === "user")
    let title = conv.title
    if (firstUserMessage && title === "New Chat") {
      title = firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
    }
    const { error } = await supabase
      .from('conversations')
      .update({
        messages: opts.messages || conv.messages,
        title,
        display_type: opts.display_type ?? conv.display_type,
        display_data: opts.display_data ?? conv.display_data,
      })
      .eq('id', currentConversationId)
    if (error) {
      console.error('Error updating conversation:', error)
    }
    // Update local state for UI
    setConversations(conversations.map((c) =>
      c.id === currentConversationId
        ? { ...c, messages: opts.messages || c.messages, title, display_type: opts.display_type ?? c.display_type, display_data: opts.display_data ?? c.display_data }
        : c
    ))
  }

  // Load a conversation from Supabase
  const loadConversation = (id: string) => {
    const conversation = conversations.find((c) => c.id === id)
    if (conversation) {
      setCurrentConversationId(id)
      setMessages(conversation.messages as Message[])
      setShowProducts(conversation.display_type === "products")
      setShowCategories(conversation.display_type === "categories")
      setShowComparison(conversation.display_type === "comparison")
      setSearchResults(conversation.display_data || [])
    }
  }

  // Delete a conversation from Supabase
  const onDeleteConversation = async (id: string) => {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
    if (error) {
      console.error('Error deleting conversation:', error)
      return
    }
    const updated = conversations.filter((c) => c.id !== id)
    setConversations(updated)
    if (currentConversationId === id) {
      setCurrentConversationId(updated[0]?.id || null)
      setMessages(updated[0]?.messages || [])
      setShowProducts(false)
      setShowCategories(false)
      setShowComparison(false)
      setSearchResults([])
    }
  }

  // Handle chat form submit
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim()) {
      let convId = currentConversationId
      if (!convId) {
        convId = await createNewConversation()
      }
      setCurrentConversationId(convId)
      // Add user message
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: input,
      }
      const updatedMessages = [...messages, userMsg]
      setMessages(updatedMessages)
      updateCurrentConversation({ messages: updatedMessages })
      if (typeof convId === 'string') {
        updateTitleFromGemini(updatedMessages, convId)
      }
      handleSubmit(e)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }

  // Voice recording logic (unchanged)
  const toggleRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }
  const startRecording = () => {
    setIsRecording(true)
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

  // Add this function to update the title after each message
  async function updateTitleFromGemini(messages: Message[], conversationId: string) {
    if (!conversationId || messages.length === 0) return
    try {
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      })
      const data = await res.json()
      const newTitle = data.title?.trim() || "Chat"
      const conv = conversations.find(c => c.id === conversationId)
      if (conv && conv.title !== newTitle) {
        await supabase
          .from('conversations')
          .update({ title: newTitle })
          .eq('id', conversationId)
        setConversations(conversations =>
          conversations.map(c =>
            c.id === conversationId ? { ...c, title: newTitle } : c
          )
        )
      }
    } catch (e) {
      // fail silently
      console.log("Error updating title from Gemini", e)
    }
  }

  // Add this useEffect for periodic title update every 2 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentConversationId && messages.length > 0) {
        updateTitleFromGemini(messages, currentConversationId)
      }
    }, 120000) // 2 minutes
    return () => clearInterval(interval)
  }, [currentConversationId, messages])

  // UI rendering (unchanged except for state sources)
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
      <div className={cn("flex flex-col flex-1 h-full transition-all duration-300", isSidebarOpen ? "md:ml-64" : "ml-0")}
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
                  ref={inputRef}
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
