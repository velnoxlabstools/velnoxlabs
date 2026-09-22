'use client';

import { useCallback, useState, type DragEvent } from 'react';

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  label?: string;
}

export function FileDropZone({
  accept,
  multiple,
  onFiles,
  label = 'Drag & drop files here, or click to browse',
}: FileDropZoneProps) {
  const [active, setActive] = useState(false);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setActive(false);
      const list = Array.from(e.dataTransfer.files ?? []);
      if (!list.length) return;
      onFiles(multiple ? list : list.slice(0, 1));
    },
    [multiple, onFiles]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        setActive(true);
      }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
      style={{
        padding: 'var(--space-8)',
        borderRadius: 'var(--radius-lg)',
        border: `2px dashed ${active ? 'var(--primary)' : 'var(--border)'}`,
        background: active ? 'var(--accent)' : 'var(--muted)',
        textAlign: 'center',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--muted-foreground)',
        cursor: 'pointer',
      }}
    >
      {label}
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => {
          const list = Array.from(e.target.files ?? []);
          if (list.length) onFiles(list);
        }}
        style={{
          display: 'block',
          margin: 'var(--space-3) auto 0',
          fontSize: 'var(--font-size-xs)',
        }}
      />
    </div>
  );
}
