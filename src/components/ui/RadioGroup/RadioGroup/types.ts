import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';

export type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof RadioGroupPrimitive.Root>>;
};

export type RadioGroupItemProps = React.ComponentProps<typeof RadioGroupPrimitive.Item> & {
  ref?: React.Ref<React.ComponentRef<typeof RadioGroupPrimitive.Item>>;
};