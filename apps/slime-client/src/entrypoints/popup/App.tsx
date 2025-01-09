import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceSadTear, faGift, faListCheck, faTag } from "@fortawesome/free-solid-svg-icons";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { faClipboard } from "@fortawesome/free-regular-svg-icons";

export default function App() {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <HeaderBanner />
      <SiteNotSupported />
      <div className="w-full overflow-x-hidden overflow-y-scroll">
        <RedeemCode code="BUGUBIRDYES" rating={100} content={["Jade * 100", "Credit * 2200"]} />
        <RedeemCode code="BUGUBIRD2025" rating={100} content={["Jade * 100", "Credit * 2200"]} />
        <NoCouponFound />
      </div>
      <ReportFooter />
    </div>
  )
}

export function HeaderBanner() {
  return (
    <div className="w-full p-4" style={{ background: "rgb(0 0 0 / 75%) url(./slime.jpg)", backgroundBlendMode: "darken" }}>
      <div className="flex items-center gap-4">
        <img src="./widget/happy.png" className="h-12" />
        <div>
          <h1 className='text-3xl text-white'>Slime</h1>
          <h2 className='text-xs'>A open source coupon discovery plugin.</h2>
        </div>
        <div className="ml-auto">
          +
        </div>
      </div>
    </div>
  );
}

export function SiteNotSupported() {
  return (
    <div className="px-4 py-3 bg-amber-950">
      <div className="flex items-center gap-4 pb-2">
        <FontAwesomeIcon className="text-2xl" icon={faFaceSadTear} />
        <div className="text-sm">
          We don't support auto coupon applying on this website yet, but you can help!
        </div>
      </div>
      <div className="flex justify-end gap-1 mt-1 text-sm">
        <button className="px-2 py-1 border rounded-md border-zinc-500"><FontAwesomeIcon icon={faListCheck} /> Request</button>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <button className="px-2 py-1 border rounded-md border-zinc-500">
                <FontAwesomeIcon icon={faGithub} /> Contribute
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Contribute on Github!
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export function ReportFooter() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex w-full py-2 bg-stone-900">
          <button className='flex items-center justify-center flex-1 gap-2 py-2 mx-8 my-1 text-sm border-2 rounded-md cursor-pointer border-zinc-700'>
            <FontAwesomeIcon className="text-lg text-zinc-400" icon={faTag} />
            {
              "Report Coupon or Redeem Code"
              //chrome.i18n.getMessage("reportCouponOrRedeemCode")
            }
          </button>
        </div>
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

export function RedeemCode(args: { rating?: number, content?: string[], code: string }) {
  return (
    <div className="px-4 py-1 m-3 bg-stone-900 rounded-xl">
      <div className="my-2 ml-1 text-sm">
        <FontAwesomeIcon className="mr-2" icon={faGift} />
        Redeem Code
      </div>
      <div className="flex items-center my-1 mb-3">
        <div className="flex flex-col flex-1">
          <div className="flex px-2 py-2 my-1 mr-2 border-2 border-dashed rounded-md border-stone-700">
            <div className="text-xl font-semibold">
              {args.code}
            </div>
            <div className="flex items-center ml-auto text-stone-500">
              <FontAwesomeIcon className="text-xl" icon={faClipboard} />
            </div>
          </div>
          <ul className="flex gap-3 px-1 pt-2 text-sm">
            {
              args.content?.map(content => (
                <li>{content}</li>
              ))
            }
          </ul>
        </div>
      </div>
      <div className="h-[1px] bg-stone-700"></div>
      <div className="flex items-center pb-3 mt-3 text-xs">
        <ThumbsUp className="h-4" />
        <div className="text-center w-9">
          {args.rating ?? ""}
        </div>
        <ThumbsDown className="h-4" />
        <div className="ml-auto text-xs">Provided by community</div>
      </div>
    </div>
  );
}