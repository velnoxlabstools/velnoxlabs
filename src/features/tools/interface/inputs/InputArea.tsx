'use client';

import type { ToolInputField, ToolFieldValues } from '@/types/tool-interface';
import { DynamicInput } from './DynamicInput';

interface InputAreaProps {
  fields: ToolInputField[];
  values: ToolFieldValues;
  errors?: Record<string, string>;
  onChange: (id: string, value: ToolFieldValues[string]) => void;
}

export function InputArea({ fields, values, errors, onChange }: InputAreaProps) {
  if (!fields.length) {
    return (
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
        No inputs configured for this tool.
      </p>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
      }}
    >
      {fields.map((field) => (
        <DynamicInput
          key={field.id}
          field={field}
          value={values[field.id]}
          error={errors?.[field.id]}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
