// src/components/Toast.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timerMap = useRef({});

  const dismiss = useCallback((id) => {
    clearTimeout(timerMap.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ message, type = 'info', duration = 3000 }) => {
      const id = Date.now();
      setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
      timerMap.current[id] = setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }) {
  const icons = {
    success: <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />,
    error:   <XCircle    size={15} style={{ color: 'var(--error)',   flexShrink: 0 }} />,
    info:    <Info       size={15} style={{ color: 'var(--accent)',  flexShrink: 0 }} />,
  };

  return (
    <div className={`toast ${toast.type}`}>
      {icons[toast.type]}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
