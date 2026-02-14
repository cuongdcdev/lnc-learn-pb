/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lnc: {
          bg: '#FFFBF5', // Warm Cream - Global Background
          card: '#FFFFFF', // Pure White - Cards/Inputs
          ink: {
            black: '#18181B', // Zinc-900 - Borders/Shadows/Headings
            grey: '#3F3F46',  // Zinc-700 - Body Text
            light: '#E4E4E7', // Zinc-200 - Inactive Borders
          },
          teal: '#00C897', // Primary Brand
          orange: '#FFB36B', // Secondary Brand/Accents
        }
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'Plus Jakarta Sans', 'sans-serif'],
      },
      boxShadow: {
        // Neo-Pop Hard Shadows (No blur)
        'neo-1': '4px 4px 0px 0px #18181B', // Cards
        'neo-2': '2px 2px 0px 0px #18181B', // Small elements / Buttons
        'neo-hover': '5px 5px 0px 0px #18181B', // Button Hover
        'neo-focus': '3px 3px 0px 0px #18181B', // Input Focus
        'neo-pressed': '0px 0px 0px 0px #18181B', // Pressed State
      },
      borderRadius: {
        'neo': '20px', // Standard Card Radius
        'neo-sm': '12px', // Small elements
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
