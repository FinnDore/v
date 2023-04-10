import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={clsx(
                    'flex h-20 w-full rounded-md border border-black/70 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/70 dark:text-slate-50 dark:focus:ring-white dark:focus:ring-offset-slate-900',
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
