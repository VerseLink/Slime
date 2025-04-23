import { RefObject } from "react";
import Draggable from "react-draggable";
import { SlimeRuntimeSandboxHost } from "./runtime";
import {
    ContextMenu,
    ContextMenuCheckboxItem,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuShortcut,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ContainerContext } from "./Container";
import { ContextMenuPortal } from "@radix-ui/react-context-menu";

export function App() {
    const container = useContext(ContainerContext);
    const draggableRef = useRef<HTMLDivElement | null>(null);
    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger>
                    <Draggable axis="y" bounds="html" defaultPosition={{ x: 0, y: 32 }} nodeRef={draggableRef as RefObject<HTMLElement>}>
                        <div className="fixed top-0 right-0 cursor-move z-[2147483647] bg-green-900 rounded-l-[1rem] p-4" ref={draggableRef}>
                            <img draggable={false} className="w-12 h-12" src={chrome.runtime.getURL("widget/happy.png")}></img>
                        </div>
                    </Draggable>
                </ContextMenuTrigger>
                <ContextMenuContent container={container} className="z-[2147483647] w-64">
                    <ContextMenuCheckboxItem checked>
                        Display widget on this website
                        <ContextMenuShortcut>⌘⇧B</ContextMenuShortcut>
                    </ContextMenuCheckboxItem>
                </ContextMenuContent>
            </ContextMenu>
            <SlimeRuntimeSandboxHost />
        </>
    );
}