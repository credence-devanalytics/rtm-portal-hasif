import { cn } from "@/lib/utils";
import React from "react";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";

export default function GridBackgroundDemo() {
  return (
    <AuroraBackground>
      {/* Content overlay */}
      <main className="relative pt-16 z-10">
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Title */}

            <h1 className="text-4xl sm:text-2xl md:text-3xl lg:text-5xl font-bold mb-8 animate-fade-in-up">
              <span className="text-white block mb-2 drop-shadow-lg">
                Media Data Insight and Analytics
              </span>

              <span
                className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent drop-shadow-lg"
                style={{ color: "#E58A37" }}
              >
                (MeDINA)
              </span>
              <h6 className="text-lg font-semibold mb-4 pt-5 animate-fade-in-up text-white drop-shadow-lg">
                Platform Analitik Media RTM - menghubungkan data, analisis,{" "}
                <br /> dan pandangan untuk keputusan lebih pantas dan tepat.
              </h6>
            </h1>

            {/* CTA Button */}
            <button className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold py-4 px-8 rounded-lg text-lg inline-flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 animate-fade-in-up animation-delay-600">
              <span>Get Started</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </div>
        </section>
      </main>

      {/* Optional overlay for better text readability */}
      <div className="pointer-events-none absolute inset-0 bg-black/20 z-[1]"></div>
    </AuroraBackground>
  );
}
