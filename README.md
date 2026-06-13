# JarBai — AI Assistant GUI

**JarBai** (JARVIS + "Bai", Bisaya for buddy/friend) is a custom AI assistant desktop and web application powered by **React 18**, **TailwindCSS**, **Vite**, **Electron**, and **Express**. It connects directly to OpenRouter's free-tier LLMs to provide real-time streaming answers for coding, logical reasoning, and everyday assistance.

---

## ✨ Key Features

* **⚡ Real-time Token Streaming**: Watch responses build word-by-word with full markdown rendering and copy-to-clipboard code formatting.
* **📂 Local Folder Context**: Feed local codebase directories to the assistant. JarBai automatically structures the workspace tree and serves as a coding assistant with full context of your codebase.
* **🌐 Web & Desktop Ready**: Run as a sleek responsive web client or compile it into a standalone desktop application via Electron.
* **🤖 Single-Click Model Switching**: Instantly switch between premium free-tier models (Nemotron 550B, Llama 3.3 70B, Qwen 2.5 Coder, DeepSeek R1, Gemini 2.0 Flash) without losing your conversation history.
* **💾 Local Persistence**: All chat threads, selected models, folder pick references, and custom API preferences are securely stored in your browser's local storage.
* **🎨 Modern Premium UI**: Enjoy a gorgeous default dark mode, glassmorphism elements, transitions, custom scrollbars, and interactive buttons.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TailwindCSS v3, Lucide React (Icons)
* **Build Tool**: Vite
* **Desktop Shell**: Electron
* **Local Server**: Express (for file picker and folder utilities in web mode)
* **Markdown rendering**: `react-markdown` + `remark-gfm` + `react-syntax-highlighter`
* **API Connector**: OpenRouter API

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have [Node.js](https://nodejs.org) (v16+ recommended) installed.

### 📥 Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/unsatisfieDg/JarBai.git
cd JarBai
npm install
```

### ⚙️ OpenRouter API Key Setup

1. Go to [OpenRouter.ai](https://openrouter.ai/) and create a free account.
2. Generate an API Key under **Keys**.
3. Launch the app, navigate to **Settings** (gear icon in the bottom-left sidebar), paste your key, and click **Save Settings**.

---

## 💻 Running the App

### Mode A: Standard Web App (Recommended for Browser)

1. Launch both the backend Express helper (used for reading local files and directory trees) and the frontend dev server:
   ```bash
   # Starts Vite server at http://localhost:5173 and Express server at port 5000
   npm run dev
   npm run server
   ```
2. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Mode B: Desktop App (Electron)

1. Run the concurrent Electron launcher which sets up the Vite dev server and opens the native desktop frame:
   ```bash
   npm run electron
   ```

---

## 🤖 Supported Free Models

Switch between these models instantly from the dropdown inside the chat window:

| Model | ID | Focus / Capability |
|---|---|---|
| **NVIDIA Nemotron 3 Ultra** | `nvidia/nemotron-3-ultra-550b-a55b:free` | 1M Context, complex reasoning |
| **Meta Llama 3.3 70B** | `meta-llama/llama-3.3-70b-instruct:free` | Great general-purpose assistant |
| **Qwen 2.5 Coder 32B** | `qwen/qwen-2.5-coder-32b-instruct:free` | Outstanding coding & syntactical tasks |
| **DeepSeek R1** | `deepseek/deepseek-r1:free` | Deep reasoning, logic, and math |
| **Google Gemini 2.0 Flash** | `google/gemini-2.0-flash-exp:free` | Extremely fast responses |

---

## 📂 Project Structure

```
JarBai/
├── electron/
│   ├── main.js             # Electron main process
│   └── preload.js          # Electron preload scripts
├── server/
│   └── index.js            # Express API for directory mapping & file ingestion
├── src/
│   ├── components/
│   │   ├── ChatWindow.jsx   # Main message layout, input panel, model switcher
│   │   ├── MessageBubble.jsx# Render markdown text & code syntax highlighting
│   │   ├── Sidebar.jsx      # Navigation, past chats management
│   │   ├── SettingsPage.jsx # Preferences, user info, system guidelines, API key
│   │   ├── FolderPicker.jsx # Ingest codebases for workspace-level context
│   │   └── Toast.jsx        # Notification popups
│   ├── utils/
│   │   ├── openrouter.js    # Streaming API calls
│   │   ├── storage.js       # LocalStorage helpers
│   │   ├── models.js        # Supported models configuration
│   │   └── systemPrompt.js  # Compiles workspace trees into LLM instructions
│   ├── App.jsx             # Main application shell
│   ├── main.jsx            # React client entrypoint
│   └── index.css           # Styling directives, gradients, animations
├── vite.config.mjs         # Bundler config
└── tailwind.config.cjs     # Styling configuration
```

---

## 📦 Building and Packaging

To package the application into a standalone native executable for your operating system:

```bash
npm run electron:build
```
The compiled binaries will be outputted to the `release/` directory.

---

## 📄 License

This project is licensed under the ISC License. See the `package.json` for details.
