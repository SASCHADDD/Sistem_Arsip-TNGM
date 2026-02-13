import logo from "../assets/logo-tngm.png";

const Navbar = () => {
    return (
        <nav className="w-full py-6 px-4 relative flex justify-center items-center">
            <img
                src={logo}
                alt="Logo TNGM"
                className="absolute left-4 md:left-12 h-16 md:h-20 w-auto drop-shadow-lg"
            />
            <h1 className="text-3xl md:text-5xl font-normal tracking-wide text-white text-center font-graduate">
                SISTEM ARSIP
            </h1>
        </nav>
    );
};

export default Navbar;
