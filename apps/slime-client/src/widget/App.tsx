
import Draggable from 'react-draggable';

export function App() {
    return (
        <>
            <link type="text/css" rel="stylesheet" href={chrome.runtime.getURL("widget/style.css")} />
            <Draggable axis="y" bounds="html" defaultPosition={{ x: 0, y: 32 }}>
                <div className="fixed top-0 right-0 cursor-move z-[2147483647] bg-green-900 rounded-l-[1rem] p-4">
                    <img draggable={false} className="w-16 h-16" src={chrome.runtime.getURL("happy.png")}></img>
                </div>
            </Draggable>
        </>
    );
}