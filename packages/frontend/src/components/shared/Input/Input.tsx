import classnames from 'classnames';
import { useUncontrolled } from '@mantine/hooks';
import classes from './Input.module.css';

type InputProps = {
  id: string;
  placeholder?: string;
  value?: string;
  className?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  type?: string;
};

export const Input = ({ type, className, placeholder, onChange, defaultValue, value, id }: InputProps) => {
  const [inputValue, setValue] = useUncontrolled({ value, onChange, defaultValue });

  return (
    <input
      id={id}
      type={type}
      className={classnames(classes.input, className)}
      placeholder={placeholder}
      value={inputValue}
      onInput={(e) => setValue(e.currentTarget.value)}
    />
  );
};
