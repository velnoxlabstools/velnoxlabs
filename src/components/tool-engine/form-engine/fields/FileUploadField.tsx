'use client';

import type { BaseFieldProps } from './shared';
import { wrap, inputBaseStyle } from './shared';

export function FileUploadField({ field, error, onChange, onBlur, disabled }: BaseFieldProps) {
  return wrap(
    field,
    error,
    <input
      id={field.name}
      name={field.name}
      type="file"
      accept={field.accept}
      multiple={field.multiple}
      disabled={disabled || field.disabled}
      onChange={(e) => {
        const files = e.target.files;
        if (!files?.length) {
          onChange(null);
          return;
        }
        onChange(field.multiple ? Array.from(files) : files[0]);
      }}
      onBlur={onBlur}
      style={inputBaseStyle}
    />
  );
}
