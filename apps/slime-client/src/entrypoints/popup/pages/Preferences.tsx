import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, ChevronRight, Combine, Languages, MonitorSmartphone, Moon, Palette, Settings, Settings2, Share, SquareArrowOutUpRight, Sun, SunMoon, Tag, UserCircle, UserCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router";

export function Preferences() {
    const navigate = useNavigate();
    return (
        <div className="overflow-y-auto  [scrollbar-width:thin] [scrollbar-gutter:stable]">
            <div className="sticky top-0 z-10 bg-zinc-950">
                <div className="flex items-center h-12">
                    <Link to="/">
                        <div className="px-3">
                            <ChevronLeft />
                        </div>
                    </Link>
                    <h1 className="text-lg font-semibold">Preferences</h1>
                </div>
                <Separator />
            </div>
            <Separator />
            <div className="m-3 space-y-2">
                <div className="p-5 space-y-4 border rounded-lg border-zinc-800">
                    <div className="flex flex-row items-center justify-between">
                        <Palette className="mr-4" size={28} strokeWidth={1.75} />
                        <div className="flex-1 mr-4">
                            <div className="flex items-center gap-2 font-semibold">Customization</div>
                            <div className="text-sm opacity-75">Customize your extension theme.</div>
                        </div>
                    </div>
                    <Separator/>
                    <div className="flex flex-row items-center justify-between">
                        <SunMoon className="mr-4" />
                        <div className="text-sm font-medium">Appearance</div>
                        <Select defaultValue="system" >
                            <SelectTrigger className="ml-auto w-[180px] -mr-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="light">
                                    <div className="flex items-center gap-2"><Sun size={20} /> Light</div>
                                </SelectItem>
                                <SelectItem value="dark">
                                    <div className="flex items-center gap-2"><Moon size={20} /> Dark</div>
                                </SelectItem>
                                <SelectSeparator />
                                <SelectItem value="system">
                                    <div className="flex items-center gap-2">
                                        <MonitorSmartphone size={20} />
                                        Device
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-row items-center justify-between p-5 border rounded-lg cursor-pointer border-zinc-800 hover:bg-zinc-800/50">
                    <Languages className={"mr-4"} size={28} strokeWidth={1.75} />
                    <div className="flex-1 mr-4 space-y-1">
                        <div className="flex items-center gap-2 font-semibold"> Language</div>
                        <div className="text-sm opacity-75">This extensions language is managed by your browser's profile.</div>
                    </div>
                    <div className="ml-auto">
                        <SquareArrowOutUpRight size={22} />
                    </div>
                </div>
                <div className="flex flex-row items-center justify-between p-5 border rounded-lg cursor-pointer border-zinc-800 hover:bg-zinc-800/50" onClick={() => navigate("/preferences/share")}>
                    <Combine className={"mr-4"} size={28} strokeWidth={1.75} />
                    <div className="flex-1 mr-4 space-y-1">
                        <div className="flex items-center gap-2 font-semibold"> Share and Contribution</div>
                        <div className="text-sm opacity-75">Set how you want share your findings and contributions. Slime is community driven and thus your contribution matters.</div>
                    </div>
                    <div className="ml-auto">
                        <ChevronRight size={28} />
                    </div>
                </div>
            </div>
        </div>
    )
}