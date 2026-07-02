/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        panelBorder: 'rgba(168, 121, 255, 0.18)',
        accent: '#a259ff',
        accent2: '#7c3aed',
        dim: '#9b8fb0'
      }
    }
  },
  plugins: []
};
