import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFileRoute, redirect, useNavigate, UseNavigateResult } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import Cookies from 'js-cookie'
import { errorMessage } from '@/errorMessage'
import { WindowUtil } from '@/util/WindowUtil'
import { getApiUrl } from '@/util/getUrl'

export const Route = createFileRoute('/signup')({
	loader: () => {
		if (WindowUtil.InPopup) {
			window.opener.postMessage({
				kind: "signUpRequired",
			}, WindowUtil.currentOrigin);
			window.close();
		}
		const signupDetailsRaw = Cookies.get("signup_details");
		if (!signupDetailsRaw)
			throw redirect({ to: "/" });
		const signupDetails = JSON.parse(signupDetailsRaw) as { email?: string, isEU?: boolean } | undefined;
		if (!signupDetails?.email)
			throw redirect({ to: "/" });
		return { email: signupDetails.email, isEU: signupDetails.isEU ?? true };
	},
	component: RouteComponent,
})

const formSchema = z.object({
	agreeToTerms: z.boolean(),
	agreeToMail: z.boolean().optional(),
})

async function onSubmitSignup(data: z.infer<typeof formSchema>, navigate: UseNavigateResult<string>) {

	// set csrf_token to a uuid for server
	let csrfToken = Cookies.get("csrf_token");
	if (!csrfToken) {
		csrfToken = crypto.randomUUID();
		Cookies.set("csrf_token", csrfToken, { sameSite: "strict" });
	}
	const response = await fetch(getApiUrl("/api/v1/register"), {
		method: "POST",
		credentials: "include",
		body: JSON.stringify({
			agreeToMail: data.agreeToMail,
			csrf_token: csrfToken
		})
	});

	if (!response.ok) {
		// some error has occured
		navigate({
			to: "/",
			search: {
				error: {
					code: response.status,
					text: response.statusText,
					message: await response.text(),
				}
			} satisfies z.infer<typeof errorMessage>
		});
		return;
	}

	navigate({ to: "/complete" });
}

function RouteComponent() {
	const { email, isEU } = Route.useLoaderData();
	const navigate = useNavigate();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			agreeToTerms: !isEU,
			agreeToMail: !isEU
		}
	});

	return (
		<>
			<img className="mb-2 w-14" src="./icon.png"></img>
			<h1 className="text-2xl font-semibold leading-normal tracking-tight">
				It's great to have you with us!
			</h1>
			<h2 className="font-thin">One more step and we are there!</h2>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(async (data) => await onSubmitSignup(data, navigate))}>
					<div className="w-full my-6 space-y-2.5">
						<div className="grid grid-cols-4 w-full max-w-sm items-center gap-1.5">
							<Label className="col-span-1" htmlFor="email">
								Email
							</Label>
							<Input
								className="col-span-3 bg-transparent"
								value={email}
								placeholder="Email"
								disabled
							/>
						</div>
					</div>
					<div className="p-2 my-4 space-y-3">
						<FormField
							control={form.control}
							name="agreeToTerms"
							render={({ field }) => (
								<FormItem className="flex items-center space-x-2">
									<FormControl>
										<Checkbox
											className="border-muted-foreground"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel className="text-xs font-normal text-muted-foreground">
										I understand and agree to our <a className='underline' href="https://useslime.com/privacy" target="_blank">Terms of Service</a> and <a className='underline' href="https://useslime.com/privacy" target="_blank">Privacy Policy</a>.
									</FormLabel>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="agreeToMail"
							render={({ field }) => (
								<FormItem className="flex items-center space-x-2">
									<FormControl>
										<Checkbox
											className="border-muted-foreground"
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<FormLabel className="text-xs font-normal text-muted-foreground">
										I want to receive feature updates, news and offers from Slime by
										email. I understand I can cancel at any time via settings.
									</FormLabel>
								</FormItem>
							)}
						/>
					</div>
					<Button
						className="w-full cursor-pointer bg-sea-green-600 hover:bg-sea-green-700"
						variant="outline"
						type="submit"
						disabled={!form.watch().agreeToTerms}
					>
						Agree and Create the Acoount!
					</Button>
				</form>
			</Form>
		</>
	)
}
