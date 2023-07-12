import { forwardRef, type HTMLProps, type PropsWithChildren } from 'react';

import { Particles } from './particles';

export const Linear = () => {
    return (
        <>
            <div className="pointer-events-none relative m-auto aspect-square h-4/5 transition-transform duration-500 group-hover:scale-110">
                <picture className="pointer-events-none absolute -z-10 animate-ping blur-md saturate-150 [animation-duration:_3s] group-hover:[animation-duration:_2s]">
                    <img src="/linear/linear.webp" alt="linear icon" />
                </picture>
                <WithBlur className="pointer-events-none h-full w-full">
                    <picture className="h-full w-full">
                        <img src="/linear/linear.webp" alt="linear icon" />
                    </picture>
                </WithBlur>
            </div>
            <Particles
                images={[
                    'linear/in-progress.svg',
                    'linear/backlog.svg',
                    'linear/todo.svg',
                    'linear/done.svg',
                ]}
                quantity={50}
                className="absolute -z-10 h-full w-full transition-transform duration-500 group-hover:scale-110"
            />
        </>
    );
};

const WithBlur = forwardRef<
    HTMLDivElement,
    HTMLProps<HTMLDivElement> & PropsWithChildren
>(function WithBlur({ children, ...props }, ref) {
    return (
        <div className="relative" ref={ref} {...props}>
            <div className="absolute top-0 -z-10 h-full w-full scale-110 animate-pulse blur-md [animation-duration:_1.5s] group-hover:[animation-duration:_1s]">
                {children}
            </div>
            {children}
        </div>
    );
});
