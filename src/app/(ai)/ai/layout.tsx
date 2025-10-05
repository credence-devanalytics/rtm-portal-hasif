import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ai/app-sidebar";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="mt-2 ml-2">
				<Button asChild size="icon" variant="outline">
					<SidebarTrigger />
				</Button>
				{children}
			</main>
		</SidebarProvider>
	);
}
