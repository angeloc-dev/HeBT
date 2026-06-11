import { type ReactElement, useState } from "react";
import {FiMenu, FiX} from "react-icons/fi";
import { Link, NavLink } from "react-router-dom";

function Navbar(): ReactElement {
    const [mobileSidebarIsOpen, setMobileSidebarIsOpen] = useState<boolean>(false);

    const closeMobileMenu = () => setMobileSidebarIsOpen(false);

    return (
        <nav className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-[100]">
            <div className="container relative mx-auto px-4 md:h-12 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 cursor-pointer" onClick={closeMobileMenu}>
                    <span className="font-logo text-2xl font-extrabold tracking-wide text-foreground">HeBT</span>
                </Link>
                <ul className="md:space-x-8 hidden md:flex">
                    <li><NavLink to="/" className="nav-link">Home</NavLink></li>
                    <li><NavLink to="/recipes" className="nav-link">Ricettario</NavLink></li>
                    <li><NavLink to="/planner" className="nav-link">Planner</NavLink></li>
                    <li><NavLink to="/pantry" className="nav-link">Dispensa</NavLink></li>
                </ul>
                <button
                    className="md:hidden p-2 -mr-2 transition-transform active:scale-95 text-foreground cursor-pointer"
                    onClick={() => setMobileSidebarIsOpen(!mobileSidebarIsOpen)}
                    aria-label="Toggle Menu"
                >
                    {mobileSidebarIsOpen ? <FiX className="w-6 h-6 duration-200" /> : <FiMenu className="w-6 h-6 duration-200" />}
                </button>
                {mobileSidebarIsOpen && (
                    <div className="absolute top-[calc(100%+5px)] left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="px-5 py-6">
                            <ul className="flex flex-col space-y-6">
                                <li>
                                    <NavLink to="/" className="block nav-link w-fit text-lg" onClick={closeMobileMenu}>
                                        Home
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/recipes" className="block nav-link w-fit text-lg" onClick={closeMobileMenu}>
                                        Ricettario
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/planner" className="block nav-link w-fit text-lg" onClick={closeMobileMenu}>
                                        Planner
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/pantry" className="block nav-link w-fit text-lg" onClick={closeMobileMenu}>
                                        Dispensa
                                    </NavLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;