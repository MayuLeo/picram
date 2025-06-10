import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export type IconRadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof RadioGroupPrimitive.Root>>;
};

export type IconRadioItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  icon: React.ReactNode;
  ref?: React.Ref<React.ComponentRef<typeof RadioGroupPrimitive.Item>>;
};