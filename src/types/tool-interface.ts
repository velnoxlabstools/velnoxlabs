export type ToolInputType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'password'
  | 'file'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'slider'
  | 'date'
  | 'time'
  | 'color';

export type ToolOutputType =
  | 'text'
  | 'formatted'
  | 'json'
  | 'html'
  | 'image'
  | 'file'
  | 'stats'
  | 'table';

export interface SelectOption {
  label: string;
  value: string;
}

export interface ToolInputField {
  id: string;
  type: ToolInputType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  accept?: string;
  multiple?: boolean;
  rows?: number;
}

export interface ToolOutputField {
  id: string;
  type: ToolOutputType;
  label?: string;
}

export interface ToolActionDef {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  role?: 'submit' | 'reset' | 'copy' | 'download' | 'share' | 'custom';
}

export interface ToolInterfaceSchema {
  inputs: ToolInputField[];
  outputs: ToolOutputField[];
  actions?: ToolActionDef[];
  layout?: 'stack' | 'split' | 'tabs';
}

export type ToolFieldValues = Record<string, string | number | boolean | File | File[] | null>;

export interface ToolRunState {
  status: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  message?: string;
  progress?: number;
}
