export default {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                'fade-in': 'fade-in .25s linear forwards',
                'pulse-size':
                    'pulseSize 1s cubic-bezier(0, 0, 0.2, 1) infinite',
                'drop-in':
                    'dropIn .5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards',
            },
        },
    },
    plugins: [],
};
