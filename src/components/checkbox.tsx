import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        checked={checked}
        className={clsx(
            'border-input ring-offset-background focus-visible:ring-ring data-[state=checked]:border-primary peer h-4 w-4 shrink-0 rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator
            className={clsx('text-primary flex items-center justify-center')}
        >
            <CheckIcon className="h-4 w-4" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
