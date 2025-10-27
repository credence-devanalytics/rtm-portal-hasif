"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, BarChart3 } from "lucide-react";

export default function SocialMediaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	// Determine which tab is active based on current path
	const getActiveTab = () => {
		if (pathname.includes("/chat")) return "chat";
		if (pathname.includes("/recommendations")) return "recommendations";
		return "chat"; // default
	};

	const activeTab = getActiveTab();

	return (
		<div className="pt-18">
			{/* Tab Navigation */}
			<div className="border-b border-gray-200/10 backdrop-blur-sm ml-64">
				<div className="container mx-auto px-4">
					<Tabs value={activeTab} className="w-full">
						<TabsList className="grid w-full grid-cols-2 h-11 bg-transparent border-0 rounded-none">
							<TabsTrigger
								value="chat"
								className="data-[state=active]:bg-blue-400 data-[state=active]:text-white rounded-md text-gray-400 hover:text-gray-600 transition-all duration-200 font-medium"
								asChild
							>
								<Link
									href="/ai/social-media/chat"
									className="flex items-center gap-2 px-6 py-3"
								>
									<MessageSquare className="w-4 h-4" />
									Chat
								</Link>
							</TabsTrigger>
							<TabsTrigger
								value="recommendations"
								className="data-[state=active]:bg-blue-400 data-[state=active]:text-white rounded-md text-gray-400 hover:text-gray-600 transition-all duration-200 font-medium"
								asChild
							>
								<Link
									href="/ai/social-media/recommendations"
									className="flex items-center gap-2 px-6 py-3"
								>
									<BarChart3 className="w-4 h-4" />
									Recommendations
								</Link>
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Page Content */}
			<div>{children}</div>
		</div>
	);
}
