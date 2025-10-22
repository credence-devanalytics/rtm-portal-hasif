"use client";

import Header from "@/components/Header";
import MedinaLogo from "@/components/MedinaLogo";
import Stats09 from "@/components/stats-3";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuroraBackground } from "@/components/ui/shadcn-io/aurora-background";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const KPISection = () => {

  const KPIdata = [
    {"name": "Total Viewers for RTM Channels", "stat": 100000000, "limit": 115000000, "percentage": 80, platforms: [
        {"name": "UnifiTV", "stat": 30000000, "limit": 50000000, "percentage": 80}, 
        {"name": "MyTV", "stat": 15000000, "limit": 40000000, "percentage": 87.5}, 
        {"name": "ASTRO", "stat": 25000000, "limit": 25000000, "percentage": 100},
        {"name": "RTMKlik", "stat": 20000000, "limit": 50000000, "percentage": 80}, 
        {"name": "Portal Berita", "stat": 10000000, "limit": 50000000, "percentage": 80}, 
    ]},
    {"name": "Total Radio Listeners on RTM Stations", "stat": 1800000, "limit": 3000000, "percentage": 66.67, platforms: [
        {"name": "UnifiTV", "stat": 600000, "limit": 50000000, "percentage": 80}, 
        {"name": "MyTV", "stat": 300000, "limit": 40000000, "percentage": 87.5}, 
        {"name": "ASTRO", "stat": 400000, "limit": 25000000, "percentage": 100},
        {"name": "RTMKlik", "stat": 350000, "limit": 40000000, "percentage": 87.5},         
        {"name": "Portal Berita", "stat": 150000, "limit": 40000000, "percentage": 87.5}, 
    ]},
  ]

  const KPICard = ({ item, index }) => {
    // Sort platforms by stat value (highest first)
    const sortedPlatforms = [...item.platforms].sort((a, b) => b.stat - a.stat);

    return (
      <Card className="p-3 bg-transparent border-none shadow-none w-full">
        {/* Header */}
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-gray-900 text-center">
            {item.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-0">
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
              <Card className="h-full w-full">
                <CardHeader className="pb-0">
                  <CardTitle className="text-sm font-medium text-gray-600 p-0">
                    {item.name.includes('Viewers') ? 'Viewers by Platform' : 'Listeners by Platform'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="">
                    {sortedPlatforms.map((platform) => (
                      <div key={platform.name} className="flex items-center justify-between py-1 gap-0">
                        <span className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
                          {platform.name}
                        </span>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {KPIdata.map((item, index) => (
          <KPICard key={item.name} item={item} index={index}/>
        ))}
      </div>
    </section>
  )
};

const HeroSection = () => {
  return(
    <>
    {/* Content overlay */}
    <main className="relative h-screen">
        <section className="flex flex-col h-full pt-4 sm:pt-6 lg:pt-8 pb-6">
            <div className="mx-auto w-full h-full flex flex-col">
                {/* Title Section - Max 50% height */}
                <div className="flex flex-col gap-4 justify-center items-center max-h-[50vh] flex-grow pt-8">
                    <MedinaLogo size="lg" className="transform -translate-x-24" />
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold animate-fade-in-up text-black text-center">
                        Media Data Insight and Analytics
                    </h2>
                </div>
                {/* Buttons Section - Grows with content */}
                <div className="flex-1 flex flex-col gap-6 items-center justify-center pt-6 min-h-0">
                    <KPISection />
                </div>
            </div>
        </section>
    </main></>
  )
};

export default function HomePage() {
    return (
    <>
    <AuroraBackground>
    <div className="max-w-8xl mx-auto space-y-6">
        {/* Header */}
        <Header />
        <HeroSection />
    </div>
    </AuroraBackground>
    </>
    )
}
