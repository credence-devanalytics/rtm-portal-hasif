"use client";

import React from "react";
import Image from "next/image";

interface MedinaLogoProps {
	size?: "icon" | "sm" | "md" | "lg" | "x-lg";
	variant?: "full" | "compact";
	className?: string;
}

const MedinaLogo: React.FC<MedinaLogoProps> = ({
	size = "md",
	className = "",
}) => {
	// Base sizes for each variant - M logo serves as the primary container
	const baseSizes = {
		icon: 32,
		sm: 60,
		md: 120,
		lg: 180,
		"x-lg": 500,
	};

	// Mathematical constants based on original 500px layout
	const RTM_TO_M_RATIO = 0.3; // RTM logo is 30% of M logo size
	const RTM_X_RATIO = 0.96; // RTM positioned at 96% of M width
	const RTM_Y_RATIO = 0.256; // RTM positioned at 25.6% of M height
	const TEXT_X_RATIO = 0.944; // Text positioned at 94.4% of M width
	const TEXT_Y_RATIO = 0.36; // Text positioned at 36% of M height
	const BASE_FONT_SIZE_REM = 12; // Original 12rem font at 500px size

	const mSize = baseSizes[size];

	// Calculate all dimensions mathematically
	const config = {
		width: mSize,
		height: mSize,
		rtmWidth: mSize * RTM_TO_M_RATIO,
		rtmHeight: mSize * RTM_TO_M_RATIO,
		mWidth: mSize,
		mHeight: mSize,
		fontSize: BASE_FONT_SIZE_REM * (mSize / 500),
		rtmLeft: mSize * RTM_X_RATIO,
		rtmTop: mSize * RTM_Y_RATIO,
		mLeft: 0,
		mTop: 0,
		textLeft: mSize * TEXT_X_RATIO,
		textTop: mSize * TEXT_Y_RATIO,
	};

	return (
		<div
			className={`relative ${className}`}
			style={{
				width: `${config.width}px`,
				height: `${config.height}px`,
			}}
		>
			<Image
				src="/medina-logo/Logo-RTM-Teman-Setia-Anda-2021.png"
				alt="RTM Teman Setia Anda 2021"
				width={config.rtmWidth}
				height={config.rtmHeight}
				className="absolute"
				style={{
					left: `${config.rtmLeft}px`,
					top: `${config.rtmTop}px`,
				}}
			/>
			<Image
				src="/medina-logo/M.png"
				alt="Medina Logo"
				width={config.mWidth}
				height={config.mHeight}
				className="absolute"
				style={{
					left: `${config.mLeft}px`,
					top: `${config.mTop}px`,
				}}
			/>
			<h1
				className="font-fredoka font-[600] text-[#455893] absolute"
				style={{
					fontSize: `${config.fontSize}rem`,
					left: `${config.textLeft}px`,
					top: `${config.textTop}px`,
				}}
			>
				<span className="text-[#e74922]">e</span>DINA
			</h1>
		</div>
	);
};

export default MedinaLogo;
