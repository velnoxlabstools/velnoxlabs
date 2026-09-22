'use client';

import type { ToolInputField, ToolFieldValues } from '@/types/tool-interface';

interface DynamicInputProps {
  field: ToolInputField;
  value: ToolFieldValues[string];
  onChange: (id: string, value: ToolFieldValues[string]) => void;
  error?: string;
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  borderRadius: 'var(--radius-md)',
  border: '1px solid var(--border)',
  background: 'var(--background)',
  color: 'var(--foreground)',
  fontSize: 'var(--font-size-sm)',
};

export function DynamicInput({ field, value, onChange, error }: DynamicInputProps) {
  const id = `tool-input-${field.id}`;
  const describedBy = field.description ? `${id}-desc` : undefined;

  const label = (
    <label
      htmlFor={id}
      style={{
        display: 'block',
        marginBottom: 'var(--space-1)',
        fontSize: 'var(--font-size-sm)',
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      {field.label}
      {field.required && (
        <span aria-hidden="true" style={{ color: 'var(--destructive)' }}>
          {' '}
          *
        </span>
      )}
    </label>
  );

  const help = field.description ? (
    <p
      id={`${id}-desc`}
      style={{
        margin: 'var(--space-1) 0 0',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--muted-foreground)',
      }}
    >
      {field.description}
    </p>
  ) : null;

  const err = error ? (
    <p role="alert" style={{ margin: 'var(--space-1) 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--destructive)' }}>
      {error}
    </p>
  ) : null;

  switch (field.type) {
    case 'textarea':
      return (
        <div>
          {label}
          <textarea
            id={id}
            name={field.id}
            rows={field.rows ?? 5}
            placeholder={field.placeholder}
            required={field.required}
            aria-describedby={describedBy}
            value={String(value ?? '')}
            onChange={(e) => onChange(field.id, e.target.value)}
            style={{ ...fieldStyle, resize: 'vertical', minHeight: '6rem' }}
          />
          {help}
          {err}
        </div>
      );

    case 'select':
      return (
        <div>
          {label}
          <select
            id={id}
            name={field.id}
            required={field.required}
            aria-describedby={describedBy}
            value={String(value ?? '')}
            onChange={(e) => onChange(field.id, e.target.value)}
            style={fieldStyle}
          >
            <option value="">{field.placeholder ?? 'Select…'}</option>
            {(field.options ?? []).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {help}
          {err}
        </div>
      );

    case 'checkbox':
    case 'switch':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <input
            id={id}
            name={field.id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(field.id, e.target.checked)}
            style={{ width: '1rem', height: '1rem' }}
          />
          <label htmlFor={id} style={{ fontSize: 'var(--font-size-sm)' }}>
            {field.label}
          </label>
          {err}
        </div>
      );

    case 'radio':
      return (
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--space-2)' }}>
            {field.label}
          </legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {(field.options ?? []).map((o) => (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                <input
                  type="radio"
                  name={field.id}
                  value={o.value}
                  checked={value === o.value}
                  onChange={() => onChange(field.id, o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
          {err}
        </fieldset>
      );

    case 'slider':
      return (
        <div>
          {label}
          <input
            id={id}
            name={field.id}
            type="range"
            min={field.min ?? 0}
            max={field.max ?? 100}
            step={field.step ?? 1}
            value={Number(value ?? field.defaultValue ?? 0)}
            onChange={(e) => onChange(field.id, Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--muted-foreground)' }}>
            {String(value ?? field.defaultValue ?? 0)}
          </span>
          {help}
          {err}
        </div>
      );

    case 'file':
      return (
        <div>
          {label}
          <input
            id={id}
            name={field.id}
            type="file"
            accept={field.accept}
            multiple={field.multiple}
            aria-describedby={describedBy}
            onChange={(e) => {
              const files = e.target.files;
              if (!files?.length) {
                onChange(field.id, null);
                return;
              }
              onChange(field.id, field.multiple ? Array.from(files) : files[0]);
            }}
            style={fieldStyle}
          />
          {help}
          {err}
        </div>
      );

    case 'color':
      return (
        <div>
          {label}
          <input
            id={id}
            name={field.id}
            type="color"
            value={String(value ?? '#000000')}
            onChange={(e) => onChange(field.id, e.target.value)}
            style={{ width: '3rem', height: '2.5rem', border: 'none', background: 'transparent' }}
          />
          {help}
          {err}
        </div>
      );

    default:
      return (
        <div>
          {label}
          <input
            id={id}
            name={field.id}
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'password' ? 'password' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text'}
            placeholder={field.placeholder}
            required={field.required}
            min={field.min}
            max={field.max}
            step={field.step}
            aria-describedby={describedBy}
            value={value == null ? '' : String(value)}
            onChange={(e) =>
              onChange(
                field.id,
                field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value
              )
            }
            style={fieldStyle}
          />
          {help}
          {err}
        </div>
      );
  }
}
