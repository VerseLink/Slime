import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReactNode } from "react";

export function HoverTooltip(args: { tip: ReactNode, children: ReactNode }) {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    {args.children}
                </TooltipTrigger>
                <TooltipContent>
                    <>{args.tip}</>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}