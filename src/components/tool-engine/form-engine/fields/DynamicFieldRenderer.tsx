'use client';

import type { FormFieldConfig, FormValue } from '../types';
import { InputField } from './InputField';
import { TextareaField } from './TextareaField';
import { NumberField } from './NumberField';
import { EmailField } from './EmailField';
import { PasswordField } from './PasswordField';
import { SelectField } from './SelectField';
import { MultiSelectField } from './MultiSelectField';
import { CheckboxField } from './CheckboxField';
import { RadioField } from './RadioField';
import { SwitchField } from './SwitchField';
import { SliderField } from './SliderField';
import { DateField } from './DateField';
import { TimeField } from './TimeField';
import { ColorField } from './ColorField';
import { FileUploadField } from './FileUploadField';
import { DragDropField } from './DragDropField';
import { HiddenField } from './HiddenField';

interface DynamicFieldRendererProps {
  field: FormFieldConfig;
  value: FormValue;
  error?: string;
  onChange: (value: FormValue) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

export function DynamicFieldRenderer(props: DynamicFieldRendererProps) {
  if (props.field.hidden) {
    return <HiddenField {...props} />;
  }

  switch (props.field.type) {
    case 'textarea':
      return <TextareaField {...props} />;
    case 'number':
      return <NumberField {...props} />;
    case 'email':
      return <EmailField {...props} />;
    case 'password':
      return <PasswordField {...props} />;
    case 'select':
      return <SelectField {...props} />;
    case 'multiselect':
      return <MultiSelectField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    case 'radio':
      return <RadioField {...props} />;
    case 'switch':
      return <SwitchField {...props} />;
    case 'slider':
      return <SliderField {...props} />;
    case 'date':
      return <DateField {...props} />;
    case 'time':
      return <TimeField {...props} />;
    case 'color':
      return <ColorField {...props} />;
    case 'file':
      return <FileUploadField {...props} />;
    case 'dragdrop':
      return <DragDropField {...props} />;
    case 'hidden':
      return <HiddenField {...props} />;
    case 'text':
    default:
      return <InputField {...props} />;
  }
}
