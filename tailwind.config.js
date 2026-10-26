import plugin from "tailwindcss/plugin";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [
    // `toque:` vale onde o controle é para o dedo: tela de toque (pointer: coarse) ou abaixo de `lg`,
    // que é onde a gaveta de ajustes substitui o painel lateral.
    plugin(({ addVariant }) => {
      addVariant("toque", "@media (pointer: coarse), not all and (min-width: 1024px)");
    }),
  ],
}
