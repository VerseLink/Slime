import { LogLevel } from '@slime/rpc';
import { SlimeScriptMetadata } from '@slime/runtime'
import * as v1 from './v1/client';

export default defineUnlistedScript(async () => {
	const args = new URL(window.location.href).searchParams;
	const scriptUrl = args.get('script');
	if (scriptUrl) {
		const module = await import(scriptUrl);
		const metadata: SlimeScriptMetadata = module.default;
		switch (metadata?.runtime?.version) {
			case 1:
				await v1.runClient({
					host: args.get('host') ?? 'sandbox',
					logLevel: (args.get('logLevel') as LogLevel | null) ?? 'debug',
					client: args.get('client') ?? 'sandbox-client',
					metadata
				});
				break;
			default:
				console.error("The current loaded script doesn't support the current runtime", {
					url: scriptUrl,
					version: metadata?.runtime?.version,
				});
		}
	}
});
