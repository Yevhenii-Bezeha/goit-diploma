import { Checkbox, Field, Label } from '@headlessui/react';
import { ReactNode } from 'react';
import classnames from 'classnames';

type CheckboxLabelProps = {
  disabled?: boolean;
  label?: string | ReactNode;
  checked?: boolean;
  onChange?: (v: boolean) => void;
  className?: string;
  checkboxClassName?: string;
};

export const CheckboxLabel = ({
  disabled,
  label,
  checked,
  onChange,
  className,
  checkboxClassName,
}: CheckboxLabelProps) => {
  return (
    <Field className={classnames('flex items-center gap-4', className)}>
      <Checkbox
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={classnames(
          'group flex items-center justify-center size-6 rounded border-2 border-violet-500 bg-transparent data-[checked]:bg-violet-500',
          checkboxClassName
        )}
      >
        <svg className="stroke-white opacity-0 group-data-[checked]:opacity-100" viewBox="0 0 14 14" fill="none">
          <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Checkbox>
      <Label className="text-lg">{label}</Label>
    </Field>
  );
};
