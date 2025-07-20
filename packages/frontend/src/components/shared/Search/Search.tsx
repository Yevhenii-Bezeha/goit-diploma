import { useUncontrolled } from '@mantine/hooks';
import Close from '../../../assets/icons/close.svg';
import SearchIcon from '../../../assets/icons/search.svg';

type SearchProps = {
  id: string;
  placeholder?: string;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  type?: string;
  icon?: 'search' | string;
};

export const Search = ({
  placeholder,
  value,
  className,
  onChange,
  defaultValue,
  type = 'text',
  id,
  icon,
}: SearchProps) => {
  const [inputValue, setValue] = useUncontrolled({ value, onChange, defaultValue });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const handleClear = () => {
    setValue('');
  };

  return (
    <div className={'relative flex h-10 sm:h-12 w-full bg-[#251E2F] rounded-[6px]'}>
      {icon === 'search' && (
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[#808191]" />
      )}
      <input
        id={id}
        placeholder={placeholder || ''}
        className={`flex-1 text-sm sm:text-md pl-3 sm:pl-4 p-2 h-full w-full rounded-lg outline-none text-white bg-transparent focus:bg-[#120E16] border border-solid border-[#554a92] ${className}`}
        type={type}
        value={inputValue}
        onChange={handleInputChange}
      />
      {inputValue && (
        <button type="button" onClick={handleClear} className="p-0">
          <Close className="absolute right-[10px] top-[12px] fill-[#9A8BAA] hover:fill-[#9956e8] w-[14px] h-[14px]" />
        </button>
      )}
    </div>
  );
};
