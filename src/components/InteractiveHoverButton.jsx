import React from "react";
import { ArrowRight } from "lucide-react";

export const InteractiveHoverButton = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`group relative w-auto cursor-pointer overflow-hidden rounded-full p-2 px-6 text-center font-bold bg-[#D4BB76] shadow-md transition-shadow hover:shadow-lg hover:shadow-[#D4BB76]/30 ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-white transition-all duration-300 group-hover:scale-[100.8]"></div>
          <span className="inline-block text-[#0F3D17] transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {children}
          </span>
        </div>
        <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-[#0F3D17] opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
          <span>{children}</span>
          <ArrowRight />
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";