// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Square, Sparkles, FolderOpen } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import ModelSwitcher from './ModelSwitcher.jsx';
import FolderPicker from './FolderPicker.jsx';
import { streamChat } from '../utils/openrouter.js';
import { buildSystemPrompt } from '../utils/systemPrompt.js';
import { getSetting } from '../utils/storage.js';
import { getModelById } from '../utils/models.js';
import { useToast } from './Toast.jsx';

// ─── Welcome Screen ────────────────────────────────────────────────────────
function WelcomeScreen({ modelId, onPrompt }) {
  const model = getModelById(modelId);
  const suggestions = [
    { icon: '💡', text: 'Explain how React hooks work', label: 'Learn' },
    { icon: '🐛', text: 'Help me debug this JavaScript error', label: 'Debug' },
    { icon: '✍️', text: 'Write a professional email for me', label: 'Write' },
    { icon: '🧮', text: 'Walk me through this algorithm step by step', label: 'Reason' },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', gap: 32 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 20,
          background: 'linear-gradient(135deg, #3730a3 0%, #6c8fff 50%, #38bdf8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px', boxShadow: '0 0 40px rgba(108,143,255,0.3)',
        }}>
          <Sparkles size={28} color="white" />
        </div>
        <h1 className="gradient-text" style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 8 }}>
          Hey, I'm JarBai!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 320 }}>
          Smart like JARVIS, friendly like a Bai. Ask me anything — coding, reasoning, writing, daily tasks.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Using</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-glow)', padding: '2px 8px', borderRadius: 99 }}>
            {model.shortLabel}
          </span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 480 }}>
        {suggestions.map((s) => (
          <button
            key={s.text}
            onClick={() => onPrompt(s.text)}
            style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '14px', cursor: 'pointer',
              textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--bg-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-elevated)'; }}
          >
            <span style={{ fontSize: 20, display: 'block', marginBottom: 6 }}>{s.icon}</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.text}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ChatWindow ───────────────────────────────────────────────────────
export default function ChatWindow({ chat, onUpdateChat, onUpdateTitle, modelId, onModelChange, fontSize }) {
  const toast = useToast();
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [folder, setFolder] = useState(chat?.folder || null);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const messages = chat?.messages || [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streaming]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, [input]);

  const handleSend = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || streaming) return;

    const apiKey = getSetting('apiKey', '');
    if (!apiKey) {
      toast({ message: 'Please add your OpenRouter API key in Settings first.', type: 'error', duration: 5000 });
      return;
    }

    setInput('');

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
    const aiMsgId = `msg_${Date.now()}`;
    const aiMsg   = { id: aiMsgId, role: 'assistant', content: '', timestamp: new Date().toISOString() };

    const updatedMessages = [...messages, userMsg, aiMsg];
    onUpdateChat({ ...chat, messages: updatedMessages, updatedAt: new Date().toISOString() });

    // Auto-generate title from first message
    if (messages.length === 0) {
      const title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
      onUpdateTitle(title);
    }

    setStreaming(true);
    setStreamingId(aiMsgId);

    const systemPrompt = buildSystemPrompt({ folder, modelId });
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...updatedMessages
        .filter((m) => m.id !== aiMsgId)
        .map((m) => ({ role: m.role, content: m.content })),
    ];

    let accumulated = '';

    abortRef.current = await streamChat({
      apiKey,
      model: modelId,
      messages: apiMessages,
      onChunk: (chunk) => {
        accumulated += chunk;
        onUpdateChat((prev) => {
          if (!prev) return prev;
          const msgs = prev.messages.map((m) =>
            m.id === aiMsgId ? { ...m, content: accumulated } : m
          );
          return { ...prev, messages: msgs };
        });
      },
      onDone: () => {
        setStreaming(false);
        setStreamingId(null);
      },
      onError: (errMsg) => {
        toast({ message: errMsg, type: 'error', duration: 6000 });
        onUpdateChat((prev) => {
          if (!prev) return prev;
          const msgs = prev.messages.filter((m) => m.id !== aiMsgId);
          return { ...prev, messages: msgs };
        });
        setStreaming(false);
        setStreamingId(null);
      },
    });
  }, [input, streaming, messages, chat, modelId, folder, onUpdateChat, onUpdateTitle, toast]);

  function handleStop() {
    abortRef.current?.abort?.();
    setStreaming(false);
    setStreamingId(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleFolderSelect(f) {
    setFolder(f);
    onUpdateChat({ ...chat, folder: f });
    toast({ message: `Folder set: ${f}`, type: 'info' });
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontSize }}>
      {/* Top Bar */}
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--bg-surface)', flexShrink: 0,
      }}>
        <ModelSwitcher currentModelId={modelId} onSelect={(id) => { onModelChange(id); toast({ message: `Switched to ${getModelById(id).shortLabel}`, type: 'info' }); }} />
        <div style={{ flex: 1 }} />
        <FolderPicker folder={folder} onSelect={handleFolderSelect} onClear={() => { setFolder(null); onUpdateChat({ ...chat, folder: null }); }} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        {messages.length === 0 ? (
          <WelcomeScreen modelId={modelId} onPrompt={handleSend} />
        ) : (
          <div style={{ maxWidth: 760, margin: '0 auto', paddingBottom: 16 }}>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id || `${msg.role}_${msg.timestamp}`}
                message={msg}
                isStreaming={msg.id === streamingId && streaming}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: '12px 20px 16px', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)', flexShrink: 0 }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '8px 8px 8px 14px',
            transition: 'border-color 0.2s',
          }}
            onFocusCapture={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlurCapture={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message JarBai... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: 'inherit',
                resize: 'none', lineHeight: 1.6, maxHeight: 200, overflowY: 'auto',
              }}
            />
            <button
              onClick={streaming ? handleStop : handleSend}
              disabled={!streaming && !input.trim()}
              title={streaming ? 'Stop generation' : 'Send message (Enter)'}
              style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                cursor: (streaming || input.trim()) ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: streaming ? 'rgba(248,113,113,0.15)' : (input.trim() ? 'var(--accent)' : 'var(--bg-hover)'),
                color: streaming ? 'var(--error)' : (input.trim() ? 'white' : 'var(--text-muted)'),
                transition: 'all 0.15s', flexShrink: 0,
              }}
            >
              {streaming ? <Square size={14} fill="currentColor" /> : <Send size={14} />}
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
            JarBai uses free models from OpenRouter. Responses may vary by model.
          </p>
        </div>
      </div>
    </div>
  );
}
