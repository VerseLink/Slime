import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'node:path'
import tailwindCss from "tailwindcss";


// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isDev = mode === "development";
	return {
		plugins: [
			react(),
			viteStaticCopy({
				targets: [
					{
						src: 'manifest.json',
						dest: '.',
					},
					{
						src: '_locales',
						dest: '.'
					}
				],
			}),
		],
		build: {
			outDir: 'build',
            minify: !isDev,
            sourcemap: isDev,
			rollupOptions: {
				input: {
					main: './index.html',
					service: 'src/service/index.ts'
				},
				output: {
					entryFileNames: '[name].js', // Ensures the service worker is named properly
					//chunkFileNames: 'chunks/[name].[hash].js', // Other files in chunks folder
				}
			},
		},
		css: {
			postcss: {
				plugins: [
					tailwindCss({
						config: "tailwind.config.js"
					})
				]
			}
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		}
	};
})
