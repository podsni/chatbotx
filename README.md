# ChatBotX - Multi-Provider AI Chat Application

A modern chat application supporting multiple AI providers (Poe, Together AI, Groq, OpenRouter) with session management and IndexedDB storage.

## Features

- 🤖 **Multiple AI Providers**: Support for Poe, Together AI, Groq, and OpenRouter
- 🆓 **Free Models**: Access free AI models via OpenRouter
- 💾 **Session Management**: Create, switch, and delete chat sessions
- 🗄️ **Local Storage**: All sessions and messages stored in IndexedDB
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Real-time Streaming**: Get AI responses in real-time
- 📊 **Metadata Display**: View response time, tokens, and speed

## Setup

### 1. Install Dependencies

```sh
npm install
```

### 2. Configure API Keys

Create a `.env` file in the root directory with your API keys:

```sh
# Poe API (Optional)
VITE_POE_API_KEY=your_poe_api_key_here

# Together AI API (Optional)
VITE_TOGETHER_API_KEY=your_together_api_key_here

# Groq API (Optional)
VITE_GROQ_API_KEY=your_groq_api_key_here

# OpenRouter API (Recommended for free models)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Site info for OpenRouter leaderboard
VITE_SITE_URL=http://localhost:5173
VITE_SITE_NAME=ChatbotX
```

**Get your API keys:**
- **Poe**: https://poe.com/api_key
- **Together AI**: https://api.together.xyz/
- **Groq**: https://console.groq.com/
- **OpenRouter**: https://openrouter.ai/keys (Free tier available!)

**Note**: You only need to configure the providers you want to use. At least one API key is required.

### 3. Start Development Server

```sh
npm run dev
```

## Available Models

### Poe Models
- **GPT-5-mini**: Balanced performance and speed
- **GPT-5-nano**: Fast and lightweight responses
- **Grok-4 Fast Reasoning**: Advanced reasoning capabilities
- **Gemini 2.5 Flash Lite**: Google's fast model

### Together AI Models
- **GPT-OSS-20B**: Open source GPT with 20B parameters
- **Qwen3-Next-80B**: Powerful 80B model from Alibaba
- **Llama-4-Maverick-17B**: Meta's Llama 4 variant
- **GLM-4.5-Air**: Lightweight and efficient

### Groq Models (Lightning Fast)
- **GPT-OSS-20B**: 20B model on Groq LPU
- **Groq-Compound**: Groq's optimized compound model
- **Llama-3.1-8B-Instant**: Ultra-fast instant responses
- **GPT-OSS-120B**: Large 120B model for complex tasks
- **Kimi-K2-Instruct**: Instruction-tuned precision model

### OpenRouter Models (FREE!)
- **Nvidia Nemotron Nano 12B**: Free with vision capabilities
- **MiniMax M2**: Free with great performance
- **Llama 3.2 3B**: Free Meta model
- **Llama 3.1 8B**: Free with solid performance
- **Mistral 7B**: Free with excellent quality
- **And many more free models!**

## OpenRouter Free Models

OpenRouter provides access to many **completely free** AI models! Here's how to use them:

### 1. Get Your Free API Key
Visit https://openrouter.ai/keys and create a free account. No credit card required!

### 2. Add to .env File
```sh
VITE_OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
```

### 3. Restart Development Server
```sh
npm run dev
```

### 4. Access Free Models
Look for models with the "Free" label in the sidebar. These models include:
- Meta Llama models (3.1 8B, 3.2 3B)
- Mistral 7B Instruct
- Nvidia Nemotron Nano 12B
- MiniMax M2
- And many more!

**Tip**: Free models on OpenRouter have rate limits but are perfect for development and personal use!

## Usage

### Basic Chat
1. **Select a Provider**: Choose from Poe, Together AI, Groq, or OpenRouter in the sidebar
2. **Create a New Chat**: Click the "+ Chat" button next to any model
3. **Switch Sessions**: Click on any session in the Sessions list
4. **Delete Sessions**: Click the three-dot menu on a session and select "Delete"
5. **Send Messages**: Type your message and press Enter or click the send button

### Advanced Features
- **Agent Mode**: Run multiple AI models simultaneously on the same prompt
- **Debate Mode**: Create AI debates with different personality types or teams
- **Session Management**: All conversations are saved locally in IndexedDB

## Finding More Free Models

To discover all available free models on OpenRouter:

1. Visit https://openrouter.ai/models
2. Use the "Free" filter to see all free models
3. Copy the model ID (e.g., `meta-llama/llama-3.1-8b-instruct:free`)
4. Add it to the `OPENROUTER_MODELS` constant in `src/lib/openrouterApi.ts`

## Troubleshooting

### OpenRouter API Not Working
1. Check your API key is correctly set in `.env`
2. Restart the development server after adding/changing API keys
3. Check browser console for error messages
4. Verify your API key at https://openrouter.ai/keys

### No Providers Available
- Make sure at least one API key is set in `.env`
- Restart the development server
- Check the browser console for "Environment Variables Check" logs

## Project Structure

```
src/
├── components/
│   ├── ChatArea.tsx         # Main chat interface
│   ├── ChatSidebar.tsx      # Sidebar with sessions and models
│   └── ChatMessage.tsx      # Individual message component
├── lib/
│   ├── db.ts               # IndexedDB service
│   ├── poeApi.ts           # Poe API integration
│   └── utils.ts            # Utility functions
└── pages/
    └── Index.tsx           # Main page with state management
```

## Technologies

- **Vite** - Fast build tool
- **React** - UI framework
- **TypeScript** - Type safety
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **IndexedDB** - Local database
- **Poe API** - AI models

## Project info

**URL**: https://lovable.dev/projects/580a49b9-1db2-444a-919e-e0ef52b117b2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/580a49b9-1db2-444a-919e-e0ef52b117b2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/580a49b9-1db2-444a-919e-e0ef52b117b2) and click on Share -> Publish.

## API Integration Details

### Poe API Endpoints

The application uses the Poe Chat Completions API:
- **Endpoint**: `https://api.poe.com/v1/chat/completions`
- **Method**: POST
- **Authentication**: Bearer token

### Request Format

```json
{
  "model": "GPT-5-mini",
  "messages": [
    {"role": "user", "content": "Hello world"}
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": true
}
```

## Database Schema

### Sessions Table
- `id`: Unique session identifier
- `title`: Session display name
- `timestamp`: Creation timestamp
- `modelName`: Associated AI model
- `lastMessage`: Preview of last message

### Messages Table
- `id`: Unique message identifier
- `sessionId`: Reference to session
- `role`: "user" or "ai"
- `content`: Message text
- `timestamp`: Message timestamp
- `modelName`: Model used (for AI messages)
- `metadata`: Performance metrics

## Deployment

Simply open [Lovable](https://lovable.dev/projects/580a49b9-1db2-444a-919e-e0ef52b117b2) and click on Share -> Publish.

## Custom Domain

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## License

MIT
