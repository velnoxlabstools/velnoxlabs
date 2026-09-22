'use client';

import type { BaseFieldProps } from './shared';

export function HiddenField({ field, value }: BaseFieldProps) {
  return <input type="hidden" name={field.name} value={String(value ?? '')} />;
}
