import { useNavigate } from "react-router-dom"
import { InteractiveHoverButton } from "./InteractiveHoverButton"
import logo from "../assets/logo-tngm.png"

export const MenuCard = ({ title, description, path }) => {
    const navigate = useNavigate()

    return (
        <div className="bg-white rounded-4xl p-10 flex flex-col items-center border border-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] group/card">
            {/* Top Content: Logo & Text */}
            <div className="flex flex-col items-center text-center w-full">
                <div className="relative mb-10">
                    <div className="absolute -inset-4 bg-green-50 rounded-full blur-xl scale-0 group-hover/card:scale-100 transition-transform duration-700"></div>
                    <img src={logo} alt="Logo" className="relative h-20 w-auto object-contain transition-transform duration-700 group-hover/card:scale-110" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900 font-graduate tracking-wide">{title}</h3>
                    <p className="text-sm text-slate-400 font-semibold leading-relaxed px-2 uppercase tracking-widest">
                        {description}
                    </p>
                </div>
            </div>

            {/* Bottom Content: Button */}
            <div className="w-full mt-8">
                <InteractiveHoverButton
                    className="w-full"
                    onClick={() => navigate(path)}
                >
                    {title}
                </InteractiveHoverButton>
            </div>
        </div>
    )
}
