import { createRoot } from 'react-dom/client';
import { supportedSites } from "@/utils/placeholder";
import React from 'react';

import { App } from './App';

import './style.css';

export default defineContentScript({
    matches: [
        "http://*/*",
        "https://*/*"
    ],
    cssInjectionMode: "ui",
    runAt: "document_end",
    matchAboutBlank: false,
    allFrames: false,

    async main(ctx) {
        if (!supportedSites.has(new URL(window.location.href).hostname))
            return;
        const ui = await createShadowRootUi(ctx, {
            name: "slime-widget",
            mode: "closed",
            position: "modal",
            anchor: "body",
            onMount: (container) => {
                const app = document.createElement('div');
                container.append(app);

                const root = createRoot(app);
                root.render(
                    <React.StrictMode>
                        <App />
                    </React.StrictMode>
                );
                return { root, app };
            },
            onRemove: (elements) => {
                // Unmount the root when the UI is removed
                elements?.root.unmount();
                elements?.app.remove();
            }
        });

        ui.mount();
    },

});
