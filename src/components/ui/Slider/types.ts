import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

export type SliderProps = React.ComponentProps<typeof SliderPrimitive.Root> & {
  ref?: React.Ref<React.ComponentRef<typeof SliderPrimitive.Root>>;
};