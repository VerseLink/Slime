import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSadTear, faGift, faListCheck, faTag, faUser, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronRight, CircleEllipsis, CircleUserRound, EllipsisVertical, InfoIcon, Menu, Settings, Settings2, ThumbsDown, ThumbsUp, User, UserCircle, UserCircle2 } from "lucide-react";
import { RedeemCode } from "./RedeemCode";
import { HoverTooltip } from "./HoverTooltip";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function App() {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <HeaderBanner />
      <SiteNotSupported />
      <div className="flex w-full gap-2 px-3 my-3 text-xs font-bold">
        <button className="p-1.5 px-2.5 border rounded-lg border-zinc-800 bg-zinc-300 text-zinc-800">{i18n.t("code.featured")}</button>
        <button className="p-1.5 px-2.5 border rounded-lg border-zinc-800 text-zinc-300">{i18n.t("code.used")}</button>
        <button className="p-1.5 px-2.5 border rounded-lg border-zinc-800 text-zinc-300">{i18n.t("code.unverified")}</button>
      </div>
      <div className="flex flex-col w-full flex-1 overflow-x-hidden overflow-y-scroll scroll-smooth [scrollbar-width:thin] [scrollbar-gutter:stable]">
        <RedeemCode code="BUGUBIRD2025" rating={100} used={200} content={["Jade * 100", "星際通用幣 * 2200", "Credit * 2200", "Credit * 2200"]} />
        <RedeemCode code="BUGUBIRD2025" rating={100} used={1000} content={["Jade * 100", "Credit * 2200"]} />
        <NoCouponFound />
      </div>
      <div className="flex items-center justify-center w-full gap-2 px-2 py-2 border-t border-zinc-800 bg-zinc-900">
        <ReportFooter />
      </div>
    </div>
  )
}

export function HeaderBanner() {
  return (
    <div className="w-full py-2.5" style={{ background: "rgb(0 0 0 / 75%) url(./slime.jpg)", backgroundBlendMode: "darken" }}>
      <div className="flex items-center">
        <div className="flex items-center gap-3 pl-4">
          <img src="./widget/happy.png" className="h-8" />
          <h1 className='text-2xl leading-tight text-white'>Slime</h1>
          <Separator orientation="vertical" className="h-6 bg-stone-400" />
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
            <div className="pl-2 cursor-pointer">
              <EllipsisVertical className="h-5" strokeWidth={1.5} />
            </div>
          </HoverTooltip>
        </div>
      </div>
    </div>
  );
}

export function SiteNotSupported() {
  return (
    <div className="flex items-center w-full gap-2 px-3 py-2 justify-stretch bg-slate-900">
      <div className="flex items-center w-full gap-3 text-sm">
        <InfoIcon size={20} />
        <div className="">
          {i18n.t("applying_code_manually_is_required")}
        </div>
        <div className="flex items-center gap-1 p-1 px-3 ml-auto border rounded-lg text-nowrap border-zinc-600">
          {i18n.t("more_info")}
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
