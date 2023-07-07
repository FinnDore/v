import { forwardRef, type HTMLProps } from 'react';
import clsx from 'clsx';

export const Pfp = forwardRef<
    HTMLDivElement,
    HTMLProps<HTMLDivElement> & {
        name?: string | null | undefined;
        border?: string;
        image?: string | null;
        pfpHash?: string | null;
    }
>(function Pfp({ name, border, image, pfpHash, ...props }, ref) {
    const pictureName = encodeURIComponent(pfpHash ?? '');

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
                        'absolute z-10 h-full w-full overflow-clip rounded-full border border-black/20 dark:border-white/40'
                    )}
                >
                    <picture className="block h-[70px] min-h-full w-[70px]  min-w-full overflow-clip">
                        <source srcSet={'/NOISE.webp'} type="image/webp" />
                        <img
                            alt={`profile picture for ${name ?? 'a user'}`}
                            className="aspect-square min-h-full"
                        />
                    </picture>
                </div>
                <picture className="absolute block h-full w-full overflow-clip rounded-full blur-md saturate-150">
                    <source srcSet={image ?? `/api/gradient/${pictureName}`} />
                    <img
                        className="block h-full w-full rounded-full"
                        alt={`profile picture for ${name ?? 'a user'}`}
                    />
                </picture>
                <div className="absolute block h-full w-full overflow-clip rounded-full saturate-150">
                    <picture className="">
                        <source
                            srcSet={image ?? `/api/gradient/${pictureName}`}
                        />
                        <img
                            className="h-full w-full"
                            alt={`profile picture for ${name ?? 'a user'}`}
                        />
                    </picture>
                </div>
            </div>
        </div>
    );
});
