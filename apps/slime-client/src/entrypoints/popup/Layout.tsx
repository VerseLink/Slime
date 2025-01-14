import { Outlet } from "react-router";
import { HeaderBanner } from "./HeaderBanner";

export function Layout() {
    return (
        <div className='flex flex-col h-full overflow-hidden'>
            <HeaderBanner/>
            <Outlet/>
        </div>
    )
}