"use client";

import { SettingsNavigation } from "@/components/navigation";
import { SettingsSidebar } from "@/components/settings-sidebar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";


export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return null;
  }

  if (!session) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <h1>Access Denied</h1>
        <p>You must be logged in to view this page.</p>
        <Button>
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <SettingsNavigation />
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto flex">
          <SettingsSidebar />
          <main className="flex-1 p-4">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}