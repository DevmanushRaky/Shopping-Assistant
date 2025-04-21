# ShopSmart: AI-Powered Shopping Assistant

ShopSmart is a modern e-commerce web application featuring a powerful AI chatbot assistant. It helps users find products, compare options, get gift suggestions, and answer shopping-related questions—all with a beautiful, user-friendly interface.

## 🛍️ Overview
ShopSmart combines a rich product catalog with an intelligent Gemini-powered chatbot. Users can browse products, search by category or price, compare items, and get personalized recommendations—all in real time.

## ✨ Features
- **AI Chatbot Assistant**: Ask questions about products, categories, prices, or get gift ideas. The chatbot responds with relevant product cards, comparisons, or category suggestions.
- **Product Search & Filtering**: Find products by name, category, or price (e.g., "show me electronics under $100").
- **Product Comparison**: Ask the assistant to compare two or more products and see a detailed comparison table.
- **Gift Suggestions**: Get curated gift ideas for occasions like Mother's Day, birthdays, and more.
- **Multi-Session Chat**: Start, switch, and delete multiple chat sessions. Each session stores its full conversation history (user + assistant) in localStorage.
- **Persistent Chat History**: All conversations are saved locally, so you can revisit and continue any chat after refreshing or returning later.
- **Modern UI**: Responsive, clean design with product cards, category displays, and a sidebar for chat management.

## 🤖 AI Chatbot Details
- **Powered by Gemini API**: The chatbot uses Google Gemini for natural language understanding and generation.
- **Context-Aware**: The assistant only answers questions about the website's products, categories, and features. It will politely refuse unrelated queries.
- **Smart Product Matching**: The backend matches user queries to product names, categories, price filters, and even gift suggestions, returning only the most relevant results.
- **Real-Time Responses**: User and assistant messages are shown in order, with product cards or category cards displayed as appropriate.

## 🚀 Getting Started
1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```
3. **Set up your .env file**
   - Add your Gemini API URL and API key:
     ```env
     VITE_GEMINI_API_URL=your_gemini_api_url
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```
4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser**

## 🛠️ Technologies Used
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Tailwind CSS**
- **Google Gemini API** (Generative Language)
- **next-themes** (for dark/light mode)
- **lucide-react** (icons)

## 📦 Project Structure
- `app/` — Main application pages and chat logic
- `components/` — UI components (chat, sidebar, product display, etc.)
- `lib/` — Product and category data
- `app/api/chat/route.ts` — Chatbot backend logic (product matching, Gemini integration)

## 💡 Example Queries
- "Show me only yoga mat products under $40"
- "Compare Sony WH-1000XM5 and Bose QuietComfort Ultra"
- "I need gift ideas for Mother's Day"
- "What electronics categories do you have?"
- "I want a kitchen appliance for baking"

#
---

Enjoy your AI-powered shopping experience with ShopSmart! 