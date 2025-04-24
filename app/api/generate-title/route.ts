import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiUrl = process.env.VITE_GEMINI_API_URL
  const apiKey = process.env.VITE_GEMINI_API_KEY

  if (!apiUrl || !apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API URL or Key not set' }), { status: 500 })
  }

  // System prompt for Gemini to generate only a chat title
  const systemPromptForTitle = {
    role: 'model',
    parts: [{ text: `Given the following chat conversation, generate a short, descriptive, and specific human-readable title (max 8 words) that summarizes the main topic or purpose of the conversation. The title should be clear, specific, and reflect the user's intent. Do NOT include generic words like "Chat" or "Conversation". Only return the title, nothing else.` }],
  }
 
  // Convert messages to Gemini format
  const geminiMessages = [
    systemPromptForTitle,
    ...messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  ]

  const body = JSON.stringify({
    contents: geminiMessages,
    generationConfig: { temperature: 0.2 }
  })

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })

  if (!response.ok) {
    const error = await response.text()
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  const data = await response.json()
  let title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Chat'
  title = title.replace(/[*_`#>\\-]/g, '').replace(/\s+/g, ' ').trim()
  return new Response(JSON.stringify({ title }), { headers: { 'Content-Type': 'application/json' } })
} 