"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { LogOut, Menu, Settings, User } from "lucide-react";
import MedinaLogo from "./MedinaLogo";
import { signOut, useSession } from "@/lib/auth-client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export default function Header() {
  const pathname = usePathname();
  console.log("Current pathname:", pathname);
  const specialPaths = ["/auth", "/home"]; // Paths where header not be rendered cosmetic
  const renderHeader = !(specialPaths.some(path => pathname.startsWith(path)) || pathname === "/");

  if (!renderHeader) {
    return null;
  }

  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { name: "Key Performance Index", href: "/KPI" },
  ];

  const aiItems = [
    { name: "Social Media", href: "/ai/social-media/chat" },
    { name: "Marketing", href: "/ai/marketing/chat" },
  ];

  const mainNavItems = [
    { name: "AI", href: "#" },
    { name: "Determ", href: "https://app.determ.com/174980/feed/q/6746731" },
    { name: "Contact Us", href: "#contact" },
    { name: "Login", href: "/login" },
  ];

  // Reusable User Menu Component
  function UserMenu({ 
    session, 
    variant = "default" 
  }: { 
    session: any; 
    variant?: "default" | "floating" | "mobile" 
  }) {    
    const router = useRouter();

    // Truncate username based on variant
    const getDisplayName = (name: string) => {
      if (!name) return name;
      if (variant === "floating" || variant === "mobile") {
        return name.length > 30 ? name.substring(0, 30) + "..." : name;
      }
      return name; // No limit for settings navigation
    };

    const userMenuItems = [
      { name: "Settings", href: "/settings", icon: <Settings className="h-4 aspect-square mr-2" /> },
    ];

    if ( variant === "mobile" ) {
    }

    if (!session) {
      return (
        <Link
          href="/login"
          className="group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/20 data-[state=open]:bg-white/20 drop-shadow-sm"
        >
          Login
        </Link>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button 
            className="group inline-flex h-10 w-max items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-white/20 hover:text-gray-900 focus:bg-white/20 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-white/20 data-[state=open]:bg-white/20 drop-shadow-sm space-x-3"
          >
            <span 
              title={session?.user?.name} // Show full name on hover
            >
              {getDisplayName(session?.user?.name)}
            </span>
            <div 
              className={`aspect-square rounded-full border-1 flex items-center justify-center bg-white border-gray-700`}
            >
              <User 
                className={`w-4 h-4 text-gray-900`} 
              />
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="grid w-[200px] gap-1 p-4 backdrop-blur-xl rounded-lg border border-black bg-white"
        >
          {userMenuItems.map((item) => (
            <>
              <DropdownMenuItem
                key={item.name}
                onClick={() => router.push(item.href)}
                className="block select-none rounded-md p-2 no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 text-gray-900 text-sm font-medium leading-none"
            >
              {item.icon}
              {item.name}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-700"  />
          </>
          ))}
          <DropdownMenuItem
            onClick={() => signOut({callbackUrl: "/"})}
            className={`cursor-pointer flex flex-row items-center space-x-2 block select-none rounded-md p-2 no-underline outline-none transition-colors text-sm font-medium leading-none text-red-400 hover:text-red-400 focus:text-red-400 hover:bg-gray-100 focus:bg-gray-100`}
          >
            <LogOut className="h-4 aspect-square mr-2" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "bg-white/30 backdrop-blur-xl border border-gray-200/30 shadow-lg"
          : "bg-white/15 backdrop-blur-xl border border-gray-200/20 shadow-md"
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
                  <div className="grid w-[200px] gap-1 p-2 bg-white/40 backdrop-blur-xl rounded-lg border border-gray-200/40 shadow-lg ">
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
                  <div className="grid w-[200px] gap-1 p-2 bg-white/40 backdrop-blur-xl rounded-lg border border-gray-200/40 shadow-lg ">
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
              <NavigationMenuItem>
                <UserMenu session={session} variant="floating" />
              </NavigationMenuItem>
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
              className="w-[300px] sm:w-[400px] bg-white/40 backdrop-blur-xl border-gray-200/40 shadow-lg"
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
                  <UserMenu session={session} variant="mobile" />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
