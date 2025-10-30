"use client";

import MedinaLogo from "@/components/MedinaLogo";
import Stats09 from "@/components/stats-3";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";
import { Bot, ChartNoAxesCombined, ExternalLink, Mail, MessagesSquare, Sparkles, Table, ThumbsUp, Tv } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import useMultiplatformData from "@/hooks/useMultiplatformData";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const CallToActionButton = () => {
  const router = useRouter();
  return (
    <div className="flex justify-center pt-2 pb-4">
      {/* CTA Button */}
      <Button
        variant="default"
        size="lg"
        className="bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white font-semibold rounded-lg text-md inline-flex items-center space-x-2 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 animate-fade-in-up animation-delay-600 shine-hover"
        onClick={() => router.push("/login")}
      >
        <span>Get Started</span>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Button>
    </div>
  )
};

const NavButtons = () => {
  const buttonData = [
    { href: "/SocMedAcc", label: "SocMed RTM Accounts", icon: <MessagesSquare /> },
    { href: "/dashboard", label: "SocMed Public Sentiment", icon: <ThumbsUp /> },
    { href: "/Multiplatform", label: "Multiplatform", icon: <Tv /> },
    { href: "/KPI", label: "KPI", icon: <ChartNoAxesCombined /> },
    { href: "/ai/marketing/chat", label: "Marketing AI", icon: <Sparkles /> },
    { href: "/ai/social-media/chat", label: "Social Media AI", icon: <Sparkles /> },
    { href: "https://app.determ.com/174980/feed/q/6746731", label: "Determ", icon: <Table /> },
    { href: "/contact", label: "Contact Us", icon: <Mail /> },
  ]
  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto">
      <div className="text-center w-full mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
          Quick Links
        </h1>
      </div>
      <div className="grid grid-cols-4 gap-4 w-fit">
        { buttonData.map((button, index) => (
          <Link key={index} href={button.href} className="w-full">
            <Button
              variant="default"
              size="lg"
              className="w-full h-auto flex items-center justify-center bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-semibold rounded-md py-3 px-4 gap-2 text-sm"
            >
              <span className="flex-shrink-0">{button.icon}</span>
              <span className="text-center leading-tight">{button.label}</span>
              { button.label === "Determ" && <ExternalLink className="h-4 w-4 text-white flex-shrink-0" /> }
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
      <Card className="p-4 sm:p-6 bg-transparent border-none shadow-none w-full">
        {/* Header */}
        <CardHeader className="px-0">
          <CardTitle className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 text-center leading-tight">
            {item.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* Main KPI using Stats09 */}
            <div className="w-full order-1">
              <Stats09 
                name={item.name}
                stat={item.stat}
                limit={item.limit}
                percentage={item.percentage}
              />
            </div>

            {/* Platform breakdown */}
            <div className="w-full order-2">
              <Card className="h-full w-full">
                <CardHeader className="">
                  <CardTitle className="text-sm sm:text-base font-medium text-gray-600">
                    {item.name.includes('Viewers') ? 'Viewers by Platform' : 'Listeners by Platform'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {sortedPlatforms.map((platform) => (
                    <div key={platform.name} className="flex items-center justify-between">
                      <Link 
                        href={platform.link} 
                        className={`bg-${platform.color}-100 text-${platform.color}-800 font-semibold rounded-md py-1 px-2 sm:px-3 flex-shrink-0 flex items-center gap-1 text-xs sm:text-sm hover:bg-${platform.color}-200 transition-colors`}
                      >
                        <span className="truncate">{platform.name}</span>
                        <ExternalLink className="w-3 h-3 text-gray-600 flex-shrink-0" />
                      </Link>
                      <span className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {platform.stat.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  };

  return (
    <section id="KPI" className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8">
        {KPIdata.map((item, index) => (
          <KPICard key={item.name} item={item} index={index}/>
        ))}
      </div>
    </section>
  )
};

export default function HomePage() {
  const { data: session, isPending } = useSession();
    return (
    <>
    <AuroraBackground>
      <div className="min-h-screen overflow-auto w-full">
        <main className="relative w-full">
          <section className="flex flex-col pt-12 pb-8">
            <div className="max-w-8xl mx-auto px-4 w-full flex flex-col">
              {/* Title Section with dynamic spacing */}
              <div className="flex flex-col justify-center items-center mb-4 sm:mb-6 lg:mb-8 xl:mb-10">
                <MedinaLogo size="lg" className="transform -translate-x-24" />
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-semibold animate-fade-in-up text-black text-center">
                  Media Data Insight and Analytics
                </h2>
              </div>
              
              {/* Content Section with reduced spacing */}
              <div className="flex flex-col space-y-4">
                {!isPending && (session ? <NavButtons /> : <CallToActionButton />)}
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
