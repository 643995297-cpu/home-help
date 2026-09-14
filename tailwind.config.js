/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clay: { 50:'#FBF3ED',100:'#F7E8DB',200:'#EFD0B8',300:'#E4B389',400:'#D4945E',500:'#C4663A',600:'#A85330',700:'#7A3B23',DEFAULT:'#C4663A'},
        sage: { 50:'#F2F5EF',100:'#DCE5D4',200:'#BAC9AC',300:'#9AAE88',400:'#7A8B6F',500:'#5E6F54',DEFAULT:'#7A8B6F'},
        cream: '#F7F1E8',
        charcoal: '#2D2A26',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
