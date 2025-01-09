import { RefObject } from "react";
import Draggable from "react-draggable";

export function App() {
    const draggableRef = useRef<HTMLDivElement | null>(null);
    return (
        <>
            <Draggable axis="y" bounds="html" defaultPosition={{ x: 0, y: 32 }} nodeRef={draggableRef as RefObject<HTMLElement>}>
                <div className="fixed top-0 right-0 cursor-move z-[2147483647] bg-red-900 rounded-l-[1rem] p-4" ref={draggableRef}>
                    <img draggable={false} className="w-16 h-16" src={chrome.runtime.getURL("widget/happy.png")}></img>
                </div>
            </Draggable>
        </>
    );
}