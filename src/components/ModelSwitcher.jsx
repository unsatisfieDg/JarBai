// src/components/ModelSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Cpu, Check } from 'lucide-react';
import { MODELS } from '../utils/models.js';

const COLOR_MAP = {
  emerald: '#34d399',
  blue:    '#60a5fa',
  violet:  '#a78bfa',
  orange:  '#fb923c',
  sky:     '#38bdf8',
};

export default function ModelSwitcher({ currentModelId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = MODELS.find((m) => m.id === currentModelId) || MODELS[1];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '5px 10px',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          fontSize: 12,
          fontFamily: 'inherit',
          transition: 'border-color 0.15s, background 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: COLOR_MAP[current.color], flexShrink: 0 }} />
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{current.shortLabel}</span>
        <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            width: 300,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            boxShadow: 'var(--shadow)',
            zIndex: 100,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '8px 12px 6px', borderBottom: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              Select Model
            </p>
          </div>
          {MODELS.map((model) => {
            const selected = model.id === currentModelId;
            return (
              <button
                key={model.id}
                onClick={() => { onSelect(model.id); setOpen(false); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '10px 12px',
                  background: selected ? 'var(--bg-hover)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_MAP[model.color], marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: selected ? 'var(--accent)' : 'var(--text-primary)' }}>
                      {model.label}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 500, padding: '2px 6px', borderRadius: 4,
                      background: `${COLOR_MAP[model.color]}18`,
                      color: COLOR_MAP[model.color],
                      letterSpacing: '0.04em',
                    }}>
                      {model.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{model.bestFor}</p>
                </div>
                {selected && <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 3 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
