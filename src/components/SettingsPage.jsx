// src/components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Save, Trash2, Key, Bot, Palette, Type, X, ExternalLink } from 'lucide-react';
import { getSettings, saveSettings } from '../utils/storage.js';
import { MODELS } from '../utils/models.js';
import { useToast } from './Toast.jsx';

export default function SettingsPage({ onClose }) {
  const toast = useToast();
  const [settings, setSettings] = useState({
    apiKey: '',
    defaultModelId: MODELS[1].id,
    fontSize: 14,
  });
  const [showKey, setShowKey] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const saved = getSettings();
    setSettings((prev) => ({ ...prev, ...saved }));
  }, []);

  function update(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  function handleSave() {
    saveSettings(settings);
    setDirty(false);
    toast({ message: 'Settings saved!', type: 'success' });
  }

  function handleClearChats() {
    if (!confirm('Delete all chat history? This cannot be undone.')) return;
    localStorage.removeItem('jarbai_chats');
    localStorage.removeItem('jarbai_active_chat');
    toast({ message: 'Chat history cleared', type: 'info' });
    onClose();
    window.location.reload();
  }

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          width: '100%', maxWidth: 520, margin: '0 16px',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}
        className="animate-fade-in-up"
      >
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Settings</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Configure JarBai preferences</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, maxHeight: '70vh', overflowY: 'auto' }}>

          {/* API Key */}
          <Section icon={<Key size={15} />} title="OpenRouter API Key" subtitle={<>Get a free key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>openrouter.ai/keys <ExternalLink size={10} style={{ display: 'inline' }} /></a></>}>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={settings.apiKey}
                onChange={(e) => update('apiKey', e.target.value)}
                placeholder="sk-or-v1-..."
                spellCheck={false}
                style={{
                  width: '100%', padding: '9px 36px 9px 12px',
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                  outline: 'none', transition: 'border-color 0.15s',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Section>

          {/* Default Model */}
          <Section icon={<Bot size={15} />} title="Default AI Model" subtitle="Used when starting a new chat">
            <select
              value={settings.defaultModelId}
              onChange={(e) => update('defaultModelId', e.target.value)}
              style={{
                width: '100%', padding: '9px 12px',
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: 13, outline: 'none',
                cursor: 'pointer',
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label} — {m.badge}</option>
              ))}
            </select>
          </Section>

          {/* Font Size */}
          <Section icon={<Type size={15} />} title="Chat Font Size" subtitle={`Current: ${settings.fontSize}px`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="range" min={12} max={18} step={1}
                value={settings.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: 13, color: 'var(--text-primary)', width: 32, textAlign: 'right', fontWeight: 500 }}>
                {settings.fontSize}px
              </span>
            </div>
          </Section>

          {/* Danger Zone */}
          <Section icon={<Trash2 size={15} />} title="Danger Zone" subtitle="Irreversible actions" danger>
            <button
              onClick={handleClearChats}
              style={{
                padding: '8px 16px', background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                color: 'var(--error)', fontSize: 13, fontFamily: 'inherit',
                fontWeight: 500, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
            >
              Clear All Chat History
            </button>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 16px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'inherit' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            style={{
              padding: '8px 20px', background: dirty ? 'var(--accent)' : 'var(--bg-elevated)',
              border: '1px solid ' + (dirty ? 'var(--accent)' : 'var(--border)'),
              borderRadius: 'var(--radius-sm)', cursor: dirty ? 'pointer' : 'not-allowed',
              color: dirty ? 'white' : 'var(--text-muted)', fontSize: 13, fontFamily: 'inherit',
              fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s',
            }}
          >
            <Save size={13} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, subtitle, danger, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ color: danger ? 'var(--error)' : 'var(--accent)' }}>{icon}</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: danger ? 'var(--error)' : 'var(--text-primary)' }}>{title}</p>
          {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}
