import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle } from 'lucide-react'
import Cookies from "js-cookie";
import { WindowUtil } from '@/util/WindowUtil';

export const Route = createFileRoute('/complete')({
    loader: () => {

        if (WindowUtil.InIframe) {
            window.parent.postMessage({
                kind: "loginComplete",
                accessToken: Cookies.get("__slime_access_token")
            }, WindowUtil.currentOrigin);
        }

        if (WindowUtil.InPopup) {
            window.opener.postMessage({
                kind: "loginComplete"
            }, WindowUtil.currentOrigin);
            window.close();
        }
    },
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className='flex flex-col items-center justify-center px-3 text-center min-h-80 rounded-2xl'>
            <div className="my-2">
                <CheckCircle size={64} className='stroke-sea-green-600' />
            </div>
            <div className='text-3xl font-bold'>
                Welcome!
            </div>
            <div className='my-3 text-muted-foreground'>
                <div>You have successfully logged in! It is safe to close this window or popup now.</div>
            </div>
        </div>
    );
}
