import { Fragment } from 'react';
import { useField } from 'formik';
import { Listbox, Transition } from '@headlessui/react';
import classnames from 'classnames';

type Option = {
  value: string;
  label: string;
};

type FormSelectProps = {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export const FormSelect = ({ label, options, required, placeholder, className, ...props }: FormSelectProps) => {
  const [field, meta, helpers] = useField(props);
  const hasError = meta.touched && meta.error;

  const isValidValue = options.some((option) => option.value === field.value);
  const safeValue = isValidValue ? field.value : '';

  const selectedOption = options.find((option) => option.value === safeValue);

  return (
    <div className="block">
      <span className="text-sm font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <Listbox value={safeValue} onChange={helpers.setValue}>
        <div className="relative mt-1">
          <Listbox.Button
            className={classnames(
              'relative w-full cursor-pointer rounded-lg bg-[#E5E7EB] py-3 pl-6 pr-10 text-left text-black',
              hasError && 'border-2 border-red-500',
              className
            )}
          >
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder || 'Select an option'}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
              </svg>
            </span>
          </Listbox.Button>
          {hasError && <p className="text-red-500 text-sm mt-1">{meta.error}</p>}
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    classnames(
                      'relative cursor-pointer select-none py-2 pl-10 pr-4',
                      active ? 'bg-violet-600 text-white' : 'text-gray-900'
                    )
                  }
                  value={option.value}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={classnames('block truncate', selected ? 'font-medium' : 'font-normal')}>
                        {option.label}
                      </span>
                      {selected && (
                        <span
                          className={classnames(
                            'absolute inset-y-0 left-0 flex items-center pl-3',
                            active ? 'text-white' : 'text-violet-600'
                          )}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M8 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z" fill="currentColor" />
                          </svg>
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
