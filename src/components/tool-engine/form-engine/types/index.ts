export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'date'
  | 'time'
  | 'color'
  | 'file'
  | 'dragdrop'
  | 'hidden';

export type FormStatus =
  | 'initial'
  | 'loading'
  | 'valid'
  | 'invalid'
  | 'submitting'
  | 'success'
  | 'error'
  | 'disabled';

export type FormValue = string | number | boolean | File | File[] | string[] | null | undefined;

export type FormValues = Record<string, FormValue>;

export interface FieldOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FieldValidationRule {
  required?: boolean | string;
  minLength?: number | { value: number; message?: string };
  maxLength?: number | { value: number; message?: string };
  min?: number | { value: number; message?: string };
  max?: number | { value: number; message?: string };
  pattern?: RegExp | { value: RegExp; message?: string };
  email?: boolean | string;
  url?: boolean | string;
  fileType?: string[] | { value: string[]; message?: string };
  fileSize?: number | { value: number; message?: string };
  custom?: (value: FormValue, values: FormValues) => string | undefined;
  async?: (value: FormValue, values: FormValues) => Promise<string | undefined>;
}

export interface FormFieldConfig {
  name: string;
  type: FormFieldType;
  label?: string;
  placeholder?: string;
  description?: string;
  defaultValue?: FormValue;
  options?: FieldOption[];
  validation?: FieldValidationRule;
  disabled?: boolean;
  hidden?: boolean;
  autoFocus?: boolean;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  colSpan?: 1 | 2;
}

export interface FormButtonConfig {
  id: string;
  label: string;
  type?: 'submit' | 'button' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
}

export interface FormConfig {
  id?: string;
  fields: FormFieldConfig[];
  actions?: FormButtonConfig[];
  layout?: 'stack' | 'grid';
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FieldErrorMap {
  [fieldName: string]: string | undefined;
}
