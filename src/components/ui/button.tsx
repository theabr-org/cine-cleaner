import { cva, VariantProps } from 'class-variance-authority';
import { splitProps, ValidComponent } from 'solid-js';
import { PolymorphicProps } from './types';
import { Dynamic } from 'solid-js/web';
import { cn } from './cn';

export const buttonVariants = cva(
  'cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium transition-[color,background-color,box-shadow] focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-500/90',
        secondary: 'bg-green-500 text-white hover:bg-green-500/80',
        destructive: 'bg-red-500 text-white hover:bg-red-500/90',
        link: 'text-blue-500 underline-offset-4 hover:underline',
        ghost: 'bg-transparent hover:bg-gray-100/10 dark:hover:bg-gray-800/10',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

type buttonProps<T extends ValidComponent = 'button'> = VariantProps<
  typeof buttonVariants
> & {
  as?: T;
  class?: string;
};

export const Button = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, buttonProps<T>>
) => {
  const [local, rest] = splitProps(props, ['class', 'variant', 'size', 'as']);

  const Component = local.as || 'button';

  return (
    <Dynamic
      component={Component}
      class={cn(
        buttonVariants({
          size: local.size,
          variant: local.variant,
        }),
        local.class
      )}
      {...rest}
    />
  );
};
