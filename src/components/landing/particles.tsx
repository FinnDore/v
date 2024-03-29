import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import MousePosition from './mouse-position';

const dpr = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

interface ParticlesProps {
    className?: string;
    quantity?: number;
    staticity?: number;
    ease?: number;
    refresh?: boolean;
    color?: string;
    vx?: number;
    vy?: number;
    images?: string[];
}

type Circle = {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
    magnetism: number;
    imageIndex: number;
};

const hexToRgb = (hex: string): number[] => {
    // Remove the "#" character from the beginning of the hex color code
    hex = hex.replace('#', '');

    // Convert the hex color code to an integer
    const hexInt = parseInt(hex, 16);

    // Extract the red, green, and blue components from the hex color code
    const red = (hexInt >> 16) & 255;
    const green = (hexInt >> 8) & 255;
    const blue = hexInt & 255;

    // Return an array of the RGB values
    return [red, green, blue];
};

const remapValue = (
    value: number,
    start1: number,
    end1: number,
    start2: number,
    end2: number
): number => {
    const remapped =
        ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
};

const fps = 15;
// TODO fix last remaing bugs and add creddit to creddit page thing V-23
export const Particles: React.FC<ParticlesProps> = ({
    className = '',
    quantity = 30,
    staticity = 50,
    ease = 50,
    color = '#ffffff',
    vx = 0,
    vy = 0,
    images,
}) => {
    const shouldAnimateRef = useRef<boolean>(true);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const context = useRef<CanvasRenderingContext2D | null>(null);
    const [circles, setCircles] = useState<Circle[]>([]);
    const mousePosition = MousePosition();
    const mouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
    const isHovering = useRef<boolean>(false);
    const prevFrame = useRef<number>(performance.now());
    const imageElements = useRef<HTMLImageElement[] | null>(null);
    const rgb = useMemo(() => hexToRgb(color).join(', '), [color]);

    useEffect(() => {
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const { w, h } = canvasSize.current;
            const x = mousePosition.x - rect.left - w / 2;
            const y = mousePosition.y - rect.top - h / 2;
            const inside = x < w / 2 && x > -w / 2 && y < h / 2 && y > -h / 2;
            if (inside) {
                mouse.current.x = x;
                mouse.current.y = y;
                isHovering.current = true;
            } else {
                isHovering.current = false;
            }
        }
    }, [mousePosition.x, mousePosition.y]);

    const circleParams = useCallback((): Circle => {
        const x = Math.floor(Math.random() * canvasSize.current.w);
        const y = Math.floor(Math.random() * canvasSize.current.h);
        const translateX = 0;
        const translateY = 0;
        const size = Math.min(8, Math.floor(Math.random() * 20));
        const alpha = 0;
        const targetAlpha = parseFloat((Math.random() * 0.6).toFixed(1));
        const dx = (Math.random() - 0.5) * 0.2;
        const dy = (Math.random() - 0.5) * 0.2;
        const magnetism = 0.1 + Math.random() * 6;
        return {
            x,
            y,
            translateX,
            translateY,
            size,
            alpha,
            targetAlpha,
            dx,
            dy,
            magnetism,
            imageIndex: Math.floor(Math.random() * (images?.length ?? 1)),
        };
    }, [images]);

    useEffect(() => {
        if (!images) return;
        if (!imageElements.current) imageElements.current = [];

        for (const image of images) {
            const imageElement = new Image();
            imageElement.src = image;
            imageElement.onload = () => {
                if (imageElements.current) {
                    imageElements.current.push(imageElement);
                }
            };
        }

        return () => {
            imageElements.current = null;
        };
    }, [images]);

    const drawCircle = useCallback(
        (circle: Circle) => {
            if (!context.current) return;
            const { x, y, translateX, translateY, size, alpha } = circle;
            context.current.translate(translateX, translateY);
            if (!images) {
                context.current.beginPath();
                context.current.arc(x, y, size, 0, 2 * Math.PI);
                context.current.fillStyle = `rgba(${rgb}, ${alpha})`;
                context.current.fill();
                context.current.closePath();
            } else {
                const image = imageElements.current?.[circle.imageIndex];
                if (!image) return;

                context.current.globalAlpha = alpha;
                context.current.filter = `blur(${
                    !isHovering.current ? alpha * 3 : 0
                }px)`;
                context.current.drawImage(image, x, y, size, size);
                context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        },
        [images, rgb]
    );

    const clearContext = useCallback(() => {
        if (context.current) {
            context.current.clearRect(
                0,
                0,
                canvasSize.current.w,
                canvasSize.current.h
            );
        }
    }, []);

    const initCanvas = useCallback(() => {
        if (
            canvasContainerRef.current &&
            canvasRef.current &&
            context.current
        ) {
            canvasSize.current.w = canvasContainerRef.current.offsetWidth;
            canvasSize.current.h = canvasContainerRef.current.offsetHeight;
            canvasRef.current.width = canvasSize.current.w * dpr;
            canvasRef.current.height = canvasSize.current.h * dpr;
            canvasRef.current.style.width = `${canvasSize.current.w}px`;
            canvasRef.current.style.height = `${canvasSize.current.h}px`;
            context.current.scale(dpr, dpr);
        }
    }, []);

    useEffect(() => {
        let shouldAnimate = true;
        const animate = (timestamp: number) => {
            if (!shouldAnimate) return;
            const interval = 1000 / fps;
            const delta = timestamp - prevFrame.current;
            window.requestAnimationFrame(animate);

            if (delta < interval) return;

            clearContext();
            circles.forEach((circle: Circle, i: number) => {
                // Handle the alpha value
                const edge = [
                    circle.x + circle.translateX - circle.size, // distance from left edge
                    canvasSize.current.w -
                        circle.x -
                        circle.translateX -
                        circle.size, // distance from right edge
                    circle.y + circle.translateY - circle.size, // distance from top edge
                    canvasSize.current.h -
                        circle.y -
                        circle.translateY -
                        circle.size, // distance from bottom edge
                ];

                const closestEdge = edge.reduce((a, b) => Math.min(a, b));
                const remapClosestEdge = parseFloat(
                    remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
                );

                if (remapClosestEdge > 1) {
                    circle.alpha += 0.02;
                    if (circle.alpha > circle.targetAlpha) {
                        circle.alpha = circle.targetAlpha;
                    }
                } else {
                    circle.alpha = circle.targetAlpha * remapClosestEdge;
                }

                circle.x += circle.dx + vx;
                circle.y += circle.dy + vy;
                circle.translateX +=
                    (mouse.current.x / (staticity / circle.magnetism) -
                        circle.translateX) /
                    ease;
                circle.translateY +=
                    (mouse.current.y / (staticity / circle.magnetism) -
                        circle.translateY) /
                    ease;

                // circle gets out of the canvas
                if (
                    circle.x < -circle.size ||
                    circle.x > canvasSize.current.w + circle.size ||
                    circle.y < -circle.size ||
                    circle.y > canvasSize.current.h + circle.size
                ) {
                    circles.splice(i, 1);
                    const newCircle = circleParams();
                    drawCircle(newCircle);
                    circles.push(newCircle);
                } else {
                    drawCircle({
                        dx: circle.dx,
                        dy: circle.dy,
                        size: circle.size,
                        magnetism: circle.magnetism,
                        targetAlpha: circle.targetAlpha,
                        imageIndex: circle.imageIndex,
                        x: circle.x,
                        y: circle.y,
                        translateX: circle.translateX,
                        translateY: circle.translateY,
                        alpha: circle.alpha,
                    });
                }
            });

            prevFrame.current = timestamp - (delta % interval);
        };

        if (canvasRef.current) {
            context.current = canvasRef.current.getContext('2d');
        }

        shouldAnimateRef.current = true;
        initCanvas();
        animate(performance.now());
        window.addEventListener('resize', initCanvas);
        return () => {
            shouldAnimate = false;
            window.removeEventListener('resize', initCanvas);
        };
    }, [
        circleParams,
        circles,
        clearContext,
        drawCircle,
        ease,
        initCanvas,
        staticity,
        vx,
        vy,
    ]);

    useEffect(() => {
        if (circles.length === quantity) return;
        const ouputCircles = [];
        for (let i = 0; i < quantity; i++) {
            const circle = circleParams();
            ouputCircles.push(circle);
        }
        setCircles(ouputCircles);
    }, [circleParams, circles, quantity]);

    return (
        <div className={className} ref={canvasContainerRef} aria-hidden="true">
            <canvas ref={canvasRef} />
        </div>
    );
};
