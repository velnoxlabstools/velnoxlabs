'use client';

import type { ToolOutputField } from '@/types/tool-interface';

interface DynamicOutputProps {
  field: ToolOutputField;
  value: unknown;
}

export function DynamicOutput({ field, value }: DynamicOutputProps) {
  if (value == null || value === '') {
    return (
      <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--muted-foreground)' }}>
        No output yet.
      </p>
    );
  }

  switch (field.type) {
    case 'json':
      return (
        <pre
          style={{
            margin: 0,
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--background)',
            border: '1px solid var(--border)',
            fontSize: 'var(--font-size-xs)',
            overflow: 'auto',
            maxHeight: '20rem',
          }}
        >
          {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
        </pre>
      );

    case 'html':
      return (
        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border)',
            background: 'var(--background)',
          }}
          dangerouslySetInnerHTML={{ __html: String(value) }}
        />
      );

    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={String(value)}
          alt={field.label ?? 'Output'}
          style={{ maxWidth: '100%', borderRadius: 'var(--radius-md)' }}
        />
      );

    case 'stats':
      if (typeof value === 'object' && value !== null) {
        const entries = Object.entries(value as Record<string, string | number>);
        return (
          <dl
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(8rem, 1fr))',
              gap: 'var(--space-3)',
              margin: 0,
            }}
          >
            {entries.map(([k, v]) => (
              <div key={k}>
                <dt style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)', margin: 0 }}>
                  {k}
                </dt>
                <dd style={{ margin: 'var(--space-1) 0 0', fontWeight: 'var(--font-weight-semibold)' }}>
                  {String(v)}
                </dd>
              </div>
            ))}
          </dl>
        );
      }
      return <p style={{ margin: 0 }}>{String(value)}</p>;

    case 'table':
      if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
        const rows = value as Record<string, unknown>[];
        const cols = Object.keys(rows[0]);
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
              <thead>
                <tr>
                  {cols.map((c) => (
                    <th
                      key={c}
                      style={{
                        textAlign: 'left',
                        padding: 'var(--space-2)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {cols.map((c) => (
                      <td key={c} style={{ padding: 'var(--space-2)', borderBottom: '1px solid var(--border)' }}>
                        {String(row[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return <p style={{ margin: 0 }}>{String(value)}</p>;

    case 'formatted':
    case 'text':
    case 'file':
    default:
      return (
        <pre
          style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: field.type === 'formatted' ? 'var(--font-mono)' : 'inherit',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {String(value)}
        </pre>
      );
  }
}
