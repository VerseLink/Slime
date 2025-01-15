import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Languages, Moon, SquareArrowOutUpRight, Sun, SunMoon } from "lucide-react";
import { Link, useNavigate } from "react-router";

export function SharePreferences() {
    return (

        <div className="overflow-y-auto  [scrollbar-width:thin] [scrollbar-gutter:stable]">
            <div className="sticky top-0 z-10 bg-zinc-950">
                <div className="flex items-center h-12">
                    <Link to="/preferences">
                        <div className="px-3">
                            <ChevronLeft />
                        </div>
                    </Link>
                    <h1 className="text-lg font-semibold">Data and Sharing</h1>
                </div>
                <Separator />
            </div>
            <div className="m-3 space-y-4">
                <div className="flex flex-row items-center justify-between p-5 border rounded-lg border-zinc-800">
                    <div className="space-y-0.5 mr-4">
                        <div className="font-semibold">Share your findings with Slime</div>
                        <div className="text-sm opacity-75">
                            This enables you to share to with others coupons you find automatically and anonymously.
                        </div>
                    </div>
                    <Switch />
                </div>
            </div>
        </div>
    );
}