import Script from "next/script";

interface TableauEmbedServerProps {
	viewUrl: string;
	height?: string;
	width?: string;
	hideTabs?: boolean;
	hideToolbar?: boolean;
	device?: "default" | "desktop" | "tablet" | "phone";
}

async function TableauEmbedServer({
	viewUrl,
	height = "600px",
	width = "100%",
	hideTabs = false,
	hideToolbar = false,
	device = "default",
}: TableauEmbedServerProps) {
	// Fetch the Tableau ticket from the API route
	const response = await fetch("/api/get-tableau-ticket", {
		method: "POST",
		cache: "no-store",
	});
	const { ticket } = await response.json();

	const trustedUrl = `${process.env.TABLEAU_SERVER_URL}/trusted/${ticket}/${viewUrl}?:embed=yes&:toolbar=${
		hideToolbar ? "no" : "yes"
	}&:tabs=${hideTabs ? "no" : "yes"}&:device=${device}`;

	return (
		<>
			<Script
				type="module"
				src={`${process.env.TABLEAU_SERVER_URL}/javascripts/api/tableau.embedding.3.latest.min.js`}
				strategy="lazyOnload"
			/>
			<div>
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
			</div>
		</>
	);
}

export default TableauEmbedServer;
