import Image from 'next/image';

const boxes = Array.from(Array(156).keys());

export const Linear = () => {
    return (
        <>
            <div className="relative m-auto aspect-square h-4/5 transition-transform duration-500 group-hover:scale-110">
                <Image
                    className="pointer-events-none animate-ping blur-md saturate-150 [animation-duration:_3s] group-hover:[animation-duration:_1s]"
                    src="/linear.png"
                    alt="linear icon"
                    fill={true}
                />
                <Image
                    className=""
                    src="/linear.png"
                    alt="linear icon"
                    fill={true}
                />
            </div>
            <div className="absolute -z-10 grid h-full w-full grid-cols-[repeat(13,_minmax(0,_1fr))] grid-rows-[repeat(12,_minmax(0,_1fr))] transition-transform duration-500 group-hover:scale-105">
                {boxes.map((_, i) => (
                    <div
                        key={i}
                        className="border-b border-r border-white/25 opacity-25 transition-opacity duration-500 group-hover:opacity-70"
                    ></div>
                ))}
            </div>
        </>
    );
};
