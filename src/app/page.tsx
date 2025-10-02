"use client";
import React, { useState, useEffect } from "react";
import GridBackgroundDemo from "@/components/DottedBackground";
import Header from "@/components/Header";

const MeDINALandingPage: React.FC = () => {
	return (
		<div className="min-h-screen bg-white relative">
			{/* Grid and Dot Background */}

			<div className="absolute inset-0 opacity-30" />
			<GridBackgroundDemo />

			{/* Content */}
			<Header />
		</div>
	);
};

export default MeDINALandingPage;
