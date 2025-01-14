import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTag } from "@fortawesome/free-solid-svg-icons";
import { InfoIcon, RotateCw, TimerReset } from "lucide-react";
import { HoverTooltip } from "@/components/HoverTooltip";
import { RedeemCode } from "../RedeemCode";
import { ReactNode } from "react";
import { Link } from "react-router";
import { Separator } from "@/components/ui/separator";

export default function Index() {
  const Pill = (args: { children: ReactNode, active?: boolean }) => {
    if (args.active)
      return (
        <button className="p-1.5 px-2.5 border rounded-lg border-zinc-800 bg-zinc-300 text-zinc-800">{args.children}</button>
      );
    return (
      <button className="p-1.5 px-2.5 border rounded-lg border-zinc-800 text-zinc-300">{args.children}</button>
    )
  };

  return (
    <>
      <SiteNotSupported />
      <div className="flex w-full gap-2 px-3 my-3 text-xs font-bold">
        <Pill active>{i18n.t("code.featured")}</Pill>
        <Pill>{i18n.t("code.unverified")}</Pill>
        <div className="flex items-center gap-0.5 ml-auto text-xs font-normal">
          <HoverTooltip tip={i18n.t("code.refresh")}>
            <div className="p-1.5 cursor-pointer rounded-lg border-zinc-800">
              <RotateCw size={18} />
            </div>
          </HoverTooltip>
          <HoverTooltip tip={i18n.t("code.revert_viewed")}>
            <div className="p-1.5 cursor-pointer rounded-lg border-zinc-800">
              <TimerReset size={18} />
            </div>
          </HoverTooltip>
        </div>
      </div>
      <div className="flex flex-col w-full flex-1 overflow-x-hidden overflow-y-scroll scroll-smooth [scrollbar-width:thin] [scrollbar-gutter:stable]">
        <RedeemCode code="BUGUBIRD2025" rating={100} used={200} expireAt={new Date("2024-12-12")} content={["Jade * 100", "星際通用幣 * 2200", "Credit * 2200", "Credit * 2200"]} />
        <RedeemCode code="BUGUBIRD2025" rating={100} used={1000} content={["Jade * 100", "Credit * 2200"]} />
        <NoCouponFound />
      </div>
      <div className="flex items-center justify-center w-full gap-2 px-2 py-2 border-t border-zinc-800 bg-zinc-900">
        <ReportFooter />
      </div>
    </>
  )
}

export function SiteNotSupported() {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="flex flex-col w-full px-3 py-2 text-sm justify-stretch bg-slate-900">
      <div className="flex items-center w-full gap-3">
        <InfoIcon size={20} />
        <div className="">
          {i18n.t("applying_code_manually_is_required")}
        </div>
        <div className="flex items-center gap-1 p-1 px-3 ml-auto border rounded-lg cursor-pointer text-nowrap border-zinc-600" onClick={() => {setIsExpanded(value => !value)}}>
          {i18n.t("more_info")}
        </div>
      </div>
      <div className={`transition-[height] ${isExpanded ? "h-auto visible" : "h-0 invisible"}`}>
        <div className="mt-2">
          <Separator />
          <div className="m-2">
            We don't support this website for automatically applying coupons already
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportFooter() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className='flex items-center justify-center gap-2 px-4 py-2 my-1 text-sm border rounded-md cursor-pointer border-zinc-700'>
          <FontAwesomeIcon className="text-lg text-zinc-400" icon={faTag} />
          {
            i18n.t("reportCouponOrRedeemCode")
          }
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Report Coupon</DrawerTitle>
          <DrawerDescription>Report a valid coupon for this website</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-1.5 px-4 text-sm">
          <Input className="text-sm" placeholder="Coupon Code" />
          <div className="flex gap-1.5">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">By Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input className="text-sm" placeholder="Discount %" />
          </div>
        </div>
        <DrawerFooter>
          <Button>Submit</Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function NoCouponFound() {
  return (
    <div className="flex-1 my-4">
      <div className="flex flex-col items-center justify-center h-full gap-2 text-zinc-500">
        <div>
          <img className="h-24" src="empty-box.png" />
        </div>
        <div>
          No coupon found on this website
        </div>
      </div>
    </div>
  );
}
