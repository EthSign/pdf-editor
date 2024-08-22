import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      rollupTypes: true,
      insertTypesEntry: true,
    }),
    viteStaticCopy({
      targets: [
        {
          src: "../build/generic/*",
          dest: "./pdf-viewer",
        },
      ],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/lib/index.ts"),
      name: "pdfEditor",
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom", "clsx", "pdf-lib"],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "react/jsx-runtime",
          "react-dom": "ReactDOM",
          "clsx": "clsx",
          "pdf-lib": "PDFLib"
        },
      },
    },
  },
});
