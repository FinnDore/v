import { useEffect, useMemo } from 'react';

import { Pfp } from '../pfp';
import { Particles } from './particles';

export const ShowcaseAnonUsers = () => {
    const pfpHashes = useMemo(
        () => new Array(3).fill(1).map(() => Math.random() * 1000),
        []
    );

    const bgHashes = useMemo(
        () => new Array(10).fill(1).map(() => Math.random() * 1000),
        []
    );

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const pfps = entry.target.querySelectorAll(
                    '.pfp-showcase-anon-user'
                );
                pfps.forEach(e => e.classList.add('animate-drop-in'));
                observer.disconnect();
            });
        });
        const container = document.querySelector('.showcase-anon-users');
        if (container) observer.observe(container);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className="showcase-anon-users grid h-full w-full place-content-center duration-500 group-hover:scale-110">
            <div className="flex">
                {pfpHashes.map((hash, i) => (
                    <Pfp
                        key={hash}
                        className="pfp-showcase-anon-user h-24 w-24 opacity-0"
                        style={{
                            zIndex: -i + 10,
                            marginLeft: i ? `-4rem` : undefined,
                            animationDelay: `${i * 0.15}s`,
                        }}
                        pfpHash={hash.toString()}
                    />
                ))}
            </div>
            <Particles
                className="absolute -z-10 h-full w-full transition-transform"
                quantity={50}
                images={bgHashes.map(hash => `api/gradient/${hash}`)}
            />
        </div>
    );
};
