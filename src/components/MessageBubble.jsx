// src/components/MessageBubble.jsx
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Bot, User } from 'lucide-react';

// ─── Code Block with copy button ───────────────────────────────────────────
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'text'}</span>
        <button className={`code-block-copy ${copied ? 'copied' : ''}`} onClick={handleCopy}>
          {copied ? (
            <><Check size={11} style={{ marginRight: 3 }} />Copied!</>
          ) : (
            <><Copy size={11} style={{ marginRight: 3 }} />Copy</>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, background: 'transparent' }}
        codeTagProps={{ style: { fontFamily: "'JetBrains Mono', monospace" } }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

// ─── Markdown renderer ──────────────────────────────────────────────────────
function MarkdownContent({ content }) {
  return (
    <div className="prose-jarbai">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            if (!inline && match) {
              return <CodeBlock language={match[1]}>{children}</CodeBlock>;
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Override pre to avoid double wrapping
          pre({ children }) {
            return <>{children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// ─── Typing indicator ──────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="typing-dots">
      <span /><span /><span />
    </div>
  );
}

// ─── Main MessageBubble ────────────────────────────────────────────────────
export default function MessageBubble({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div
      className="animate-fade-in-up"
      style={{
        display: 'flex',
        gap: 12,
        padding: '16px 0',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: isUser ? 'var(--user-bubble)' : 'linear-gradient(135deg, #3730a3, #6c8fff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          border: '1px solid var(--border)',
        }}
      >
        {isUser ? (
          <User size={15} color="var(--accent)" />
        ) : (
          <Bot size={15} color="white" />
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '80%',
          minWidth: 60,
          background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)',
          border: `1px solid ${isUser ? 'rgba(108,143,255,0.2)' : 'var(--border)'}`,
          borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
          padding: '10px 14px',
          position: 'relative',
        }}
      >
        {/* Role label */}
        <p style={{ fontSize: 11, fontWeight: 600, marginBottom: 6, color: isUser ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {isUser ? 'You' : 'JarBai'}
        </p>

        {/* Content */}
        {isStreaming && !message.content ? (
          <TypingIndicator />
        ) : (
          <>
            <MarkdownContent content={message.content || ''} />
            {isStreaming && <span className="cursor-blink" />}
          </>
        )}

        {/* Timestamp */}
        {message.timestamp && !isStreaming && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, textAlign: isUser ? 'left' : 'right' }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
}
