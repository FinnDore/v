import { useEffect, useRef, useState } from 'react';
import { Link2Icon } from '@radix-ui/react-icons';
import { animated, config, useSpring } from '@react-spring/web';
import { usePokerId } from 'hooks/poker-hooks';

import { Pfp } from '@/components/pfp';

const users = ['Finn', 'Jake', 'Near', 'Jim', 'Anna'];
const Start = () => {
    const pokerId = usePokerId();
    const url = useRef<string | null>(null);

    const [expand, setExpand] = useState(false);
    const [hovering, setHovering] = useState(false);

    useEffect(() => {
        if (typeof window !== undefined) {
            url.current = `/api/qrcode/${encodeURIComponent(
                window.location.origin + '/join/' + (pokerId ?? '')
            )}`;
        }

        return () => {
            url.current = null;
        };
    }, [pokerId]);

    const widthSpring = useSpring({
        width: expand ? 256 : 0,
        opacity: expand ? 1 : 0,
        config: expand ? config.gentle : config.default,
    });

    const scaleSpring = useSpring({
        scale: hovering ? 1.05 : 1,
        config: config.gentle,
    });

    return (
        <div className="mx-auto flex h-full w-max max-w-full flex-col place-items-center px-12 lg:max-w-screen-lg">
            <div className="m-auto flex" onClick={() => setExpand(x => !x)}>
                <div>
                    {url.current && (
                        <animated.button
                            style={scaleSpring}
                            onMouseEnter={() => setHovering(true)}
                            onMouseLeave={() => setHovering(false)}
                        >
                            <picture>
                                <img
                                    className="aspect-square w-64 rounded-md"
                                    src={url.current}
                                    alt={`QR code to join vote ${
                                        pokerId ?? ''
                                    }`}
                                />
                            </picture>
                            <p className="mt-2 w-full text-center text-sm underline">
                                {pokerId}
                                <Link2Icon className="ml-1 inline-block h-4 w-4" />
                            </p>
                        </animated.button>
                    )}
                </div>
                <animated.div
                    style={widthSpring}
                    className="m-h-64 flex flex-col overflow-clip ps-8"
                >
                    <div className="mb-4 text-2xl font-bold">Users</div>
                    <div className="flex flex-col gap-3">
                        {users.map((name, i) => (
                            <div className="flex" key={i}>
                                <Pfp name={name} className="mr-4 w-6" />
                                <span>FInn</span>
                            </div>
                        ))}
                    </div>
                </animated.div>
            </div>
        </div>
    );
};

export default Start;
