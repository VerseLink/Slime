import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'
import { viteSingleFile } from 'vite-plugin-singlefile'
import tailwindCss from "tailwindcss";


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === "development";
    return {
        plugins: [
            react(),
            viteSingleFile()
        ],
        build: {
            copyPublicDir: false,
            minify: !isDev,
            sourcemap: isDev,
            outDir: 'build/widget',
            rollupOptions: {
                input: {
                    widget: 'src/widget/index.tsx'
                },
                output: {
                    entryFileNames: '[name].js', // Ensures the service worker is named properly
                    assetFileNames: '[name].[ext]'
                }
            }
        },
        css: {
            postcss: {
                plugins: [
                    tailwindCss({
                        config: "./src/widget/tailwind.widget.config.js"
                    })
                ]
            }
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
})