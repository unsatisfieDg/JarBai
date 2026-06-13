// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Bot, ChevronRight } from 'lucide-react';

function formatDate(iso) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function Sidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, collapsed, onToggleCollapse }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Group chats by date
  const groups = {};
  chats.forEach((c) => {
    const label = formatDate(c.updatedAt || c.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(c);
  });

  return (
    <div
      style={{
        width: collapsed ? 56 : 240,
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: collapsed ? '16px 12px' : '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #3730a3, #6c8fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={14} color="white" />
            </div>
            <span className="gradient-text" style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>
              JarBai
            </span>
          </div>
        )}
        {collapsed && (
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #3730a3, #6c8fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Bot size={14} color="white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
            padding: 2, borderRadius: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ChevronRight size={15} style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: collapsed ? '10px 8px' : '10px 12px' }}>
        <button
          onClick={onNewChat}
          title="New Chat"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8,
            padding: collapsed ? '8px' : '8px 12px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontFamily: 'inherit',
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-glow)';
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-elevated)';
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Plus size={15} />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '0 8px' : '0 8px' }}>
        {!collapsed && Object.entries(groups).map(([label, groupChats]) => (
          <div key={label}>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 8px 4px' }}>
              {label}
            </p>
            {groupChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                active={chat.id === activeChatId}
                hovered={hoveredId === chat.id}
                onSelect={() => onSelectChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
                onMouseEnter={() => setHoveredId(chat.id)}
                onMouseLeave={() => setHoveredId(null)}
              />
            ))}
          </div>
        ))}
        {collapsed && chats.map((chat) => (
          <button
            key={chat.id}
            title={chat.title}
            onClick={() => onSelectChat(chat.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', margin: '2px 0',
              background: chat.id === activeChatId ? 'var(--bg-hover)' : 'none',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              color: chat.id === activeChatId ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <MessageSquare size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatItem({ chat, active, hovered, onSelect, onDelete, onMouseEnter, onMouseLeave }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 6,
        margin: '1px 0',
        background: active ? 'var(--bg-hover)' : hovered ? 'rgba(255,255,255,0.03)' : 'none',
        transition: 'background 0.15s',
        cursor: 'pointer',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        onClick={onSelect}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 8px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', minWidth: 0,
        }}
      >
        <MessageSquare size={13} style={{ color: active ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }} />
        <span style={{
          fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: active ? 500 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {chat.title || 'New Chat'}
        </span>
      </button>
      {hovered && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete chat"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px 6px', borderRadius: 4, flexShrink: 0,
            display: 'flex', alignItems: 'center',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
