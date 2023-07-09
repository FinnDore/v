import { PropsWithChildren, forwardRef } from 'react';
import Image from 'next/image';

import { Particles } from './particles';

const boxes = Array.from(Array(15).keys());

export const Linear = () => {
    return (
        <>
            <div className="pointer-events-none relative m-auto aspect-square h-4/5 transition-transform duration-500 group-hover:scale-110">
                <Image
                    className="pointer-events-none animate-ping blur-md saturate-150 [animation-duration:_3s] group-hover:[animation-duration:_1s]"
                    src="/linear/linear.png"
                    alt="linear icon"
                    fill={true}
                />
                <Image
                    className="pointer-events-none"
                    src="/linear/linear.png"
                    alt="linear icon"
                    fill={true}
                />
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

const WithBlur = forwardRef<HTMLDivElement, PropsWithChildren>(
    function WithBlur({ children, ...props }, ref) {
        return (
            <div className="relative" ref={ref} {...props}>
                {children}
                <div className="absolute top-0 w-0 scale-110 blur-md">
                    {children}
                </div>
            </div>
        );
    }
);

const Todo = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-label="Todo"
    >
        <rect
            x="1"
            y="1"
            width="12"
            height="12"
            rx="6"
            stroke="#e2e2e2"
            stroke-width="2"
            fill="none"
        ></rect>
        <path
            fill="#e2e2e2"
            stroke="none"
            d="M 3.5,3.5 L3.5,0 A3.5,3.5 0 0,1 3.5, 0 z"
            transform="translate(3.5,3.5)"
        ></path>
    </svg>
);

const BackLog = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-label="Backlog"
        fill="#bec2c8"
    >
        <path
            d="M13.9408 7.91426L11.9576 7.65557C11.9855 7.4419 12 7.22314 12 7C12 6.77686 11.9855 6.5581 11.9576 6.34443L13.9408 6.08573C13.9799 6.38496 14 6.69013 14 7C14 7.30987 13.9799 7.61504 13.9408 7.91426ZM13.4688 4.32049C13.2328 3.7514 12.9239 3.22019 12.5538 2.73851L10.968 3.95716C11.2328 4.30185 11.4533 4.68119 11.6214 5.08659L13.4688 4.32049ZM11.2615 1.4462L10.0428 3.03204C9.69815 2.76716 9.31881 2.54673 8.91341 2.37862L9.67951 0.531163C10.2486 0.767153 10.7798 1.07605 11.2615 1.4462ZM7.91426 0.0591659L7.65557 2.04237C7.4419 2.01449 7.22314 2 7 2C6.77686 2 6.5581 2.01449 6.34443 2.04237L6.08574 0.059166C6.38496 0.0201343 6.69013 0 7 0C7.30987 0 7.61504 0.0201343 7.91426 0.0591659ZM4.32049 0.531164L5.08659 2.37862C4.68119 2.54673 4.30185 2.76716 3.95716 3.03204L2.73851 1.4462C3.22019 1.07605 3.7514 0.767153 4.32049 0.531164ZM1.4462 2.73851L3.03204 3.95716C2.76716 4.30185 2.54673 4.68119 2.37862 5.08659L0.531164 4.32049C0.767153 3.7514 1.07605 3.22019 1.4462 2.73851ZM0.0591659 6.08574C0.0201343 6.38496 0 6.69013 0 7C0 7.30987 0.0201343 7.61504 0.059166 7.91426L2.04237 7.65557C2.01449 7.4419 2 7.22314 2 7C2 6.77686 2.01449 6.5581 2.04237 6.34443L0.0591659 6.08574ZM0.531164 9.67951L2.37862 8.91341C2.54673 9.31881 2.76716 9.69815 3.03204 10.0428L1.4462 11.2615C1.07605 10.7798 0.767153 10.2486 0.531164 9.67951ZM2.73851 12.5538L3.95716 10.968C4.30185 11.2328 4.68119 11.4533 5.08659 11.6214L4.32049 13.4688C3.7514 13.2328 3.22019 12.9239 2.73851 12.5538ZM6.08574 13.9408L6.34443 11.9576C6.5581 11.9855 6.77686 12 7 12C7.22314 12 7.4419 11.9855 7.65557 11.9576L7.91427 13.9408C7.61504 13.9799 7.30987 14 7 14C6.69013 14 6.38496 13.9799 6.08574 13.9408ZM9.67951 13.4688L8.91341 11.6214C9.31881 11.4533 9.69815 11.2328 10.0428 10.968L11.2615 12.5538C10.7798 12.9239 10.2486 13.2328 9.67951 13.4688ZM12.5538 11.2615L10.968 10.0428C11.2328 9.69815 11.4533 9.31881 11.6214 8.91341L13.4688 9.67951C13.2328 10.2486 12.924 10.7798 12.5538 11.2615Z"
            stroke="none"
        ></path>
    </svg>
);

const Done = () => (
    <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        aria-label="Done"
        fill="#5e6ad2"
    >
        <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM11.101 5.10104C11.433 4.76909 11.433 4.23091 11.101 3.89896C10.7691 3.56701 10.2309 3.56701 9.89896 3.89896L5.5 8.29792L4.10104 6.89896C3.7691 6.56701 3.2309 6.56701 2.89896 6.89896C2.56701 7.2309 2.56701 7.7691 2.89896 8.10104L4.89896 10.101C5.2309 10.433 5.7691 10.433 6.10104 10.101L11.101 5.10104Z"
        ></path>
    </svg>
);
