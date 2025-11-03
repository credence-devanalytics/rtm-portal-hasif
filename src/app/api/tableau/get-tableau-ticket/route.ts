import { NextResponse } from "next/server";

export async function POST(request: Request) {
	console.log("Fetching Tableau ticket from ", process.env.TABLEAU_TICKET_URL);
	try {
		const response = await fetch(`${process.env.TABLEAU_TICKET_URL}/trusted`, {
			method: "POST",
			body: new URLSearchParams({
				username: "dataops",
				server: process.env.TABLEAU_SERVER_URL,
				client_ip: "",
				target_site: "",
			}).toString(), // Convert the object to a URL-encoded string
			headers: {
				"Content-Type": "application/x-www-form-urlencoded", // Remains unchanged
				charset: "UTF-8",
			},
		});

		const ticketText = await response.text();
		const res = `${process.env.TABLEAU_SERVER_URL}/trusted/${ticketText}`;

		console.log("ticketText", res);

		if (ticketText !== "-1") {
			return NextResponse.json({ ticket: res });
		} else {
			return NextResponse.json(
				{ error: "Configuration issue" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Error fetching ticket:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}
