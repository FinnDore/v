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
