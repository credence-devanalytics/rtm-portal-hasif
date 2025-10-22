import TableauEmbed from "@/components/dashboard/tableau/TableauEmbed";
import TableauEmbedServer from "@/components/dashboard/tableau/TableauEmbedServer";
import Header from "@/components/Header";


export default function KPIDashboard () {
  return (
    <>
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <Header />
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-20">
        <div className="text-center w-full">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard at a Glance
          </h1>
          <p className="text-muted-foreground">
            Basic analytics of all the dashboards in one place
          </p>
          <TableauEmbed 
            url={"http://100.83.250.224:8080/views/RTMKlik_17576649176570/RadioAnalysis2_1"} sheetName={"RTMKlik_17576649176570/RadioAnalysis2_1"}          
          />
          <TableauEmbedServer
            viewUrl="http://100.83.250.224:8080/views/RTMKlik_17576649176570/RadioAnalysis2_1"
          />
        </div>
      </div>
      <div>

      </div>
    </div>
    </>
  );
};