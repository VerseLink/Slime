import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Languages, Moon, Settings, Sun, SunMoon, Tag, UserCircle, UserCircle2 } from "lucide-react";
import { Link } from "react-router";

export function Profile() {
    return (
        <div className="overflow-y-auto  [scrollbar-width:thin] [scrollbar-gutter:stable]">
            <div className="sticky top-0 z-10 bg-zinc-950">
                <div className="flex items-center h-12">
                    <Link to="/">
                        <div className="px-3">
                            <ChevronLeft />
                        </div>
                    </Link>
                    <h1 className="text-lg font-semibold">Profile</h1>
                </div>
                <Separator />
            </div>
            <div className="">
                <div className="px-4 m-3 border rounded-lg border-zinc-800">
                    <div className="flex flex-row items-center gap-4 my-3">
                        <div className="rounded-full">
                            <UserCircle2 strokeWidth={1.2} size={30} />
                        </div>
                        <div className="space-y-0.5">
                            <div className="font-semibold">Anonymous Profile</div>
                            <div className="text-sm opacity-75">Anonymous profiles will not be able to receive rewards or cashbacks generated.</div>
                        </div>
                    </div>
                    <Separator />
                    <div className="w-full my-4 space-y-1 text-sm">
                        <div className="flex w-full gap-2">
                            <div className="opacity-75">ID</div>
                            <div className="ml-auto">{crypto.randomUUID()}</div>
                        </div>
                        <div className="flex w-full gap-2">
                            <div className="opacity-75">Created At</div>
                            <div className="ml-auto">{new Date().toLocaleString(chrome.i18n.getUILanguage())}</div>
                        </div>
                        <div className="flex w-full gap-2">
                            <div className="opacity-75">Missed Cashbacks</div>
                            <div className="ml-auto">{30.12} USD</div>
                        </div>
                        <div className="flex w-full gap-2">
                            <div className="opacity-75">Saved</div>
                            <div className="ml-auto">{30.12} USD</div>
                        </div>
                        <div className="flex w-full gap-2">
                            <div className="opacity-75">Other Saved From You</div>
                            <div className="ml-auto">{1130.12} USD</div>
                        </div>
                    </div>
                    <Separator />
                    <div className="my-4">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-sm text-red-400/70">Uninstalling the extension may loose you the account</div>
                            <Button>Claim Now</Button>
                        </div>
                    </div>
                </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2 m-4 text-sm">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex gap-2">
                        <Languages />
                        <div className="font-semibold">Language</div>
                    </div>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-row items-center justify-between">
                    <div className="flex gap-2">
                        <SunMoon />
                        <div className="font-semibold">Appearance</div>
                    </div>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue defaultValue="light" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">
                                <div className="flex items-center gap-2"><Sun size={20} /> Light</div>
                            </SelectItem>
                            <SelectItem value="dark">
                                <div className="flex items-center gap-2"><Moon size={20} /> Light</div>
                            </SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Separator />
            <div className="m-3 space-y-4">
                <div className="flex flex-row items-center justify-between p-4 border rounded-lg border-zinc-800">
                    <div className="space-y-0.5 mr-4">
                        <div className="font-semibold">Automatically Collect Coupon</div>
                        <div className="text-sm opacity-75">Allow Slime to automatically collect coupon from websites that you visit.</div>
                    </div>
                    <Switch />
                </div>
            </div>
        </div>
    )
}