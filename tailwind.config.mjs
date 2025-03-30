/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
    colors: {
      creme: '#fcefe3',
      'light-orange': '#F09B6A',
      brown: '#A68358',
      orange: '#F28322',
      'custom-black': '#0D0D0D',
      'custom-white': '#F2F2F2',
    },
    fontFamily: {
      loading: ['Yarndings20', 'sans-serif'],
      title: ['Harmond', 'serif'],
      titleita: ['HarmondIta', 'serif'],
      custom: ['ClashGrotesk'],
    },
  },
  plugins: [],
};
