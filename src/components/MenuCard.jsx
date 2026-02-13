import { useNavigate } from "react-router-dom"
import { InteractiveHoverButton } from "./InteractiveHoverButton"
import logo from "../assets/logo-tngm.png"

export const MenuCard = ({ title, description, path }) => {
    const navigate = useNavigate()

    return (
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center h-125 border border-white/20 shadow-xl transition-transform hover:scale-103 duration-500">
            {/* Top Content: Logo & Text */}
            <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
                <img src={logo} alt="Logo" className="h-24 w-auto object-contain mb-6" />
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-green-800 font-graduate tracking-wide">{title}</h3>
                    <p className="text-green-700/80 font-medium leading-relaxed px-4">
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
