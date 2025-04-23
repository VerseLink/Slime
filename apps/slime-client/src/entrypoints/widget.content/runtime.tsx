import { MessageRpc, RpcProvider } from "@slime/rpc";
import v1 from "./runtime/v1";
import { createContext, Dispatch, ReactNode, SetStateAction } from "react";
import { SandboxRuntimeAdaptor } from "./SandboxRuntimeAdaptor";
import { SlimeContext } from "./slime";

export class RuntimeSandboxServer {

    #setter: Dispatch<SetStateAction<SandboxRuntimeAdaptor | null>>;
    #client: RpcProvider<any>;

    constructor(setter: Dispatch<SetStateAction<SandboxRuntimeAdaptor | null>>, client: RpcProvider<any>) {
        this.#setter = setter;
        this.#client = client;
    }

    getRuntimeVersion(version: number) {
        switch (version) {
            case 1:
                return v1(this.#setter, this.#client as any);
            default:
                console.error("Requested runtime version is not supported", version);
                throw new Error("Requested runtime version is not supported");
        }
    }
}

export const SandboxRuntimeAdaptorContext = createContext<SandboxRuntimeAdaptor | null>(null);

export function SlimeRuntimeSandboxHost({ children }: { children?: ReactNode }) {
    const hostName = crypto.randomUUID();
    const clientName = crypto.randomUUID();
    const ref = useRef<HTMLIFrameElement>(null);
    const [runtimeHost, setRuntimeHost] = useState<SandboxRuntimeAdaptor | null>(null);
    const context = useContext(SlimeContext);

    useEffect(() => {
        const client = MessageRpc.createClient<any>({
            serviceName: clientName,
            messageHandler: (message) => ref.current?.contentWindow?.postMessage(message, "*"),
            logLevel: 'debug',
        });

        const server = MessageRpc.createServer(new RuntimeSandboxServer(setRuntimeHost, client), {
            serviceName: hostName,
            messageHandler: (message) => ref.current?.contentWindow?.postMessage(message, "*"),
            logLevel: 'debug',
        });

        return () => {
            server[Symbol.dispose]();
            client[Symbol.dispose]();
        }
    }, []);

    const params = new URLSearchParams({
        host: hostName,
        client: clientName,
    });

    if (context?.metadata?.scriptUrl) {
        params.append("scriptUrl", context.metadata.scriptUrl);
    }

    return (
        context &&
        <SandboxRuntimeAdaptorContext value={runtimeHost}>
            <iframe ref={ref} width={0} height={0} src={browser.runtime.getURL(`/sandbox.html?${params}`)} />
            {children}
        </SandboxRuntimeAdaptorContext>
    );
}