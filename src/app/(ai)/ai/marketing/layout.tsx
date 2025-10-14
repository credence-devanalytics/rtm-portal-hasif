"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, TrendingUp } from "lucide-react";

export default function MarketingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	// Determine which tab is active based on current path
	const getActiveTab = () => {
		if (pathname.includes("/chat")) return "chat";
		if (pathname.includes("/forecasting")) return "forecasting";
		return "chat"; // default
	};

	const activeTab = getActiveTab();

	return (
		<div className="pt-18">
			{/* Tab Navigation */}
			<div className="border-b border-gray-200/10 backdrop-blur-sm ml-64">
				<div className="container mx-auto px-4">
					<Tabs value={activeTab} className="w-full">
						<TabsList className="grid w-full grid-cols-2 h-11 bg-transparent border-0">
							<TabsTrigger
								value="chat"
								className="data-[state=active]:bg-blue-400 data-[state=active]:text-white rounded-md text-gray-400 hover:text-gray-600 transition-all duration-200 font-medium"
								asChild
							>
								<Link
									href="/ai/marketing/chat"
									className="flex items-center gap-2 px-6 py-3"
								>
									<MessageSquare className="w-4 h-4" />
									Chat
								</Link>
							</TabsTrigger>
							<TabsTrigger
								value="forecasting"
								className="data-[state=active]:bg-blue-400 data-[state=active]:text-white rounded-md text-gray-400 hover:text-gray-600 transition-all duration-200 font-medium"
								asChild
							>
								<Link
									href="/ai/marketing/forecasting"
									className="flex items-center gap-2 px-6 py-3"
								>
									<TrendingUp className="w-4 h-4" />
									Forecasting
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
