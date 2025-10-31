import { useEffect, useState } from "react";

const useTrustedTableau = () => {
	const [ticket, setTicket] = useState<string | null>(null);

	useEffect(() => {
		const fetchTicket = async () => {
			try {
				const response = await fetch("/api/tableau/get-tableau-ticket", {
					method: "POST",
				});

				const data = await response.json();
				console.log("useTrustedTableau response data:", data);

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
	}, []);
	
	console.log("useTrustedTableau ticket:", ticket);

	return ticket;
};

export default useTrustedTableau;
