import { cn } from "@/lib/utils";
import React from "react";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";
import { Button } from "@/components/ui/button";

export default function GridBackgroundDemo() {
	return (
		<AuroraBackground>
			{/* Content overlay */}
			<main className="relative z-10">
				<section className="min-h-screen grid place-items-center px-4 sm:px-6 lg:px-8">
					<div className="text-left max-w-5xl justify-center flex flex-col gap-4">
						{/* Title */}
						<div>
							<h1 className="text-4xl sm:text-2xl md:text-3xl lg:text-7xl font-bold animate-fade-in-up">
								<span
									className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent block"
									// style={{ color: "#E58A37" }}
								>
									MeDINA
								</span>
							</h1>

							<h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold animate-fade-in-up text-black">
								Media Data Insight and Analytics
							</h2>
						</div>

						<p className="text-base sm:text-lg font-normal animate-fade-in-up text-gray-800">
							Analytical Platform for Media Data Insight and Analytics <br />{" "}
							for faster and more accurate decisions.
						</p>
						<div className="flex justify-start">
							{/* CTA Button */}
							<Button
								variant="default"
								size="lg"
								className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold rounded-lg text-md inline-flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 animate-fade-in-up animation-delay-600 shine-hover"
							>
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
							</Button>
						</div>
					</div>
				</section>
			</main>
		</AuroraBackground>
	);
}
