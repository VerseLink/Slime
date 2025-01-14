import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Clock, Flag, Share, Share2, TicketCheck, Users, Info, Gift, Copy } from "lucide-react";
import { HoverTooltip } from "../../components/HoverTooltip";

export type RedeemCodeContent = {
    code: string;
    rating?: number;
    used?: number;
    expireAt?: Date;
    content?: string[];
}

export function RedeemCode(args: RedeemCodeContent & { onRead?: (args: RedeemCodeContent) => void }) {
    const [isCopied, setIsCopied] = useState<number | null>(null);
    const [selfRating, setSelfRating] = useState(0);

    const giveRating = async (like: boolean) => {
        if (like && selfRating > 0) {
            setSelfRating(0);
            // TODO: cancel rating here
            return;
        }
        if (!like && selfRating < 0) {
            setSelfRating(0);
            // TODO: cancel rating here
            return;
        }
        setSelfRating(like ? 1 : -1);
        // call the api here
    }

    const copyRedeemCode = async() => {
        if (isCopied)
            clearTimeout(isCopied);
        setIsCopied(setTimeout(() => { setIsCopied(null) }, 3000) as unknown as number);
        await navigator.clipboard.writeText(args.code);
        args.onRead?.(args);
        // send signals?
    }

    return (
        <div className="m-3 mt-1 border rounded-xl border-zinc-800">
            <div className="py-1 my-1 ml-4 mr-2 cursor-pointer" onClick={() => copyRedeemCode()}>
                <div className="grid grid-cols-11">
                    <div className="col-span-6 text-xs">
                        <div className="flex items-center mt-1 mb-1 font-bold text-zinc-400">
                            <Gift strokeWidth={2} className="w-4 mr-1" />
                            {i18n.t("card.redeem_code")}
                        </div>
                        <div className="flex col-span-6 pr-1 border-dashed rounded-md border-zinc-700 h-fit">
                            <div className="overflow-hidden text-lg font-semibold text-ellipsis whitespace-nowrap">
                                {args.code}
                            </div>
                            <HoverTooltip tip={!isCopied ? i18n.t("card.copy") : i18n.t("card.copied")}>
                                <div className="flex items-center justify-center ml-auto cursor-pointer">
                                    <Copy className="mr-1 text-zinc-500" size={18} />
                                </div>
                            </HoverTooltip>
                        </div>
                        <div className="flex mt-2 text-xs font-semibold text-zinc-500">
                            <div className="flex gap-1.5 items-center">
                                {
                                    args.expireAt ?
                                        <>
                                            <Clock className="w-4 text-zinc-600" /> {i18n.t("card.expires_at")} {args.expireAt.toLocaleDateString()}
                                        </> :
                                        <div></div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-span-5 my-1 ml-3 border-l-2 border-dashed border-zinc-800 text-zinc-300">
                        <div className="relative flex flex-col h-full ml-3 text-sm">
                            <ul className={`line-clamp-6 transition-colors duration-200 ${isCopied ? "text-zinc-800" : " text-zinc-500"}`}>
                                {
                                    args.content?.map(content => (
                                        <>
                                            <li key={content}>
                                                {content}
                                            </li>
                                        </>
                                    ))
                                }
                            </ul>
                            <div className={`absolute w-full h-full transition-opacity duration-200 ${isCopied ? "opacity-100" : "opacity-0"}`}>
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-xl font-bold">{i18n.t("card.copied")}!</div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center px-3 py-1 text-xs rounded-b-xl bg-zinc-900 text-zinc-400">
                <div className="flex items-center">
                    <div className="cursor-pointer" onClick={() => giveRating(true)}>
                        <ThumbsUp className={`h-4 ${selfRating > 0 ? "fill-zinc-400" : ""}`} />
                    </div>
                    <div className="w-8 font-bold text-center">
                        {(args.rating ?? 0) + selfRating}
                    </div>
                    <div className="cursor-pointer" onClick={() => giveRating(false)}>
                        <ThumbsDown className={`h-4 ${selfRating < 0 ? "fill-zinc-400" : ""}`} />
                    </div>
                </div>
                <div className="flex items-center gap-1 ml-auto text-zinc-500">
                    {
                        args.used &&
                        <>
                            <TicketCheck className="w-4" />
                            <div className="font-bold">{args.used ? i18n.t("card.code_used", [args.used]) : ""}</div>
                            <Separator className="h-3 mx-1 bg-zinc-500" orientation="vertical" />
                        </>
                    }
                    <HoverTooltip tip={i18n.t("card.this_code_is_reported_by_the_community")}>
                        <div className="flex items-center gap-1 font-bold cursor-default">
                            <Info className="w-4" />
                            <div className="ml-auto text-xs">{i18n.t("card.community")}</div>
                        </div>
                    </HoverTooltip>
                    <Separator className="h-3 mx-1 bg-zinc-500" orientation="vertical" />
                    <HoverTooltip tip={i18n.t("card.share")}>
                        <Share2 className="w-4 " />
                    </HoverTooltip>
                    <HoverTooltip tip={i18n.t("card.report")}>
                        <Flag className="w-4" />
                    </HoverTooltip>
                </div>
            </div>
        </div>
    );
}