import { Link } from "react-router-dom";
import logo from "../assets/logo-tngm.png";

const Navbar = () => {
    return (
        <nav className="w-full py-5 px-4 sticky top-0 z-50 flex justify-center items-center bg-white/80 backdrop-blur-md border-b-2 border-slate-200 border-b-[#D4BB76] shadow-sm">
            <Link to="/" className="absolute left-4 md:left-12">
                <img
                    src={logo}
                    alt="Logo TNGM"
                    className="h-16 md:h-20 w-auto drop-shadow-lg cursor-pointer hover:scale-105 transition-transform"
                />
            </Link>

            <h1 className="text-3xl md:text-5xl font-normal tracking-wide text-green-900 text-center font-graduate">
                SISTEM ARSIP
            </h1>
        </nav>
    );
};

export default Navbar;
