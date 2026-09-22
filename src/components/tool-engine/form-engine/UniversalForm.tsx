'use client';

import type { FormConfig, FormValues } from './types';
import { useFormEngine } from './hooks';
import { DynamicFieldRenderer } from './fields';
import { FormActions } from './FormActions';

interface UniversalFormProps {
  config: FormConfig;
  onSubmit?: (values: FormValues) => void | Promise<void>;
  className?: string;
}

const DEFAULT_ACTIONS = [
  { id: 'submit', label: 'Submit', type: 'submit' as const, variant: 'primary' as const },
  { id: 'reset', label: 'Reset', type: 'reset' as const, variant: 'ghost' as const },
];

/**
 * Universal Form Engine — tools only pass FormConfig; UI + validation are automatic.
 */
export function UniversalForm({ config, onSubmit }: UniversalFormProps) {
  const form = useFormEngine(config);
  const actions = config.actions?.length ? config.actions : DEFAULT_ACTIONS;
  const disabled = form.status === 'disabled' || form.status === 'submitting';

  return (
    <form
      id={config.id}
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        await form.submit(onSubmit);
      }}
      onReset={(e) => {
        e.preventDefault();
        form.reset();
      }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
    >
      <div
        style={{
          display: config.layout === 'grid' ? 'grid' : 'flex',
          flexDirection: config.layout === 'grid' ? undefined : 'column',
          gridTemplateColumns:
            config.layout === 'grid' ? 'repeat(auto-fit, minmax(14rem, 1fr))' : undefined,
          gap: 'var(--space-4)',
        }}
      >
        {config.fields.map((field) => (
          <div
            key={field.name}
            style={{
              gridColumn: field.colSpan === 2 ? '1 / -1' : undefined,
              display: field.hidden ? 'none' : undefined,
            }}
          >
            <DynamicFieldRenderer
              field={field}
              value={form.values[field.name]}
              error={form.touched[field.name] ? form.errors[field.name] : undefined}
              disabled={disabled}
              onChange={(v) => form.setValue(field.name, v)}
              onBlur={() => form.setTouchedField(field.name)}
            />
          </div>
        ))}
      </div>

      {form.status === 'error' && (
        <p role="alert" style={{ margin: 0, color: 'var(--destructive)', fontSize: 'var(--font-size-sm)' }}>
          Something went wrong. Please try again.
        </p>
      )}
      {form.status === 'success' && (
        <p role="status" style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--foreground)' }}>
          Submitted successfully.
        </p>
      )}

      <FormActions
        actions={actions}
        status={form.status}
        onAction={(id) => {
          if (id === 'reset') form.reset();
        }}
      />
    </form>
  );
}
