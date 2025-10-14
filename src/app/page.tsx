"use client";
import Hero from "@/components/Hero";
import Header from "@/components/Header";

const MeDINALandingPage: React.FC = () => {
	return (
		<div className="min-h-screen bg-white relative">
			{/* Grid and Dot Background */}

			<div className="absolute inset-0 opacity-30" />
			<Hero />
		</div>
	);
};

export default MeDINALandingPage;
