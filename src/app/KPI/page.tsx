import Header from "@/components/Header";


export default function HomepageDashboard () {
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
        </div>
      </div>
      <div>

      </div>
    </div>
    </>
  );
};