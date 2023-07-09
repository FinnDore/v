import { HTMLProps, PropsWithChildren, forwardRef } from 'react';
import Image from 'next/image';

import { Particles } from './particles';

const boxes = Array.from(Array(15).keys());

export const Linear = () => {
    return (
        <>
            <div className="pointer-events-none relative m-auto aspect-square h-4/5 transition-transform duration-500 group-hover:scale-110">
                <Image
                    className="pointer-events-none animate-ping blur-md saturate-150 [animation-duration:_3s] group-hover:[animation-duration:_2s]"
                    src="/linear/linear.png"
                    alt="linear icon"
                    fill={true}
                />
                <WithBlur className="pointer-events-none h-full w-full">
                    <Image
                        src="/linear/linear.png"
                        alt="linear icon"
                        fill={true}
                    />
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
            <div className="absolute top-0 h-full w-full scale-110 animate-pulse blur-md">
                {children}
            </div>
            {children}
        </div>
    );
});
