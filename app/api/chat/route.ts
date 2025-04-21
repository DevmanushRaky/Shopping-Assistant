import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { allProducts } from "@/lib/product-data"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Find the latest user message
  const lastUserMessage = messages.slice().reverse().find((m: any) => m.role === 'user')?.content || ''

  // Enhanced product/category/price/gift matching
  const userText = lastUserMessage.toLowerCase();
  // 1. Try to extract product names
  const mentionedProducts = allProducts.filter(p => userText.includes(p.name.toLowerCase()));
  if (mentionedProducts.length > 0) {
    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are the details for the product${mentionedProducts.length > 1 ? 's' : ''} you mentioned:\n\n${mentionedProducts.map(p => `- **${p.name}** ($${p.price}): ${p.description}`).join('\n')}`,
        products: mentionedProducts,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 2. Try to extract category
  const allCategories = [
    'electronics', 'clothing', 'home', 'kitchen', 'beauty', 'sports', 'toys', 'gift', 'gifts', 'jewelry', 'spa', 'decor', 'gaming', 'audio', 'wearables', 'cameras', 'laptops', 'smartphones'
  ];
  const foundCategory = allCategories.find(cat => userText.includes(cat));
  if (foundCategory) {
    // Map 'kitchen' to 'home' if needed
    const matchCat = foundCategory === 'kitchen' ? 'home' : foundCategory;
    const catProducts = allProducts.filter(p => p.category?.toLowerCase() === matchCat);
    if (catProducts.length > 0) {
      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: 'assistant',
          content: `Here are some products in the '${foundCategory}' category:`,
          products: catProducts,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // 3. Try to extract price filter
  const priceMatch = userText.match(/under\s*\$?(\d+)/i);
  let maxPrice = priceMatch ? parseFloat(priceMatch[1]) : null;
  if (maxPrice) {
    const priceProducts = allProducts.filter(p => p.price <= maxPrice);
    if (priceProducts.length > 0) {
      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: 'assistant',
          content: `Here are some products under $${maxPrice}:`,
          products: priceProducts,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // 4. Gift suggestion logic
  if (userText.includes('gift')) {
    // Suggest popular gift categories or products
    const giftCategories = [
      { name: 'Jewelry', count: 87 },
      { name: 'Spa & Beauty', count: 64 },
      { name: 'Home Decor', count: 112 },
      { name: 'Kitchen Gadgets', count: 78 },
    ];
    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are some popular gift categories that are often appreciated:`,
        categories: giftCategories,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }

  // 5. Product comparison logic
  const compareMatch = userText.match(/compare|difference|which is better|vs|versus/);
  if (compareMatch) {
    // Try to extract product names for comparison
    const compareProducts = allProducts.filter(p => userText.includes(p.name.toLowerCase()));
    if (compareProducts.length >= 2) {
      // Build a simple comparison summary
      let summary = 'Product Comparison:\n';
      compareProducts.forEach(p => {
        summary += `\n- **${p.name}** ($${p.price}): ${p.description}`;
      });
      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: 'assistant',
          content: summary,
          products: compareProducts,
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Fallback to Gemini if no match
  // Prepare Gemini API request
  const apiUrl = process.env.VITE_GEMINI_API_URL
  const apiKey = process.env.VITE_GEMINI_API_KEY

  if (!apiUrl || !apiKey) {
    return new Response(JSON.stringify({ error: 'Gemini API URL or Key not set' }), { status: 500 })
  }

  // System prompt for Gemini
  const systemPrompt = {
    role: 'model',
    parts: [{ text: `You are a helpful shopping assistant for an e-commerce website. ONLY answer questions about the products, categories, or features available on this website. If a user asks about anything outside this website or unrelated to shopping here, politely refuse and redirect them to ask about the site's products. Do not answer questions about the outside world, general knowledge, or anything not related to this e-commerce site.` }],
  }

  // Log incoming messages
  console.log('Incoming chat messages:', messages)

  // Gemini expects a different message format than OpenAI
  // We'll convert the messages to Gemini's expected format
  const geminiMessages = [
    systemPrompt,
    ...messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })),
  ]

  const body = JSON.stringify({
    contents: geminiMessages,
    generationConfig: {
      temperature: 0.2
    }
  })

  const response = await fetch(`${apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })

  // Log Gemini API response
  console.log('Gemini API response status:', response.status)

  if (!response.ok) {
    const error = await response.text()
    return new Response(JSON.stringify({ error }), { status: 500 })
  }

  // Gemini's response format
  const data = await response.json()
  // Log Gemini API response body
  console.log('Gemini API response body:', data)
  // Extract the model's reply
  const modelReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.'

  // Return in the same format as before
  return new Response(
    JSON.stringify({
      id: Date.now().toString(),
      role: 'assistant',
      content: modelReply,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
