"use client"
import { TableauEmbedComponent } from "@/components/dashboard/tableau/EmbedComponents";
import TableauEmbedReact from "@/components/dashboard/tableau/TableauDashboard";
import TableauEmbed from "@/components/dashboard/tableau/TableauEmbed";
import TableauEmbedServer from "@/components/dashboard/tableau/TableauEmbedServer";
import TableauEmbedv2 from "@/components/dashboard/tableau/TableauEmbedv2";
import { Card } from "@/components/ui/card";
import useTrustedTableau from "@/hooks/useTrustedTableau";
import { useSession } from "@/lib/auth-client";
import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";


function TableauDashboards() {
  
  const tableauDashboardData = [
    {
      title: "Overall Analysis",
      src: "RTMKlik_17576649176570/Dashboard6",
    },
    {
      title: "Demographic Analysis",
      src: "RTMKlik_17576649176570/D",
    },
    {
      title: "TV Analysis",
      src: "RTMKlik_17576649176570/TVAnalysis",
    },
    {
      title: "VOD Analysis",
      src: "RTMKlik_17576649176570/RadioAnalysis2",
    },
    {
      title: "Radio Analysis",
      src: "RTMKlik_17576649176570/RadioAnalysis2_1",
    },
  ];

  function TableauEmbedWithTicket({ src }: { src: string }) {
      const ticket = useTrustedTableau();
      const fullsrc = `${ticket}/views/${src}`;
      console.log("Tableau Embed Src:", fullsrc);
  
      return (
          <TableauEmbed
              src={fullsrc}
              // src={src}
              height="600px"
              width="100%"
              hideTabs={true}
              hideToolbar={false}
              device="desktop"
          />
      );
  }

  return (
    tableauDashboardData.map((dashboard) => (
      <div className="grid grid-cols-1 gap-2 backdrop-blur-lg flex-grow">
        <Card className="p-4 gap-0">
          <h2 className="text-lg font-semibold mb-2">{dashboard.title}</h2>
          {/* <TableauEmbedComponent url={dashboard.src.split("/")[0]} sheetName={dashboard.src.split("/").pop()} /> */}
          {/* <TableauEmbedWithTicket src={dashboard.src} /> */}
          {/* <TableauEmbedReact
            viewUrl={dashboard.src}
            height="600px"
            width="100%"
            hideTabs={true}
            hideToolbar={false}
            device="desktop"
          /> */}
          <TableauEmbedServer
            viewUrl={dashboard.src}
            // src={src}
            height="600px"
            width="100%"
            hideTabs={true}
            hideToolbar={false}
            device="desktop"
          />
        </Card>
      </div>
    ))
  )
}


export default function RTMClickPage() {
  const { data:session } = useSession();
  const [access, setAccess] = useState<boolean>(null);

  useEffect(() => {
    const userAccess = async () => {
      const response = await fetch("/api/user/access", {
        method: "GET",
        cache: "no-store",
      });
      const access = ((await response.json()).access?.rtmklik || session?.user?.role === "superadmin") || false;
      // console.log("RTMklik access:", access);
      setAccess(access);
    };
    userAccess();
  }, []);

    return (
    <div className="container mx-auto px-4 pb-8 h-full flex flex-col pt-16 gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            RTMKlik Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive RTMKlik Analysis for every channel in this platform
          </p>
        </div>
        </div>
      { access && <TableauDashboards />}
      {access === false && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
            <Monitor className="h-6 w-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-medium text-sm">
              You do not have access to view RTMKlik Analytics.
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Please contact your administrator for access.
            </p>
          </div>
        </div>
      )}
      {access === null && (
        <div className="flex flex-col items-center justify-center py-8 space-y-3">
          <div className="p-3 rounded-full bg-gray-50 border border-gray-200">
            <Monitor className="h-6 w-6 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-medium text-sm">
              Loading data...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}