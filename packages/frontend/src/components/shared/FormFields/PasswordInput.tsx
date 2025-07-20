import { useState } from 'react';
import { useField } from 'formik';
import classnames from 'classnames';

type BasePasswordInputProps = {
  placeholder?: string;
  className?: string;
};

type FormikPasswordInputProps = BasePasswordInputProps & {
  label: string;
  name: string;
  required?: boolean;
  formik: true;
};

type SimplePasswordInputProps = BasePasswordInputProps & {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formik?: false;
};

type PasswordInputProps = FormikPasswordInputProps | SimplePasswordInputProps;

const EyeIcon = ({ visible }: { visible: boolean }) =>
  visible ? (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
      <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
      <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
    </svg>
  ) : (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path
        fillRule="evenodd"
        d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
        clipRule="evenodd"
      />
    </svg>
  );

const FormikPasswordInput = ({ name, label, required, placeholder, className }: FormikPasswordInputProps) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={classnames('relative', className)}>
      <label className="block text-sm font-medium text-gray-300 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          {...field}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          className={classnames(
            'w-full p-3 rounded border bg-white text-black pr-10',
            meta.touched && meta.error ? 'border-red-500' : 'border-gray-300'
          )}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <EyeIcon visible={showPassword} />
        </button>
        {meta.touched && meta.error && <div className="text-red-500 text-sm mt-1">{meta.error}</div>}
      </div>
    </div>
  );
};

const SimplePasswordInputComponent = ({ value, onChange, placeholder, className }: SimplePasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={classnames('relative', className)}>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-3 rounded border bg-white text-black pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <EyeIcon visible={showPassword} />
        </button>
      </div>
    </div>
  );
};

export const PasswordInput = (props: PasswordInputProps) => {
  if (props.formik) {
    return <FormikPasswordInput {...props} />;
  }
  return <SimplePasswordInputComponent {...props} />;
};
