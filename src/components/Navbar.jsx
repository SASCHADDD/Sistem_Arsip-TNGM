import { Link } from "react-router-dom";
import logo from "../assets/logo-tngm.png";

const Navbar = () => {
    return (
        <nav className="w-full py-4 px-6 md:px-12 sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300">
            <div className="flex items-center gap-5">
                <Link to="/" className="group flex items-center gap-3">
                    <img
                        src={logo}
                        alt="Logo TNGM"
                        className="h-12 md:h-14 w-auto drop-shadow-md group-hover:rotate-[10deg] transition-all duration-500"
                    />
                    <div className="h-8 w-px bg-slate-200/60 hidden sm:block"></div>
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-green-950 font-graduate hidden sm:block">
                        SISTEM ARSIP
                    </h1>
                </Link>
            </div>

            <div className="flex items-center gap-8 mt-4 md:mt-0">
                <div className="flex items-center gap-6">
                    <a href="#internal" className="relative text-[11px] font-black text-black hover:text-green-700 transition-colors uppercase tracking-[0.15em] group">
                        Internal
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
                    </a>
                    <a href="#eksternal" className="relative text-[11px] font-black text-black hover:text-green-700 transition-colors uppercase tracking-[0.15em] group">
                        Eksternal
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
                    </a>
                    <a href="#mitra" className="relative text-[11px] font-black text-black hover:text-green-700 transition-colors uppercase tracking-[0.15em] group">
                        Mitra
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
