import { forwardRef, type HTMLProps } from 'react';
import clsx from 'clsx';

export const Pfp = forwardRef<
    HTMLDivElement,
    HTMLProps<HTMLDivElement> & { name: string; border?: string }
>(function Pfp({ name, border, ...props }, ref) {
    const pictureName = encodeURIComponent(name ?? '');

    return (
        <div
            ref={ref}
            {...props}
            className={clsx('aspect-square', props.className)}
        >
            <div className="relative h-full w-full cursor-pointer transition-all hover:scale-110">
                <div
                    className={clsx(
                        border,
                        'absolute z-10 h-full w-full overflow-clip rounded-full border border-white/40'
                    )}
                >
                    <picture className="block h-[70px] w-[70px] overflow-clip">
                        <source srcSet={'/NOISE.webp'} type="image/webp" />
                        <img alt={`profile picture for ${name}`} />
                    </picture>
                </div>
                <picture className="absolute block h-full w-full rounded-full">
                    <source srcSet={`/api/gradient/${pictureName}`} />
                    <img
                        className="h-full w-full"
                        alt={`profile picture for ${name}`}
                    />
                </picture>
                <picture className="absolute block h-full w-full blur-md saturate-150">
                    <source srcSet={`/api/gradient/${pictureName}`} />
                    <img
                        className="h-full w-full"
                        alt={`profile picture for ${name}`}
                    />
                </picture>
            </div>
        </div>
    );
});
