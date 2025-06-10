import * as React from 'react';

export type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'danger';
  ref?: React.Ref<HTMLButtonElement>;
};