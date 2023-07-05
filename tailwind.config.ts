import { type Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fade-in .25s linear forwards',
            },
        },
    },
    plugins: [],
} satisfies Config;
