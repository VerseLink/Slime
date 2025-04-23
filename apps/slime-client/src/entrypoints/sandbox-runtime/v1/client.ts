import { LogLevel, MessageRpc } from '@slime/rpc';

import {
	PageDocument,
	PageElement,
	PageEventTarget,
	PageHTMLButtonElement,
	PageHTMLDataListElement,
	PageHTMLElement,
	PageHTMLFieldSetElement,
	PageHTMLFormElement,
	PageHTMLInputElement,
	PageHTMLObjectElement,
	PageHTMLOptionElement,
	PageHTMLOutputElement,
	PageHTMLSelectElement,
	PageHTMLTextAreaElement,
	PageNode,
} from '@slime/runtime/v1';
import { RuntimeSandboxServer } from '@/entrypoints/widget.content/runtime';
import { SlimeScriptMetadata } from '@slime/runtime';

export interface ClientInit {
	host: string;
	client: string;
	logLevel?: LogLevel;
	metadata: SlimeScriptMetadata;
}

export async function runClient(init: ClientInit) {
	const client = MessageRpc.createClient<RuntimeSandboxServer>({
		serviceName: init.host ?? 'sandbox',
		messageHandler: (message) => parent.postMessage(message, '*'),
		logLevel: init.logLevel ?? 'debug',
		customTypes: [
			PageEventTarget,
			PageNode,
			PageElement,
			PageHTMLElement,
			PageHTMLFormElement,
			PageHTMLDataListElement,
			PageHTMLInputElement,
			PageHTMLOptionElement,
			PageHTMLSelectElement,
			PageHTMLButtonElement,
			PageHTMLObjectElement,
			PageHTMLOutputElement,
			PageHTMLFieldSetElement,
			PageHTMLTextAreaElement,
			PageDocument,
		],
	});
	const runtime = await client.getRuntimeVersion(1);
	const script = init.metadata.getScript(runtime);
	MessageRpc.createServer(script, {
		serviceName: init.client ?? 'sandbox',
		messageHandler: (message) => parent.postMessage(message, '*'),
		logLevel: init.logLevel ?? 'debug',
	});
	// we don't need to dispose the client or server since the script shall be alive as long as the iframe sandbox is available
}
