"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 dark:bg-zinc-900",
          className
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
        >
          <div
            className={cn(
              `animate-aurora pointer-events-none absolute -inset-[10px] opacity-30 blur-[20px] will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
            )}
            style={{
              backgroundImage: "repeating-linear-gradient(100deg, #FD9B27 10%, #47578F 15%, #FAD910 20%, #FD9B27 25%, #47578F 30%)",
              backgroundSize: "300% 200%",
            }}
          ></div>
          <div
            className={cn(
              `animate-aurora pointer-events-none absolute -inset-[10px] opacity-20 blur-[40px] will-change-transform`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`
            )}
            style={{
              backgroundImage: "repeating-linear-gradient(-45deg, #FAD910 0%, #FD9B27 25%, #47578F 50%, #FAD910 75%, #FD9B27 100%)",
              backgroundSize: "400% 300%",
              animationDelay: "-20s",
            }}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
