"use client";

import React from "react";
import Image from "next/image";

interface MedinaLogoProps {
	size?: "sm" | "md" | "lg" | "x-lg";
	variant?: "full" | "compact";
	className?: string;
}

const MedinaLogo: React.FC<MedinaLogoProps> = ({
	size = "md",
	variant = "full",
	className = "",
}) => {
	const sizeConfig = {
		sm: { width: 80, height: 27 },
		md: { width: 120, height: 40 },
		lg: { width: 180, height: 60 },
		"x-lg": { width: 500, height: 500 },
	};

	const config = sizeConfig[size];

	return (
		<div className={`relative ${className}`}>
			<Image
				src="/medina-logo/Logo-RTM-Teman-Setia-Anda-2021.png"
				alt="RTM Teman Setia Anda 2021"
				width={150}
				height={150}
				className="absolute left-120 top-32"
			/>
			<Image
				src="/medina-logo/M.png"
				alt="Medina Logo"
				width={config.width}
				height={config.height}
				className="absolute left-0"
			/>
			<h1 className="font-fredoka font-[600] text-[12rem] text-[#455893] absolute left-120 top-45">
				<span className="text-[#e74922]">e</span>DINA
			</h1>
		</div>
	);
};

export default MedinaLogo;
