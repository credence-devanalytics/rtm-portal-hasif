"use client"

import Script from "next/script";
import { use, useEffect, useState } from "react";
import React from 'react';
import { Api, TableauViz, useTableauVizRef  } from '@tableau/embedding-api-react'
import { Button } from "@/components/ui/button";

interface TableauEmbedServerProps {
    viewUrl: string;
    height?: string;
    width?: string;
    hideTabs?: boolean;
    hideToolbar?: boolean;
    device?: "default" | "desktop" | "tablet" | "phone";
}

function TableauEmbedReact({
    viewUrl,
    height = "600px",
    width = "100%",
    hideTabs = false,
    hideToolbar = false,
    device = "default",
}: TableauEmbedServerProps) {

    const [ticket, setTicket] = useState<string>("");

    useEffect(() => {
        // Fetch the Tableau ticket from the API route
        const fetchTicket = async () => {
            const response = await fetch("/api/tableau/get-tableau-ticket", {
                method: "POST",
                cache: "no-store",
            });
            const { ticket } = await response.json();
            setTicket(ticket);
        };
        fetchTicket();
    }, []);

    const trustedUrl = `${ticket}/views/${viewUrl}?:embed=yes&:toolbar=${
        hideToolbar ? "no" : "yes"
    }&:tabs=${hideTabs ? "no" : "yes"}&:device=${device}`;
    console.log("TableauEmbedServer trustedUrl:", trustedUrl);

    const vizRef = useTableauVizRef();

    const getActiveSheetInfo = () => {
        const viz = vizRef.current;
        if (!viz) {
        throw new Error("TableauViz ref not assigned yet.");
        }
        const activeSheet = viz.workbook.activeSheet;
        const sheetName = activeSheet.name;
        const sheetType = activeSheet.sheetType;
        alert(`Active Sheet: ${sheetName}\nSheet Type: ${sheetType}`);
    };

    return (
        <>
        <div>
            <p>
            Click the <b>Get Sheet Info</b> button to get the name and type of the
            active sheet.
            </p>
            <p>
            <Button onClick={getActiveSheetInfo}>Get Sheet Info</Button>
            </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
            <TableauViz
            ref={vizRef}
            src={trustedUrl}
            hide-tabs
            toolbar="bottom"
            />
        </div>
        </>
    );
}

export default TableauEmbedReact;
