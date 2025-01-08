/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
        "./**/*.{html,js,tsx,jsx}"
    ],
    theme: {
        extend: {
            colors: {
                dark: '#242424',
                light: '#dcdcdc'
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}
