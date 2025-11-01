# ChatBotX - AI Chat Application with Poe API

A modern chat application integrated with Poe API, supporting multiple AI models with session management and IndexedDB storage.

## Features

- 🤖 **Multiple AI Models**: Support for GPT-5-mini and GPT-5-nano via Poe API
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

### 2. Configure Poe API

Create a `.env` file in the root directory:

```sh
VITE_POE_API_KEY=your_poe_api_key_here
```

Get your API key from: https://poe.com/api_key

### 3. Start Development Server

```sh
npm run dev
```

## Available Models

The application supports the following Poe models:
- **GPT-5-mini**: Balanced performance and speed
- **GPT-5-nano**: Fast and lightweight responses

## Usage

1. **Create a New Chat**: Click the "+ Chat" button next to any model in the sidebar
2. **Switch Sessions**: Click on any session in the Sessions list
3. **Delete Sessions**: Click the three-dot menu on a session and select "Delete"
4. **Send Messages**: Type your message and press Enter or click the send button

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
