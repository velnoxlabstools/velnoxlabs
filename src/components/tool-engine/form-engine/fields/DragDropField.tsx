'use client';

import { useState, type DragEvent } from 'react';
import type { BaseFieldProps } from './shared';
import { FieldContainer } from './FieldContainer';

export function DragDropField({ field, error, onChange, disabled }: BaseFieldProps) {
  const [active, setActive] = useState(false);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setActive(false);
    if (disabled || field.disabled) return;
    const list = Array.from(e.dataTransfer.files ?? []);
    if (!list.length) return;
    onChange(field.multiple ? list : list[0]);
  };

  return (
    <FieldContainer
      name={field.name}
      label={field.label}
      description={field.description}
      error={error}
      required={Boolean(field.validation?.required)}
    >
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setActive(true);
        }}
        onDragLeave={() => setActive(false)}
        onDrop={onDrop}
        style={{
          padding: 'var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: `2px dashed ${active ? 'var(--primary)' : 'var(--border)'}`,
          background: active ? 'var(--accent)' : 'var(--muted)',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--muted-foreground)',
        }}
      >
        {field.placeholder ?? 'Drag & drop files here'}
        <input
          id={field.name}
          name={field.name}
          type="file"
          accept={field.accept}
          multiple={field.multiple}
          disabled={disabled || field.disabled}
          onChange={(e) => {
            const list = Array.from(e.target.files ?? []);
            if (list.length) onChange(field.multiple ? list : list[0]);
          }}
          style={{ display: 'block', margin: 'var(--space-3) auto 0', fontSize: 'var(--font-size-xs)' }}
        />
      </div>
    </FieldContainer>
  );
}
