import { useEffect, useState } from "react";

const useTrustedTableau = (username: string) => {
	const [ticket, setTicket] = useState<string | null>(null);

	useEffect(() => {
		const fetchTicket = async () => {
			try {
				const response = await fetch("/api/getTableauTicket", {
					method: "POST",
				});

				const data = await response.json();

				if (response.ok) {
					console.log("Generated Ticket:", data.ticket);
					setTicket(data.ticket);
				} else {
					console.error("Error generating ticket:", data.error);
				}
			} catch (error) {
				console.error("Error fetching ticket:", error);
			}
		};

		fetchTicket();
	}, [username]);

	return ticket;
};

export default useTrustedTableau;
