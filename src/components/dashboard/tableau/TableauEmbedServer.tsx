"use client"

import { Monitor } from "lucide-react";
import Script from "next/script";
import { use, useEffect, useState } from "react";

interface TableauEmbedServerProps {
	viewUrl: string;
	height?: string;
	width?: string;
	hideTabs?: boolean;
	hideToolbar?: boolean;
	device?: "default" | "desktop" | "tablet" | "phone";
	aspectRatio?: number; // Optional: custom aspect ratio (width/height)
}

function TableauEmbedServer({
	viewUrl,
	height = "900px",
	width = "100%",
	hideTabs = false,
	hideToolbar = false,
	device = "default",
	aspectRatio = 16/9, // Default 16:9 aspect ratio
}: TableauEmbedServerProps) {

	const [ticket, setTicket] = useState<string>("");
	const [calculatedHeight, setCalculatedHeight] = useState<string>(height);
	const [containerWidth, setContainerWidth] = useState<number>(0);

	useEffect(() => {
		// Fetch the Tableau ticket from the API route
		const fetchTicket = async () => {
			const response = await fetch("/api/tableau/get-tableau-ticket", {
				method: "POST",
				cache: "no-store",
			});
			const { ticket } = await response.json();
			setTicket(ticket);
		};
		fetchTicket();
	}, []);

	useEffect(() => {
		// Get container width for responsive calculations
		const updateContainerWidth = () => {
			const container = document.getElementById('tableauViz')?.parentElement;
			if (container) {
				setContainerWidth(container.clientWidth);
			}
		};

		updateContainerWidth();
		window.addEventListener('resize', updateContainerWidth);
		return () => window.removeEventListener('resize', updateContainerWidth);
	}, [ticket]);

	useEffect(() => {
		// Calculate responsive height based on aspect ratio
		if (containerWidth > 0) {
			// Use the provided aspect ratio or default to 16:9
			const newHeight = Math.round(containerWidth / aspectRatio);
			
			// Set minimum and maximum height constraints
			const minHeight = 600;
			const maxHeight = 2000;
			const constrainedHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));
			
			console.log('Container width:', containerWidth);
			console.log('Calculated height:', constrainedHeight);
			
			setCalculatedHeight(`${constrainedHeight}px`);
		}
	}, [containerWidth]);

	useEffect(() => {
		// Optional: Listen for Tableau viz events to get actual dimensions
		const handleVizLoad = () => {
			const vizElement = document.getElementById('tableauViz') as any;
			if (vizElement && vizElement.viz) {
				try {
					const viz = vizElement.viz;
					// You can add additional logic here to get actual viz dimensions
					// and adjust if needed
					console.log('Tableau viz loaded');
				} catch (error) {
					console.log('Could not access Tableau viz object:', error);
				}
			}
		};

		if (ticket) {
			// Small delay to ensure viz is initialized
			const timer = setTimeout(handleVizLoad, 2000);
			return () => clearTimeout(timer);
		}
	}, [ticket]);

	if (!ticket) {
		return (
		/* No Data State */
		<div className="flex flex-col items-center justify-center py-8 space-y-3">
		<div className="p-3 rounded-full bg-gray-50 border border-gray-200">
			<Monitor className="h-6 w-6 text-gray-400" />
		</div>
		<div className="text-center">
			<p className="text-gray-500 font-medium text-sm">
			More data coming soon
			</p>
			<p className="text-gray-400 text-xs mt-1">
			Check back later for updates
			</p>
		</div>
		</div>
		)
	}

	const trustedUrl = `${ticket}/views/${viewUrl}?:embed=yes&:toolbar=${
		hideToolbar ? "no" : "yes"
	}&:tabs=${hideTabs ? "no" : "yes"}&:device=${device}`;
	console.log("TableauEmbedServer trustedUrl:", trustedUrl);

	return (
		<>
			<Script
				type="module"
				src={`https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js`}
				strategy="lazyOnload"
			/>
			{trustedUrl && <div style={{ width: '100%', overflow: 'hidden' }}>
				{/* @ts-ignore */}
				<tableau-viz
					id="tableauViz"
					src={trustedUrl}
					height={calculatedHeight}
					width="100%"
					device={device}
					toolbar={hideToolbar ? "hidden" : "bottom"}
					hide-tabs={hideTabs ? "" : undefined}
				/>
			</div>}
			
		</>
	);
}

export default TableauEmbedServer;
