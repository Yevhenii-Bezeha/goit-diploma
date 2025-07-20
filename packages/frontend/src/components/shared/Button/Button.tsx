import { ReactNode } from 'react';

type ButtonProps = {
  title?: string;
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit' | 'reset';
};

export const Button = ({ title, className, onClick, children, disabled, variant = 'primary', type = 'button' }: ButtonProps) => {
  const baseStyles = 'font-bold py-2 px-4 rounded transition-colors duration-200';
  const variantStyles = {
    primary:
      'bg-[#8B5CF6] text-white hover:bg-[#8B5CF6]/60 disabled:bg-[#8B5CF6]/30 disabled:text-white/50 disabled:cursor-not-allowed',
    secondary:
      'bg-transparent text-white border border-white hover:bg-white/10 disabled:opacity-50 disabled:border-white/50 disabled:text-white/50 disabled:cursor-not-allowed',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={!disabled ? onClick : undefined}
      className={`
      ${baseStyles}
      ${variantStyles[variant]}
      ${className}
    `}
    >
      {title}
      {children}
    </button>
  );
};
