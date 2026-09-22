'use client';

import type { ToolOutputField } from '@/types/tool-interface';
import { DynamicOutput } from './DynamicOutput';

interface OutputAreaProps {
  fields: ToolOutputField[];
  values: Record<string, unknown>;
}

export function OutputArea({ fields, values }: OutputAreaProps) {
  if (!fields.length) {
    return (
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
        No output configured.
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {fields.map((field) => (
        <div key={field.id}>
          {field.label && (
            <h3
              style={{
                margin: '0 0 var(--space-2)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--muted-foreground)',
              }}
            >
              {field.label}
            </h3>
          )}
          <DynamicOutput field={field} value={values[field.id]} />
        </div>
      ))}
    </div>
  );
}
