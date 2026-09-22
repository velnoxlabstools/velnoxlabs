'use client';

import type { FormFieldConfig, FormValue } from '../types';
import { inputBaseStyle } from '../utils';
import { FieldContainer } from './FieldContainer';

export interface BaseFieldProps {
  field: FormFieldConfig;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function wrap(
  field: FormFieldConfig,
  error: string | undefined,
  control: React.ReactNode
) {
  return (
    <FieldContainer
      name={field.name}
      label={field.label}
      description={field.description}
      error={error}
      required={Boolean(field.validation?.required)}
    >
      {control}
    </FieldContainer>
  );
}

export { inputBaseStyle };
