import { forwardRef, type HtmlHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Glitch = forwardRef<
    HTMLDivElement,
    HtmlHTMLAttributes<HTMLDivElement> & { text: string; italic?: boolean }
>(function Glitch({ text, className, italic = true, ...props }, ref) {
    return (
        <div {...props} className={clsx('relative', className)} ref={ref}>
            <span
                className="vnumber before:text-gray-A9 after:text-gray-A9 relative before:absolute before:left-4 before:top-2 before:w-[110%] before:content-[attr(data-text)] after:absolute after:-left-2 after:top-1 after:w-[110%] after:content-[attr(data-text)]"
                data-text={text}
            >
                {italic && <i>{text}</i>}
                {!italic && <b>{text}</b>}
            </span>
        </div>
    );
});
