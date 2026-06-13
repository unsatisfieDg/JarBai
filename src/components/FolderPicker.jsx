// src/components/FolderPicker.jsx
import React, { useRef } from 'react';
import { FolderOpen, X } from 'lucide-react';

export default function FolderPicker({ folder, onSelect, onClear }) {
  const inputRef = useRef(null);

  function handleChange(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Extract folder path from the first file's webkitRelativePath
      const relativePath = files[0].webkitRelativePath;
      const folderName = relativePath.split('/')[0];
      onSelect(folderName);
    }
    // Reset input so same folder can be selected again
    e.target.value = '';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {folder ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px 8px',
          fontSize: 12, color: 'var(--text-secondary)', maxWidth: 180,
        }}>
          <FolderOpen size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{folder}</span>
          <button
            onClick={onClear}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
            title="Clear folder"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          title="Select project folder"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: '1px dashed var(--border)',
            borderRadius: 6, padding: '4px 10px',
            cursor: 'pointer', color: 'var(--text-muted)',
            fontSize: 12, fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--warning)'; e.currentTarget.style.color = 'var(--warning)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <FolderOpen size={13} />
          <span>Set Folder</span>
        </button>
      )}
      {/* Hidden folder input */}
      <input
        ref={inputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
        onChange={handleChange}
      />
    </div>
  );
}
