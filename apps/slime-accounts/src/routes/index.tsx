import { GoogleIcon } from '@/components/googleIcon'
import { Button } from '@/components/ui/button'
import { errorMessage } from '@/errorMessage';
import { getApiUrl } from '@/util/getUrl';
import { WindowUtil } from '@/util/WindowUtil';
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import { MessageCircleWarning } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

const popupScreenCenter = ({ url, w, h }: { url: string, w: number; h: number }) => {
	let x, y: number;
	const win = WindowUtil.InIframe ? window.parent : window;
	// TODO: might not work with dual monitor
	if (WindowUtil.InIframe || win.top == null) {
		y = (screen.height / 2) - (h / 2);
		x = (screen.width / 2) - (w / 2);
	}
	else {
		y = win.top.outerHeight / 2 + win.top.screenY - (h / 2);
		x = win.top.outerWidth / 2 + win.top.screenX - (w / 2);
	}
	return window.open(url, "login-popup", `popup=true, width=${w}, height=${h}, top=${y}, left=${x}`)
}

type LoginProviderSub = {
	provider: string;
	icon: ReactNode;
}

type LoginProviderMain = LoginProviderSub & {
	title: string;
}

type LoginProviderList = {
	main: LoginProviderMain[];
	secondary?: LoginProviderSub[];
};

const providers: LoginProviderList = {
	main: [
		{
			provider: "google",
			title: "Continue with Google",
			icon: <GoogleIcon />,
		},
		{
			provider: "google",
			title: "Continue with Google",
			icon: <GoogleIcon />,
		}
	],
	secondary: [
		{
			provider: "google",
			icon: <GoogleIcon />,
		},
		{
			provider: "google",
			icon: <GoogleIcon />,
		}
	]
};

export const Route = createFileRoute('/')({
	loader: () => {
		Cookies.remove("signup_details");
	},
	validateSearch: (search) => errorMessage.parse(search),
	component: () => {
		const { error } = Route.useSearch();
		const nav = useNavigate();

		const receiveMessage = async (event: MessageEvent<any>) => {
			if (typeof event.data !== "object")
				return;
			if (event.origin !== WindowUtil.currentOrigin)
				return;
			switch (event.data.kind) {
				case "loginComplete":
					await nav({ to: "/complete" });
					return;
				case "signUpRequired":
					await nav({ to: "/signup" });
					return;
				default:
					return;
			}
		}
		useEffect(() => {
			window.addEventListener("message", receiveMessage);
			return () => window.removeEventListener("message", receiveMessage);
		});

		const loginWith = (provider: string, forcePopup?: boolean) => {
			const url = getApiUrl(`/api/v1/external/${provider}`);
			if (WindowUtil.InIframe || forcePopup) {
				const popup = popupScreenCenter({ url, w: 516, h: 623 });
				if (popup == null) {
					nav({ to: "/", search: { error: { code: 500, text: "Internal Error", message: "Client did not display login popup" } } });
					return;
				}
				return;
			}
			window.location.href = url;
			return;
		}

		return (
			<>
				{
					error &&
					<div className='p-2 px-3 mb-6 text-sm border rounded-lg text-neutral-200 border-red-900/80 bg-red-900/30'>
						<div className="relative flex items-center gap-2 truncate">
							<div className='basis-28'>
								<MessageCircleWarning size={30} strokeWidth={1.8} />
							</div>
							<div className='flex-1'>
								<div>Something went wrong, please try again later.</div>
								<div className='truncate text-muted-foreground'>{error.code}: {error.message ?? error.text}</div>
							</div>
						</div>
					</div>
				}
				<img className='mb-2 w-14' src="./icon.png"></img>
				<h1 className="text-2xl font-semibold leading-normal tracking-tight">Log in or sign up</h1>
				<h2 className='font-thin'>Create your Slime account and start saving!</h2>
				<div className='w-full mt-6 space-y-2'>
					{
						providers.main.map(p => (
							<Button key={p.provider} className='w-full bg-transparent cursor-pointer' variant="outline" onClick={() => loginWith(p.provider)}>
								<span className='mr-1'>{p.icon}</span> {p.title}
							</Button>
						))
					}
				</div>
				<div className='flex gap-2 my-3 mb-4'>
					{
						providers.secondary?.map(p => (
							<Button key={p.provider} className='flex items-center justify-center w-12 bg-transparent cursor-pointer' variant="outline" onClick={() => loginWith(p.provider)}>
								{p.icon}
							</Button>
						))
					}
				</div>
				<div className="text-sm font-light text-neutral-400">
					By clicking continue, you agree to our <a className='underline'>Terms of Service</a> and <a className='underline'>Privacy Policy</a>.
				</div>
			</>
		)
	},
})
