/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Barlow Condensed"', 'sans-serif'],
                mono: ['"Space Mono"', 'monospace'],
                body: ['"Barlow"', 'sans-serif'],
            },
            colors: {
                carbon: {
                    950: '#050810',
                    900: '#090d18',
                    800: '#0e1422',
                    700: '#141b2e',
                    600: '#1c2640',
                },
                wind: {
                    DEFAULT: '#00e5a0',
                    dim: '#00b87e',
                    glow: 'rgba(0,229,160,0.15)',
                },
                actual: {
                    DEFAULT: '#38bdf8',
                    dim: '#0ea5e9',
                    glow: 'rgba(56,189,248,0.15)',
                },
                amber: {
                    alert: '#f59e0b',
                },
            },
            boxShadow: {
                'glow-wind': '0 0 20px rgba(0,229,160,0.2)',
                'glow-actual': '0 0 20px rgba(56,189,248,0.2)',
                'inner-panel': 'inset 0 1px 0 rgba(255,255,255,0.05)',
            },
        },
    },
    plugins: [],
}
