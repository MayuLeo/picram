'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import { IconRadioGroupProps, IconRadioItemProps } from './types';

const IconRadioGroup = ({ className, ref, ...props }: IconRadioGroupProps) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={clsx('flex flex-row justify-center items-center gap-9 px-12 py-0', className)}
    {...props}
  />
);
IconRadioGroup.displayName = 'IconRadioGroup';

const IconRadioItem = ({ className, icon, ref, ...props }: IconRadioItemProps) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={clsx(
      'flex items-center justify-center w-9 h-9 rounded-none border-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-[#D0CCD0] data-[state=checked]:text-[#605856]',
      className
    )}
    {...props}
  >
    <div className="w-full h-full flex items-center justify-center">
      {icon}
    </div>
  </RadioGroupPrimitive.Item>
);
IconRadioItem.displayName = 'IconRadioItem';

export { IconRadioGroup, IconRadioItem };
