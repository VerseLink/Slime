import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		viteStaticCopy({
			targets: [
				{
					src: 'public/manifest.json',
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
		rollupOptions: {
			input: {
				main: './index.html',
				service: 'src/service/index.ts'
			},
			output: {
				entryFileNames: '[name].js', // Ensures the service worker is named properly
				chunkFileNames: 'chunks/[name].[hash].js', // Other files in chunks folder
			}
		},
	},
})
