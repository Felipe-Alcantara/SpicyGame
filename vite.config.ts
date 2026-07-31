import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Caminhos relativos: o site é servido em /SpicyGame/, não na raiz do domínio.
  base: "./",
  // O GitHub Pages deste repositório publica `main:/docs`, então o build sai
  // direto ali — commitar já é publicar.
  build: { outDir: "docs", emptyOutDir: true },
  plugins: [react()],
});
