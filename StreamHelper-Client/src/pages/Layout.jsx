import { Outlet } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function Layout() {
    return (
        <>
            <Navigation/>
            <main className="px-[clamp(1em,3vw,2em)]">
                <Outlet/>
            </main>
        </>
    )
}