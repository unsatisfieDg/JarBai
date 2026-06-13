# JarBai Project Context

## What is JarBai?
JarBai is a custom AI assistant GUI that connects to OpenRouter's free LLMs
through a clean, modern chat interface. It supports coding tasks, complex
reasoning, and daily tasks. Name inspired by JARVIS + "Bai" (Bisaya for buddy).

## Tech Stack
- Frontend: React 18 + TailwindCSS v3
- Build Tool: Vite
- Desktop: Electron
- Backend: Node.js + Express (web app mode)
- AI: OpenRouter API (streaming responses)
- Markdown: react-markdown + remark-gfm
- Syntax Highlighting: react-syntax-highlighter

## Key Files
- src/App.jsx — main app entry and routing
- src/components/ChatWindow.jsx — core chat UI
- src/components/MessageBubble.jsx — message rendering with markdown + code highlighting
- src/components/ModelSwitcher.jsx — AI model selection dropdown
- src/components/Sidebar.jsx — chat history + navigation
- src/components/SettingsPage.jsx — API key + preferences
- src/utils/openrouter.js — handles all OpenRouter API calls (streaming)
- src/utils/storage.js — localStorage helpers
- src/utils/models.js — list of available free models
- server/index.js — Express backend for web mode
- electron/main.js — Electron desktop entry

## Coding Rules
- Use functional React components with hooks only
- TailwindCSS only for styling (no inline styles unless dynamic)
- All API keys come from localStorage (entered via Settings page)
- Keep components small and single-responsibility
- Streaming responses preferred over batch responses
- Dark mode is the default theme

## Available Free Models
- nvidia/nemotron-3-ultra-550b-a55b:free — 1M context, best for reasoning
- meta-llama/llama-3.3-70b-instruct:free — general tasks
- qwen/qwen-2.5-coder-32b-instruct:free — coding
- deepseek/deepseek-r1:free — logic + math
- google/gemini-2.0-flash-exp:free — fast responses
