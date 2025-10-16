import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Program {
  programName: string;
  mau: number;
  channelName: string;
}

interface UnifiCompareChannelsChartProps {
  topPrograms: Program[];
  loading?: boolean;
}

const UnifiCompareChannelsChart: React.FC<UnifiCompareChannelsChartProps> = ({
  topPrograms,
  loading = false,
}) => {
  const [expandedPrograms, setExpandedPrograms] = React.useState<Set<string>>(
    new Set()
  );

  // Toggle program name expansion
  const toggleProgramName = (programKey: string) => {
    setExpandedPrograms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(programKey)) {
        newSet.delete(programKey);
      } else {
        newSet.add(programKey);
      }
      return newSet;
    });
  };

  // Truncate program name to 56 characters
  const truncateProgramName = (name: string, key: string) => {
    const maxLength = 56;
    const isExpanded = expandedPrograms.has(key);

    if (name.length <= maxLength) {
      return <span>{name}</span>;
    }

    if (isExpanded) {
      return (
        <span
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => toggleProgramName(key)}
          title="Click to collapse"
        >
          {name}
        </span>
      );
    }

    return (
      <span
        className="cursor-pointer hover:text-blue-600 transition-colors"
        onClick={() => toggleProgramName(key)}
        title={`${name}\n\nClick to view full title`}
      >
        {name.substring(0, 56)}...
      </span>
    );
  };

  // Filter programs by channel
  const tv1Programs = React.useMemo(() => {
    return topPrograms
      .filter((program) => program.channelName === "TV1")
      .slice(0, 10);
  }, [topPrograms]);

  const tv2Programs = React.useMemo(() => {
    return topPrograms
      .filter((program) => program.channelName === "TV2")
      .slice(0, 10);
  }, [topPrograms]);

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="">
          <CardTitle className="">Channel Comparison</CardTitle>
          <CardDescription className="">
            Compare top programs across channels
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-[400px] bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-500">Loading comparison data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topPrograms || topPrograms.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm">
        <CardHeader className="">
          <CardTitle className="">Channel Comparison</CardTitle>
          <CardDescription className="">
            Compare top programs across channels
          </CardDescription>
        </CardHeader>
        <CardContent className="">
          <div className="h-[400px] bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p>No program data available for comparison</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader className="">
        <CardTitle className="">TV1 & TV2 Channel Comparison</CardTitle>
        <CardDescription className="">
          Compare top programs performance across TV1 and TV2 channels
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TV1 Programs Table */}
          <div className="space-y-3">
            <h4
              className="text-lg font-semibold text-center pb-2"
              style={{ color: "#102D84", borderBottom: "2px solid #102D84" }}
            >
              📺 TV1 Top Programs
            </h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#102D84] text-white">
                    <th className="text-left p-3 font-semibold">#</th>
                    <th className="text-left p-3 font-semibold">
                      Program Name
                    </th>
                    <th className="text-right p-3 font-semibold">MAU</th>
                  </tr>
                </thead>
                <tbody>
                  {tv1Programs.length > 0 ? (
                    tv1Programs.map((program, index) => (
                      <tr
                        key={`tv1-${index}`}
                        className={`border-b hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-3 font-medium text-gray-600">
                          {index + 1}
                        </td>
                        <td className="p-3 font-medium text-gray-900">
                          {truncateProgramName(
                            program.programName,
                            `tv1-${index}`
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Badge
                            variant="secondary"
                            className="bg-[#102D84] text-white hover:bg-[#0A1F5C] font-semibold"
                          >
                            {program.mau.toLocaleString()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-500">
                        No TV1 programs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {tv1Programs.length > 0 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                Showing top {tv1Programs.length} programs
              </div>
            )}
          </div>

          {/* TV2 Programs Table */}
          <div className="space-y-3">
            <h4
              className="text-lg font-semibold text-center pb-2"
              style={{ color: "#FE5400", borderBottom: "2px solid #FE5400" }}
            >
              📺 TV2 Top Programs
            </h4>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#FE5400] text-white">
                    <th className="text-left p-3 font-semibold">#</th>
                    <th className="text-left p-3 font-semibold">
                      Program Name
                    </th>
                    <th className="text-right p-3 font-semibold">MAU</th>
                  </tr>
                </thead>
                <tbody>
                  {tv2Programs.length > 0 ? (
                    tv2Programs.map((program, index) => (
                      <tr
                        key={`tv2-${index}`}
                        className={`border-b hover:bg-orange-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-3 font-medium text-gray-600">
                          {index + 1}
                        </td>
                        <td className="p-3 font-medium text-gray-900">
                          {truncateProgramName(
                            program.programName,
                            `tv2-${index}`
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Badge
                            variant="secondary"
                            className="bg-[#FE5400] text-white hover:bg-[#D94700] font-semibold"
                          >
                            {program.mau.toLocaleString()}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-gray-500">
                        No TV2 programs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {tv2Programs.length > 0 && (
              <div className="text-xs text-gray-500 text-center pt-2">
                Showing top {tv2Programs.length} programs
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiCompareChannelsChart;
