import { type Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fade-in .25s linear forwards',
                'pulse-size':
                    'pulseSize 1s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
        },
    },
    plugins: [],
} satisfies Config;
