"use client"

import Script from "next/script";
import { use, useEffect, useState } from "react";

interface TableauEmbedServerProps {
	viewUrl: string;
	height?: string;
	width?: string;
	hideTabs?: boolean;
	hideToolbar?: boolean;
	device?: "default" | "desktop" | "tablet" | "phone";
}

function TableauEmbedServer({
	viewUrl,
	height = "600px",
	width = "100%",
	hideTabs = false,
	hideToolbar = false,
	device = "default",
}: TableauEmbedServerProps) {

	const [ticket, setTicket] = useState<string>("");

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

	if (!ticket) {
		return <div>Loading Tableau Dashboard...</div>;
	}

	const trustedUrl = `${ticket}/views/${viewUrl}?:embed=yes&:toolbar=${
		hideToolbar ? "no" : "yes"
	}&:tabs=${hideTabs ? "no" : "yes"}&:device=${device}`;
	console.log("TableauEmbedServer trustedUrl:", trustedUrl);

	return (
		<>
			<Script
				type="module"
				src={`http://100.83.250.224:8080/javascripts/api/tableau.embedding.3.latest.min.js`}
				strategy="lazyOnload"
			/>
			{trustedUrl && <div>
				{/* @ts-ignore */}
				<tableau-viz
					id="tableauViz"
					src={trustedUrl}
					height={height}
					width={width}
					device={device}
					toolbar={hideToolbar ? "hidden" : "bottom"}
					hide-tabs={hideTabs ? "" : undefined}
				>
					{/* @ts-ignore */}
				</tableau-viz>
			</div>}
			
		</>
	);
}

export default TableauEmbedServer;
