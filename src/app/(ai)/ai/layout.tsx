import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/ai/app-sidebar";
import { Button } from "@/components/ui/button";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="pt-20 px-6 w-full h-[calc(100vh-4rem)]">
				<Button asChild size="icon" variant="outline">
					<SidebarTrigger />
				</Button>
				{children}
			</main>
		</SidebarProvider>
	);
}
