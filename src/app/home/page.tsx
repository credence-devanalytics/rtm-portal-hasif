"use client";

import MedinaLogo from "@/components/MedinaLogo";
import Stats09 from "@/components/stats-3";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";
import { Bot, ChartNoAxesCombined, ExternalLink, MessagesSquare, Table, ThumbsUp, Tv } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useMultiplatformData from "@/hooks/useMultiplatformData";

const NavButtons = () => {
  const buttonData = [
    { href: "/SocMedAcc", label: "SocMed RTM Accounts", icon: <MessagesSquare /> },
    { href: "/dashboard", label: "SocMed Public Sentiment", icon: <ThumbsUp /> },
    { href: "/Multiplatform", label: "Multiplatform", icon: <Tv /> },
    { href: "/KPI", label: "KPI", icon: <ChartNoAxesCombined /> },
    { href: "#ai", label: "AI Chat", icon: <Bot /> },
    { href: "https://app.determ.com/174980/feed/q/6746731", label: "Determ", icon: <Table /> },
  ]
  return (
    <div className="flex flex-col gap-6 md:items-center md:justify-between pt-6">
      <div className="text-center w-full">
        <h1 className="text-2xl font-bold tracking-tight w-full">
          Quick Links
        </h1>
      </div>
      <div className="grid grid-cols-3 justify-center gap-4">
        {/* CTA Button */}
        { buttonData.map((button, index) => (
          <Link href={button.href}>
          <Button
            variant="default"
            size="lg"
            className="w-full flex items-center  bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold rounded-md text-md space-x-2 px-4"
          >
            {button.icon}
            <span>{button.label}</span>
            { button.label === "Determ" && <ExternalLink className="h-4 w-4 text-white" /> }
          </Button>
          </Link>
        ))}
      </div>
    </div>
  ) };

const KPISection = () => {

  // const multiplatformData = useMultiplatformData({ monthYear: null, channels: [], region: 'all' });
  // console.log("Multiplatform Data in KPI Section:", multiplatformData);

  const KPIdata = [
    {"name": "Total Viewers for RTM Channels", "stat": 100000000, "limit": 115000000, "percentage": 80, platforms: [
        {"name": "UnifiTV", "stat": 30000000, "limit": 50000000, "percentage": 80, link:"/UnifiTV", color:"green"}, 
        {"name": "MyTV", "stat": 15000000, "limit": 40000000, "percentage": 87.5, link:"/MyTVViewership", color:"blue"}, 
        {"name": "ASTRO", "stat": 25000000, "limit": 25000000, "percentage": 100, link:"/ASTRO", color:"purple"},
        {"name": "RTMKlik", "stat": 20000000, "limit": 50000000, "percentage": 80, link:"/RTMClick", color:"yellow"}, 
        {"name": "Portal Berita", "stat": 10000000, "limit": 50000000, "percentage": 80, link:"/WartaBerita", color:"indigo"}, 
    ]},
    {"name": "Total Radio Listeners on RTM Stations", "stat": 1800000, "limit": 3000000, "percentage": 66.67, platforms: [
        {"name": "UnifiTV", "stat": 600000, "limit": 50000000, "percentage": 80, link:"/UnifiTV", color:"green"}, 
        {"name": "MyTV", "stat": 300000, "limit": 40000000, "percentage": 87.5, link:"/MyTVViewership", color:"blue"}, 
        {"name": "ASTRO", "stat": 400000, "limit": 25000000, "percentage": 100, link:"/ASTRO", color:"purple"},
        {"name": "RTMKlik", "stat": 350000, "limit": 40000000, "percentage": 87.5, link:"/RTMClick", color:"yellow"},         
        {"name": "Portal Berita", "stat": 150000, "limit": 40000000, "percentage": 87.5, link:"/WartaBerita", color:"indigo"}, 
    ]},
  ]

  const KPICard = ({ item, index }) => {
    // Sort platforms by stat value (highest first)
    const sortedPlatforms = [...item.platforms].sort((a, b) => b.stat - a.stat);

    return (
      <Card className="p-6 bg-transparent border-none shadow-none w-full gap-0">
        {/* Header */}
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 text-center">
            {item.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-2 gap-6 w-full">
            {/* Left side - Main KPI using Stats09 */}
            <div className="w-full">
              <Stats09 
                name={item.name}
                stat={item.stat}
                limit={item.limit}
                percentage={item.percentage}
              />
            </div>

            {/* Right side - Platform breakdown */}
            <div className="w-full">
              <Card className="h-full w-full gap-2">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-gray-600 p-0">
                    {item.name.includes('Viewers') ? 'Viewers by Platform' : 'Listeners by Platform'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="">
                    {sortedPlatforms.map((platform) => (
                      <div key={platform.name} className="flex items-center justify-between py-1 gap-0">
                        <Link href={platform.link} className={`bg-${platform.color}-100 text-${platform.color}-800 font-semibold rounded-md py-1 px-2 min-w-0 flex-shrink-0 space-x-1`}>
                          <span className="">{platform.name}</span>
                          <ExternalLink className="inline-block ml-1 mb-0.5 w-3 h-3 text-gray-600" />
                        </Link>
                        <span className="text-sm font-semibold text-gray-900 ml-8 whitespace-nowrap">
                          {platform.stat.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  };

  return (
    <section id="KPI" className="w-full mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {KPIdata.map((item, index) => (
          <KPICard key={item.name} item={item} index={index}/>
        ))}
      </div>
    </section>
  )
};

export default function HomePage() {
    return (
    <>
    <AuroraBackground>
    <div className="max-w-8xl mx-auto space-y-6">
      <main className="relative h-screen">
        <section className="flex flex-col h-full pt-4 sm:pt-6 lg:pt-8 pb-8">
            <div className="mx-auto w-full h-full flex flex-col">
                {/* Title Section - Max 50% height */}
                <div className="flex flex-col justify-center items-center max-h-[30vh] flex-grow">
                    <MedinaLogo size="lg" className="transform -translate-x-24 items-end" />
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold animate-fade-in-up text-black text-center items-start flex-grow">
                        Media Data Insight and Analytics
                    </h2>
                </div>
                {/* Buttons Section - Grows with content */}
                <div className="flex-1 flex flex-col gap-6 items-center justify-center min-h-0">
                    <NavButtons />
                    <KPISection />
                </div>
            </div>
        </section>
      </main>
    </div>
    </AuroraBackground>
    </>
    )
}
