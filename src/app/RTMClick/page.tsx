"use client"
import { TableauEmbedComponent } from "@/components/dashboard/tableau/EmbedComponents";
import TableauEmbedReact from "@/components/dashboard/tableau/TableauDashboard";
import TableauEmbed from "@/components/dashboard/tableau/TableauEmbed";
import TableauEmbedServer from "@/components/dashboard/tableau/TableauEmbedServer";
import TableauEmbedv2 from "@/components/dashboard/tableau/TableauEmbedv2";
import { Card } from "@/components/ui/card";
import useTrustedTableau from "@/hooks/useTrustedTableau";


const tableauDashboardData = [
  {
    title: "VOD Analysis",
    src: "RTMKlik_17576649176570/RadioAnalysis2",
  },
  {
    title: "TV Analysis",
    src: "RTMKlik_17576649176570/TVAnalysis",
  },
  {
    title: "Demographic Analysis",
    src: "RTMKlik_17576649176570/D",
  },
  {
    title: "Overall Analysis",
    src: "RTMKlik_17576649176570/Dashboard6",
  },
  {
    title: "Overall Analysis Radio",
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

export default function RTMClickPage() {
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
      { tableauDashboardData.map((dashboard) => (
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
      ))}
    </div>
  );
}