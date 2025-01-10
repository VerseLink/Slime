import { defineConfig } from 'wxt';
import path from "node:path";

// See https://wxt.dev/api/config.html
export default defineConfig({
	srcDir: "src",
	manifest: {
		default_locale: "en",
		name: '__MSG_extName__',
		description: '__MSG_extDescription__',
		permissions: [
			"tabs",
			"storage",
			"sidePanel"
		],
		web_accessible_resources: [
			{
				"matches": [
					"http://*/*",
					"https://*/*"
				],
				"resources": [
					"widget/*"
				]
			}
		]
	},
	images: [
		{
			from: "assets/icon.png",
			to: "icons/[width].png",
			resize: [128, 48, 32, 16],
			asManifestIcon: true,
		},
		{
			from: "assets/icon.png",
			to: "icons/[width].disabled.png",
			resize: [128, 48, 32, 16],
			transform: (image) => {
				image.grayscale();
			}
		}
	],
	extensionApi: 'chrome',
	modules: ['@wxt-dev/module-react', '@wxt-dev/i18n/module'],
	alias: {
		"@": path.resolve(__dirname, "./src"),
	}
});
