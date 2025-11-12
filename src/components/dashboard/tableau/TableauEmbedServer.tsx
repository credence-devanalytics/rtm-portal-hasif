"use client"

import { Button } from "@/components/ui/button";
import { ExternalLink, Monitor } from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { use, useEffect, useState } from "react";

interface TableauEmbedServerProps {
	viewUrl: string;
	height?: string;
	width?: string;
	hideTabs?: boolean;
	hideToolbar?: boolean;
	device?: "default" | "desktop" | "tablet" | "phone";
	username?: string;
}

function TableauEmbedServer({
	viewUrl,
	height = "900px",
	width = "100%",
	hideTabs = false,
	hideToolbar = false,
	device = "default",
	username,
}: TableauEmbedServerProps) {

	const [ticket, setTicket] = useState<string>("");
	const usernameParam = username==="superadmin" ? "dataops" : username;

	useEffect(() => {
		// Fetch the Tableau ticket from the API route
		const fetchTicket = async () => {
			const response = await fetch("/api/tableau/get-tableau-ticket", {
				method: "POST",
				cache: "no-store",
				body: JSON.stringify({ username:usernameParam })
			});
			const { ticket } = await response.json();
			setTicket(ticket);
		};
		fetchTicket();
	}, []);

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

	const trustedUrl = `${ticket}/views/${viewUrl}`;
	console.log("TableauEmbedServer trustedUrl:", trustedUrl);

	return (
		<div className="w-full">
			<Script
				type="module"
				src={`https://public.tableau.com/javascripts/api/tableau.embedding.3.latest.min.js`}
				strategy="lazyOnload"
			/>
			{trustedUrl && 
			<>
				<div className="w-full flex justify-center mt-2 mb-4">
					<span className="text-center leading-tight text-sm text-slate-600">
						<a href={trustedUrl} target="_blank" rel="noopener noreferrer" className="underline">Click here</a> 
						<span> if dashboard is not appearing.</span>
						<ExternalLink className="h-4 w-4 text-white flex-shrink-0" />
					</span>
				</div>
				<div style={{ width: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
					{/* @ts-ignore */}
					<tableau-viz
						id="tableauViz"
						src={trustedUrl}
						width="100%"
						device={device}
						toolbar={hideToolbar ? "hidden" : "bottom"}
						hide-tabs={hideTabs ? "" : undefined}
					/>
				</div>
			</>
			}
			
		</div>
	);
}

export default TableauEmbedServer;
