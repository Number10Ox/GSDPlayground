/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'narrative': ['28px', { lineHeight: '1.6' }],
      },
      colors: {
        'background': '#1a1a1a',
        'surface': '#2a2a2a',
        'surface-light': '#3a3a3a',
      },
      maxWidth: {
        'prose': '66ch',
      },
    },
  },
  plugins: [],
}

