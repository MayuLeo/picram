'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { clsx } from 'clsx';
import { RadioGroupProps, RadioGroupItemProps } from './types';

const RadioGroup = ({ className, ref, ...props }: RadioGroupProps) => (
  <RadioGroupPrimitive.Root
    ref={ref}
    className={clsx('grid gap-2', className)}
    {...props}
  />
);
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = ({ className, ref, ...props }: RadioGroupItemProps) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={clsx(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <div className="h-2.5 w-2.5 rounded-full bg-current" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
);
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };