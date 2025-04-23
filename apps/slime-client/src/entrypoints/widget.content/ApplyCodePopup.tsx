import { slimeEvent } from "./event";
import { SandboxRuntimeAdaptorContext } from "./runtime";
import { SlimeContext } from "./slime";

export function ApplyCodePopup() {

    const [popup, setPopup] = useState(false);
    const runtime = useContext(SandboxRuntimeAdaptorContext);
    const slime = useContext(SlimeContext);

    useEffect(() => {
        const applyCode = () => {
            setPopup(true);
        };
        slimeEvent.addEventListener("applyCode", applyCode);
        return slimeEvent.removeEventListener("applyCode", applyCode);
    });

    return (
        // we only allow apply code popup if the runtime supports it
        popup && runtime && runtime.applyCode && slime &&
        <div className="fixed">
            <div>
                <div onClick={() => runtime.applyCode(slime.coupons.content)}></div>
            </div>
        </div>
    );
}