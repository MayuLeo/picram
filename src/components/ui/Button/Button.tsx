'use client';

import { clsx } from 'clsx';
import { ButtonProps } from './types';

const Button = ({ className, variant = 'primary', ref, children, ...props }: ButtonProps) => {
  const variantStyles = {
    primary: 'bg-[#1C6E8C] text-white hover:bg-[#1C6E8C]/90',
    danger: 'bg-[#E52D2D] text-[#FCFCFC] hover:bg-[#E52D2D]/90'
  };

  return (
    <button
      ref={ref}
      className={clsx(
        'inline-flex items-center justify-center gap-2.5 px-6 py-1 rounded-lg font-bold text-xs leading-[1.36] text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
Button.displayName = 'Button';

export { Button };
