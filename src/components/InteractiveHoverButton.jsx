import React from "react";
import { ArrowRight } from "lucide-react";

export const InteractiveHoverButton = React.forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        style={{
          backgroundColor: "rgba(212, 187, 118, 1)"
        }}
        className={`group relative w-auto cursor-pointer overflow-hidden rounded-full p-2 px-6 text-center font-semibold ${className}`}
        {...props}
      >
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#FFEFC3] transition-all duration-300 group-hover:scale-[100.8]"></div>
          <span className="inline-block text-green-900 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            {children}
          </span>
        </div>
        <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-green-900 opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
          <span>{children}</span>
          <ArrowRight />
        </div>
      </button>
    );
  }
);

InteractiveHoverButton.displayName = "InteractiveHoverButton";