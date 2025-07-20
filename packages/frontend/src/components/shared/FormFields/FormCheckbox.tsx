import { useField } from 'formik';
import classnames from 'classnames';
import { useEffect } from 'react';

type FormCheckboxProps = {
  label: React.ReactNode;
  name: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  small?: boolean;
};

export const FormCheckbox = ({ label, required, className, disabled, small = false, ...props }: FormCheckboxProps) => {
  const [field, meta, helpers] = useField({ ...props, type: 'checkbox' });
  const hasError = meta.touched && meta.error;
  const id = `checkbox-${props.name}`;

  // Define the exact purple color to match the ContractQuestion component
  const purpleColor = "#8B5CF6"; // This is the hex value for violet-600
  
  // Reset error when checkbox is toggled
  useEffect(() => {
    if (field.checked && hasError) {
      helpers.setError(undefined);
    }
  }, [field.checked, hasError, helpers]);

  // Size classes
  const boxSize = small ? 'w-5 h-5' : 'w-7 h-7';
  const checkSize = small ? 'w-3 h-3' : 'w-4 h-4';
  const marginLeft = small ? 'ml-2' : 'ml-4';
  const marginTop = small ? 'mt-2' : 'mt-4';
  const paddingY = small ? 'py-2' : 'py-4';
  const paddingRight = small ? 'pr-2' : 'pr-4';

  return (
    <label 
      htmlFor={id}
      className={classnames(
        "flex items-start space-x-4 w-full rounded-lg transition-colors duration-200 border", 
        field.checked 
          ? "bg-[#8B5CF6] border-[#8B5CF6] text-white" 
          : "bg-transparent border-[#8B5CF6] text-gray-300",
        !disabled && 'cursor-pointer', 
        disabled && 'cursor-not-allowed opacity-70',
        className
      )}
      style={{
        // Ensure consistent color application
        borderColor: disabled ? "" : field.checked ? purpleColor : purpleColor,
        backgroundColor: field.checked ? purpleColor : ""
      }}
    >
      <div className={classnames("flex-shrink-0", marginLeft, marginTop)}>
        <div
          className={classnames(
            `${boxSize} rounded-full border-2 flex items-center justify-center`,
            field.checked ? 'border-white' : ''
          )}
          style={{
            borderColor: !field.checked ? purpleColor : ""
          }}
        >
          {field.checked && <div className={classnames(`${checkSize} rounded-full bg-white`)} />}
        </div>
        <input
          id={id}
          type="checkbox"
          disabled={disabled}
          {...field}
          {...props}
          className="sr-only"
          onChange={(e) => {
            field.onChange(e);
            if (e.target.checked && hasError) {
              helpers.setError(undefined);
            }
          }}
        />
      </div>
      <div className={classnames("flex-1", paddingY, paddingRight)}>
        <div className={field.checked ? "text-white" : "text-gray-300"}>
          {label} {required && <span className={field.checked ? "text-white" : "text-red-500"}>*</span>}
        </div>
        {hasError && <p className={field.checked ? "text-white text-sm mt-1" : "text-red-500 text-sm mt-1"}>{meta.error}</p>}
      </div>
    </label>
  );
};
