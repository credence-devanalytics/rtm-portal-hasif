"use client";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const MeDINALandingPage: React.FC = () => {
	// If user is logged in, redirect to /home
	// You can use your auth logic here
	const { data: session} = useSession(); // Replace with actual session check
	const router = useRouter();
	if (session) {
		router.push("/home");
	}
	return (
		<div className="min-h-screen bg-white relative">
			{/* Grid and Dot Background */}

			<div className="absolute inset-0 opacity-30" />
			<Hero />
		</div>
	);
};

export default MeDINALandingPage;
