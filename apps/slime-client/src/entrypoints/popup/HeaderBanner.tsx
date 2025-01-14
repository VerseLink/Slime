import { ChartNoAxesCombined, Check, CircleUserRound, Coins, CreditCard, EllipsisVertical, Languages, MonitorCog, MonitorSmartphone, MoonStar, ReceiptText, Settings2, SquareArrowOutUpRight, Sun, SunMoon, UserRoundPen } from "lucide-react";
import { HoverTooltip } from "../../components/HoverTooltip";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router";

export function HeaderBanner() {
    const navigate = useNavigate();
    return (
        <div className="w-full py-2.5" style={{ background: "rgb(0 0 0 / 75%) url(./slime.jpg)", backgroundBlendMode: "darken" }}>
            <div className="flex items-center">
                <div className="flex items-center gap-3 pl-4">
                    <img src="./widget/happy.png" className="h-8" />
                    <div className="relative">
                        <h1 className='text-2xl leading-tight text-white'>
                            Slime
                        </h1>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-zinc-400 dark:bg-zinc-400" />
                    <h2 className='text-xs leading-tight text-neutral-300'>{i18n.t("slogan")}</h2>
                </div>
                <div className="flex items-center flex-1 px-3 ml-auto">
                    <div className="py-1 cursor-pointer">
                        <div className="flex items-center gap-1.5">
                            <CircleUserRound className="w-6" strokeWidth={1.5} />
                            <div className="text-sm font-medium text-center text-nowrap">{i18n.t("signIn")}</div>
                        </div>
                    </div>
                    <HoverTooltip tip={"Settings"}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="pl-2 cursor-pointer">
                                    <EllipsisVertical className="h-5" strokeWidth={1.5} />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-48 bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300">
                                <DropdownMenuLabel className="min-h-8">
                                    Not Logged In
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => navigate("/profile")}>
                                    <UserRoundPen />Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Coins />
                                    <span>Rewards</span>
                                    <div className="ml-auto text-xs opacity-60">
                                        <span>$100.32 USD</span>
                                    </div>
                                </DropdownMenuItem>
                                <DropdownMenuItem><CreditCard />Billing</DropdownMenuItem>
                                <DropdownMenuItem><ChartNoAxesCombined />Analytics</DropdownMenuItem>
                                <DropdownMenuItem><ReceiptText />Subscription</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Settings2 />
                                    <span>Preferences</span>
                                </DropdownMenuItem>
                                <DropdownMenuGroup>
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <SunMoon />
                                            <span>Appearance</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent className="bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300">
                                                <DropdownMenuItem>
                                                    <Sun />
                                                    <span>Light</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem disabled>
                                                    <MoonStar />
                                                    <span>Dark</span>
                                                    <DropdownMenuShortcut>
                                                        <Check />
                                                    </DropdownMenuShortcut>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <MonitorSmartphone />
                                                    <span>Device</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                </DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => chrome.tabs.create({ url: "chrome://settings/languages" })}>
                                    <Languages />
                                    <span>Language</span>
                                    <DropdownMenuShortcut>
                                        <SquareArrowOutUpRight />
                                    </DropdownMenuShortcut>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </HoverTooltip>
                </div>
            </div>
        </div>
    );
}
