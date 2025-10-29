import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		const response = await fetch(`http://100.83.250.224/trusted`, {
			method: "POST",
			body: new URLSearchParams({
				username: "CredenceCreator2",
				server: "http://100.83.250.224",
				client_ip: "",
				target_site: "",
			}).toString(), // Convert the object to a URL-encoded string
			headers: {
				"Content-Type": "application/x-www-form-urlencoded", // Remains unchanged
				charset: "UTF-8",
			},
		});

		const ticketText = await response.text();

		console.log("ticketText", ticketText);

		if (ticketText !== "-1") {
			return NextResponse.json({ ticket: ticketText });
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