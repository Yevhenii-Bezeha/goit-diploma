import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import classnames from 'classnames';

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export const Select = ({ options, value, onChange, placeholder, className }: SelectProps) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <Listbox.Button
          className={classnames(
            'relative w-full cursor-pointer rounded-lg bg-[#1F1730] py-3 pl-6 pr-10 text-left text-white',
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
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#1F1730] py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {options.map((option) => (
              <Listbox.Option
                key={option.value}
                className={({ active }) =>
                  classnames(
                    'relative cursor-pointer select-none py-2 pl-10 pr-4',
                    active ? 'bg-violet-600 text-white' : 'text-white'
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
  );
};
