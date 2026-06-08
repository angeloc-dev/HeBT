import type {ReactElement} from "react";
import {Link} from "react-router-dom";

function Navbar(): ReactElement {
    return (
        <nav className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-12 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 cursor-pointer">
                    <span className="font-logo text-2xl font-extrabold tracking-wide">HeBT</span>
                </Link>
                <ul className="flex space-x-8">
                    <li><Link to="/recipes" className="nav-link">Ricettario</Link></li>
                    <li><Link to="/shopping" className="nav-link">Spesa</Link></li>
                    <li><Link to="/pantry" className="nav-link">Dispensa</Link></li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;