import { useField } from 'formik';
import classnames from 'classnames';

type FormInputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
};

export const FormInput = ({ label, required, className, readOnly, ...props }: FormInputProps) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <div className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <input
        {...field}
        {...props}
        readOnly={readOnly}
        className={classnames(
          'w-full p-3 rounded-lg bg-[#E5E7EB] mt-1 text-black',
          hasError && 'border-2 border-red-500',
          className
        )}
      />
      {hasError && <p className="text-red-500 text-sm mt-1">{meta.error}</p>}
    </div>
  );
};
