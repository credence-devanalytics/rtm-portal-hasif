"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import MedinaLogo from "./MedinaLogo";

export default function Header() {
	const [scrolled, setScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 10);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const dashboardItems = [
		{ name: "SocMed RTM Account", href: "/SocMedAcc" },
		{ name: "SocMed Public Sentiment", href: "/dashboard" },
		{ name: "Multiplatform", href: "/Multiplatform" },
	];

	const aiItems = [
		{ name: "Social Media", href: "/ai/social-media" },
		{ name: "Recommendations", href: "/ai/recommendations" },
		{ name: "Forecasting", href: "/ai/forecasting" },
	];

	const mainNavItems = [
		{ name: "AI", href: "#" },
		{ name: "Determ", href: "https://app.determ.com/174980/feed/q/6746731" },
		{ name: "Contact Us", href: "#contact" },
		{ name: "Login", href: "#login" },
	];

	return (
		<header
			className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
				scrolled
					? "bg-white/20 backdrop-blur-xl border-white/20 shadow-sm"
					: "bg-white/10 backdrop-blur-lg border-white/10"
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex-shrink-0">
						{pathname !== "/" ? (
							<MedinaLogo size="sm" />
						) : (
							<div className="w-10 h-10" />
						)}
					</div>

					{/* Desktop Navigation */}
					<NavigationMenu className="hidden md:flex">
						<NavigationMenuList className="space-x-1">
							{/* Home */}
							<NavigationMenuItem>
								<NavigationMenuLink
									href="/"
									className="group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/20 data-[state=open]:bg-white/20 drop-shadow-sm"
								>
									Home
								</NavigationMenuLink>
							</NavigationMenuItem>

							{/* Dashboards Dropdown */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className="h-10 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 bg-transparent hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900 focus:outline-none data-[state=open]:bg-white/20 data-[state=open]:text-gray-900 drop-shadow-sm">
									Dashboards
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<div className="grid w-[200px] gap-1 p-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/20 ">
										{dashboardItems.map((item) => (
											<NavigationMenuLink
												key={item.name}
												href={item.href}
												className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-gray-900"
											>
												<div className="text-sm font-medium leading-none">
													{item.name}
												</div>
											</NavigationMenuLink>
										))}
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>

							{/* AI Dropdown */}
							<NavigationMenuItem>
								<NavigationMenuTrigger className="h-10 rounded-lg px-4 py-2 text-sm font-medium text-gray-900 bg-transparent hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900 focus:outline-none data-[state=open]:bg-white/20 data-[state=open]:text-gray-900 drop-shadow-sm">
									AI
								</NavigationMenuTrigger>
								<NavigationMenuContent>
									<div className="grid w-[200px] gap-1 p-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/20 ">
										{aiItems.map((item) => (
											<NavigationMenuLink
												key={item.name}
												href={item.href}
												className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-gray-900"
											>
												<div className="text-sm font-medium leading-none">
													{item.name}
												</div>
											</NavigationMenuLink>
										))}
									</div>
								</NavigationMenuContent>
							</NavigationMenuItem>

							{/* Other Nav Items */}
							{mainNavItems
								.filter((item) => item.name !== "AI")
								.map((item) => (
									<NavigationMenuItem key={item.name}>
										<NavigationMenuLink
											href={item.href}
											className="group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/20 data-[state=open]:bg-white/20 drop-shadow-sm"
										>
											{item.name}
										</NavigationMenuLink>
									</NavigationMenuItem>
								))}
						</NavigationMenuList>
					</NavigationMenu>

					{/* Mobile menu */}
					<Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
						<SheetTrigger asChild className="md:hidden">
							<Button
								variant="ghost"
								size="icon"
								className="text-gray-900 hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900"
							>
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent
							side="right"
							className="w-[300px] sm:w-[400px] bg-white/10 backdrop-blur-xl border-white/20"
						>
							<nav className="flex flex-col gap-4 mt-8">
								{/* Home */}
								<Link
									href="/"
									className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-900 hover:bg-white/20 hover:text-gray-900 transition-colors"
									onClick={() => setMobileMenuOpen(false)}
								>
									Home
								</Link>

								{/* Mobile Dashboards Section */}
								<div className="space-y-2">
									<div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Dashboards
									</div>
									{dashboardItems.map((item) => (
										<a
											key={item.name}
											href={item.href}
											className="block px-8 py-2 text-sm text-gray-700 hover:bg-white/20 hover:text-gray-900 rounded-lg transition-colors"
											onClick={() => setMobileMenuOpen(false)}
										>
											{item.name}
										</a>
									))}
								</div>

								{/* Mobile AI Section */}
								<div className="space-y-2">
									<div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
										AI
									</div>
									{aiItems.map((item) => (
										<a
											key={item.name}
											href={item.href}
											className="block px-8 py-2 text-sm text-gray-700 hover:bg-white/20 hover:text-gray-900 rounded-lg transition-colors"
											onClick={() => setMobileMenuOpen(false)}
										>
											{item.name}
										</a>
									))}
								</div>

								{/* Other Nav Items */}
								{mainNavItems
									.filter((item) => item.name !== "AI")
									.map((item) => (
										<a
											key={item.name}
											href={item.href}
											className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-gray-900 hover:bg-white/20 hover:text-gray-900 transition-colors"
											onClick={() => setMobileMenuOpen(false)}
										>
											{item.name}
										</a>
									))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>
	);
}
