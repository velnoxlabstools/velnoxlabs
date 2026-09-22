'use client';

import { useCallback, useMemo, useState } from 'react';
import type {
  FieldErrorMap,
  FormConfig,
  FormStatus,
  FormValues,
} from '../types';
import { validateField, validateFieldAsync } from '../validation';
import { getDefaultValues, scrollToFirstError } from '../utils';

export function useFormEngine(config: FormConfig) {
  const defaults = useMemo(() => getDefaultValues(config.fields), [config.fields]);
  const [values, setValues] = useState<FormValues>(defaults);
  const [errors, setErrors] = useState<FieldErrorMap>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<FormStatus>('initial');

  const setValue = useCallback(
    (name: string, value: FormValues[string]) => {
      setValues((prev) => {
        const next = { ...prev, [name]: value };
        if (config.validateOnChange) {
          const field = config.fields.find((f) => f.name === name);
          const err = validateField(value, field?.validation, next);
          setErrors((e) => ({ ...e, [name]: err }));
          setStatus(err ? 'invalid' : 'valid');
        }
        return next;
      });
    },
    [config.fields, config.validateOnChange]
  );

  const setTouchedField = useCallback(
    (name: string) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      if (config.validateOnBlur !== false) {
        setValues((current) => {
          const field = config.fields.find((f) => f.name === name);
          const err = validateField(current[name], field?.validation, current);
          setErrors((e) => ({ ...e, [name]: err }));
          return current;
        });
      }
    },
    [config.fields, config.validateOnBlur]
  );

  const validateAll = useCallback(async (): Promise<boolean> => {
    const nextErrors: FieldErrorMap = {};
    for (const field of config.fields) {
      if (field.hidden) continue;
      const err = await validateFieldAsync(values[field.name], field.validation, values);
      if (err) nextErrors[field.name] = err;
    }
    setErrors(nextErrors);
    const ok = Object.keys(nextErrors).length === 0;
    setStatus(ok ? 'valid' : 'invalid');
    if (!ok) scrollToFirstError(nextErrors);
    return ok;
  }, [config.fields, values]);

  const reset = useCallback(() => {
    setValues(getDefaultValues(config.fields));
    setErrors({});
    setTouched({});
    setStatus('initial');
  }, [config.fields]);

  const submit = useCallback(
    async (onSubmit?: (values: FormValues) => void | Promise<void>) => {
      setStatus('submitting');
      const ok = await validateAll();
      if (!ok) {
        setStatus('invalid');
        return false;
      }
      try {
        await onSubmit?.(values);
        setStatus('success');
        return true;
      } catch {
        setStatus('error');
        return false;
      }
    },
    [validateAll, values]
  );

  return {
    values,
    errors,
    touched,
    status,
    setValue,
    setTouchedField,
    validateAll,
    reset,
    submit,
    setStatus,
    setValues,
  };
}
