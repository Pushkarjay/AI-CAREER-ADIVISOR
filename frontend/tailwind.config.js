/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // 16:9 aspect ratio breakpoints
        'hd': '1280px',   // 1280x720 (HD)
        'fhd': '1920px',  // 1920x1080 (Full HD)
      },
      maxWidth: {
        'screen-2xl': '1536px',
        'screen-hd': '1280px',
        'screen-fhd': '1920px',
      },
      aspectRatio: {
        '16/9': '16 / 9',
      },
    },
  },
  plugins: [],
}
