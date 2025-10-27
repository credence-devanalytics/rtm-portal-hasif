"use client";

import { useSession } from "@/lib/auth-client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session) {
            router.push("/settings/account");
        }
    }, [session]);

    return (<></>)
}