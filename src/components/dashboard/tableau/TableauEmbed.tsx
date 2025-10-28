"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface TableauEmbedProps {
	src: string;
	height?: string;
	width?: string;
	hideTabs?: boolean;
	hideToolbar?: boolean;
	device?: "default" | "desktop" | "tablet" | "phone";
}

function TableauEmbed({
	src,
	height = "600px",
	width = "100%",
	hideTabs = false,
	hideToolbar = false,
	device = "default",
}: TableauEmbedProps) {
	const vizRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (vizRef.current) {
			const viz = vizRef.current.querySelector("tableau-viz");
			if (viz) {
				viz.setAttribute("src", src);
				viz.setAttribute("height", height);
				viz.setAttribute("width", width);
				if (hideTabs) viz.setAttribute("hide-tabs", "");
				if (hideToolbar) viz.setAttribute("toolbar", "hidden");
				viz.setAttribute("device", device);
			}
		}
	}, [src, height, width, hideTabs, hideToolbar, device]);

	return (
		<>
			<Script
				type="module"
				src={`${process.env.TABLEAU_SERVER_URL}/javascripts/api/tableau.embedding.3.latest.min.js`}
				strategy="lazyOnload"
			/>
			<div ref={vizRef}>
				{/* @ts-ignore */}
				<tableau-viz id="tableauViz"></tableau-viz>
			</div>
		</>
	);
}
export default TableauEmbed;
