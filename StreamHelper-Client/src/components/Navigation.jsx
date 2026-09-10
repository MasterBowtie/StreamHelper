import { NavLink } from "react-router-dom";


export default function Navigation() {
    return (
        <nav className="flex p-4 bg-green-900 text-white justify-between">
            <h1 className="pl-4 font-bold tracking-[.07em]">Stream Helper</h1>
            <div className="flex gap-4 text-center justify-center p-2">
                <NavLink to={"/"} className={({ isActive }) => isActive? "font-bold text-green-500 pointer-events-none": "text-grey-300 hover:font-bold"}>
                    Dashboard
                </NavLink>
                <NavLink to={"/settings"} className={({ isActive }) => isActive? "font-bold text-green-500 pointer-events-none": "text-grey-300 hover:font-bold"}>
                    Settings
                </NavLink>
                {/* TODO: Make Dropdown Menu */}
                <label>Widgets</label>
                <div className="dropdown">
                    <NavLink to={"/widgets/draw"} className={({ isActive }) => isActive? "font-bold text-green-500 pointer-events-none": "text-grey-300 hover:font-bold"}>Draw</NavLink>
                    <NavLink to={"/widgets/vote"} className={({ isActive }) => isActive? "font-bold text-green-500 pointer-events-none": "text-grey-300 hover:font-bold"}>Vote</NavLink>
                </div>
                    
            </div>
        </nav>
    )
}