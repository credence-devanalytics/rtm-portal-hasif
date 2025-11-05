"use client"
import { TableauEmbedComponent } from "@/components/dashboard/tableau/EmbedComponents";
import TableauEmbedReact from "@/components/dashboard/tableau/TableauDashboard";
import TableauEmbed from "@/components/dashboard/tableau/TableauEmbed";
import TableauEmbedServer from "@/components/dashboard/tableau/TableauEmbedServer";
import TableauEmbedv2 from "@/components/dashboard/tableau/TableauEmbedv2";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import useTrustedTableau from "@/hooks/useTrustedTableau";
import { useSession } from "@/lib/auth-client";
import { Monitor } from "lucide-react";
import { useEffect, useState } from "react";


function TableauDashboards() {
  
  const tableauDashboardData = [
    {
      title: "Overall Analysis",
      src: "RTMKlik_17576649176570/Dashboard6",
      key: "overall"
    },
    {
      title: "Demographic Analysis",
      src: "RTMKlik_17576649176570/D",
      key: "demographic"
    },
    {
      title: "TV Analysis",
      src: "RTMKlik_17576649176570/TVAnalysis",
      key: "tv"
    },
    {
      title: "VOD Analysis",
      src: "RTMKlik_17576649176570/RadioAnalysis2",
      key: "vod"
    },
    {
      title: "Radio Analysis",
      src: "RTMKlik_17576649176570/RadioAnalysis2_1",
      key: "radio"
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
    <Tabs defaultValue="overall" className="w-full flex justify-center">
      <TabsList className="h-12 items-center justify-center rounded-xl bg-white p-1 text-slate-500 shadow-sm border border-black backdrop-blur-sm grid grid-cols-5 w-full max-w-full m-auto">
        {tableauDashboardData.map((dashboard) => (
          <TabsTrigger
            className="inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 lg:px-4 py-1.5 text-xs lg:text-sm font-medium transition-all flex-1 h-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm"
            value={dashboard.key}
            key={dashboard.key}
          >
            {dashboard.title}
          </TabsTrigger>
        ))}
      </TabsList>
      {tableauDashboardData.map((dashboard) => (
        <TabsContent
          className="grid grid-cols-1 gap-2 backdrop-blur-lg flex-grow py-4"
          value={dashboard.key}
          key={dashboard.key}
        >
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
            <div className="w-full flex justify-center">
              <TableauEmbedServer
              viewUrl={dashboard.src}
              // src={src}
              height="600px"
              width="100%"
              hideTabs={true}
              hideToolbar={false}
              device="desktop"
            />
            </div>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
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