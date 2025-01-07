import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { Button } from "./components/ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "./components/ui/drawer";
import { Input } from "./components/ui/input";

export default function App() {

  if (chrome?.management != null) {
    chrome.management.getSelf(result => {
      // dev env
      if (result.installType === "development") {
        return;
      }
      // prod env
    });
  }

  return (
    <div className='flex flex-col items-center justify-center h-full'>
      <div className="w-full p-4" style={{ background: "rgb(0 0 0 / 75%) url(./slime.jpg)", backgroundBlendMode: "darken" }}>
        <div className="flex items-center gap-4">
          <img src="./happy.png" className="h-12" />
          <div>
            <h1 className='text-3xl text-white'>Slime</h1>
            <h2 className='text-xs'>A open source coupon discovery plugin.</h2>
          </div>
          <div className="ml-auto">
            +
          </div>
        </div>
      </div>
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
      <Drawer>
        <DrawerTrigger asChild>
          <div className="flex w-full py-2 bg-stone-900">
            <button className='flex-1 p-2 mx-8 my-2 border-2 rounded-md cursor-pointer border-zinc-700'>
              Report Coupon
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
    </div>
  )
}

