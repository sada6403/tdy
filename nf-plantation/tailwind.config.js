/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-green': '#1A4D2E', // Dark Forest Green
                'brand-accent': '#C4A484', // Warm Tan
                'brand-cream': '#F8F6F1',  // Light Cream
                'brand-dark': '#064E3B', 
                'brand-light': '#D1FAE5',
                'finance-blue': '#1E293B',
                'finance-gold': '#D97706',
                'nature-light': '#F8F6F1',
                'nature-dark': '#1A4D2E',
            },
            fontFamily: {
                'sans': ['Poppins', 'Inter', 'sans-serif'],
                'serif': ['Lora', 'serif'],
            },
            animation: {
                'drift': 'drift 20s linear infinite',
            },
            keyframes: {
                drift: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            }
        },
    },
    plugins: [],
}
