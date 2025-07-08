/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        // below config for react-daisyui
        'node_modules/daisyui/dist/**/*.js',
        'node_modules/react-daisyui/dist/**/*.js',
    ],
    theme: {
        extend: {},
    },
    plugins: [
        daisyui
    ],
    daisyui: {
        themes: ["light", "dark", "cupcake"]
    },
}

