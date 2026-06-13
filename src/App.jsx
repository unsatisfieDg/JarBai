// src/App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { ToastProvider } from './components/Toast.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import {
  getAllChats, saveChat, deleteChat, createNewChat,
  getActiveChat, setActiveChat, getSetting, setSetting,
} from './utils/storage.js';
import { DEFAULT_MODEL, getModelById } from './utils/models.js';

export default function App() {
  const [chats, setChats]               = useState(() => getAllChats());
  const [activeChatId, setActiveChatId] = useState(() => getActiveChat() || null);
  const [modelId, setModelId]           = useState(() => getSetting('defaultModelId', DEFAULT_MODEL.id));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize]         = useState(() => getSetting('fontSize', 14));

  // Re-read font size when settings change
  useEffect(() => {
    setFontSize(getSetting('fontSize', 14));
  }, [showSettings]);

  // Active chat object
  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Create a new chat and set it as active
  function handleNewChat() {
    const chat = createNewChat(modelId);
    const updated = [chat, ...chats];
    setChats(updated);
    saveChat(chat);
    setActiveChatId(chat.id);
    setActiveChat(chat.id);
  }

  // Select an existing chat
  function handleSelectChat(id) {
    setActiveChatId(id);
    setActiveChat(id);
  }

  // Delete a chat
  function handleDeleteChat(id) {
    deleteChat(id);
    const updated = chats.filter((c) => c.id !== id);
    setChats(updated);
    if (activeChatId === id) {
      const next = updated[0];
      setActiveChatId(next?.id || null);
      setActiveChat(next?.id || '');
    }
  }

  // Update chat (messages, title, folder, etc.)
  const handleUpdateChat = useCallback((updatedOrFn) => {
    setChats((prev) => {
      const resolved = typeof updatedOrFn === 'function'
        ? updatedOrFn(prev.find((c) => c.id === activeChatId))
        : updatedOrFn;
      if (!resolved) return prev;
      const next = prev.map((c) => c.id === resolved.id ? resolved : c);
      saveChat(resolved);
      return next;
    });
  }, [activeChatId]);

  // Update just the title
  const handleUpdateTitle = useCallback((title) => {
    setChats((prev) => {
      const next = prev.map((c) =>
        c.id === activeChatId ? { ...c, title } : c
      );
      const found = next.find((c) => c.id === activeChatId);
      if (found) saveChat(found);
      return next;
    });
  }, [activeChatId]);

  // Model change
  function handleModelChange(id) {
    setModelId(id);
    setSetting('defaultModelId', id);
  }

  // Auto-create a chat if none exist on first load
  useEffect(() => {
    if (chats.length === 0) {
      const chat = createNewChat(modelId);
      setChats([chat]);
      saveChat(chat);
      setActiveChatId(chat.id);
      setActiveChat(chat.id);
    } else if (!activeChatId) {
      setActiveChatId(chats[0].id);
      setActiveChat(chats[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToastProvider>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-base)', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        />

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Top-right settings button */}
          <div style={{ position: 'absolute', top: 10, right: 16, zIndex: 10 }}>
            <button
              onClick={() => setShowSettings(true)}
              title="Settings"
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <Settings size={15} />
            </button>
          </div>

          {/* Chat */}
          {activeChat ? (
            <ChatWindow
              key={activeChatId}
              chat={activeChat}
              onUpdateChat={handleUpdateChat}
              onUpdateTitle={handleUpdateTitle}
              modelId={modelId}
              onModelChange={handleModelChange}
              fontSize={fontSize}
            />
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <p>Select or create a new chat to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}
    </ToastProvider>
  );
}
