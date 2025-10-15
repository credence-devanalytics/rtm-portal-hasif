"use client";

import React, { useEffect, useRef, useState } from "react";
import { safeWindow } from "@/lib/client-utils";

interface Tableau {
  VizManager: any;
  Viz: new (
    containerDiv: HTMLElement,
    url: string,
    options?: any
  ) => TableauViz;
}

// TypeScript declarations for Tableau Embedding API v3
declare global {
  interface Window {
    tableau: Tableau;
  }
}

interface TableauViz {
  dispose(): void;
  getWorkbook(): any;
  getAreTabsHidden(): boolean;
  setAreTabsHidden(hidden: boolean): void;
  addEventListener(type: string, listener: (event: any) => void): void;
  removeEventListener(type: string, listener: (event: any) => void): void;
}

interface TableauEmbedProps {
  width?: string;
  height?: string;
  hideToolbar?: boolean;
  hideTabs?: boolean;
  device?: "default" | "desktop" | "tablet" | "phone";
  onLoad?: () => void;
  onError?: (error: any) => void;
}

interface TableauProps {
  url: string;
  sheetName: string; // Optional sheet name for Tableau
}

const TableauEmbedv3: React.FC<TableauEmbedProps> = ({
  width = "100%",
  height = "800px",
  hideToolbar = false,
  hideTabs = true,
  device = "default",
  onLoad,
  onError,
}) => {
  const vizRef = useRef<HTMLDivElement>(null);
  const vizInstance = useRef<TableauViz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tableau Public URL
  const vizUrl = "https://public.tableau.com/views/Groundwater-2/Story1";

  useEffect(() => {
    const loadTableauAPI = async () => {
      try {
        // Check if Tableau API is already loaded
        if (safeWindow?.tableau) {
          initializeViz();
          return;
        }

        // Load Tableau Embedding API v3
        const script = document.createElement("script");
        script.src =
          "https://public.tableau.com/javascripts/api/tableau-2.min.js";
        script.type = "text/javascript";

        script.onload = () => {
          console.log("Tableau API loaded successfully");
          initializeViz();
        };

        script.onerror = (err) => {
          console.error("Failed to load Tableau API:", err);
          setError("Failed to load Tableau API");
          setIsLoading(false);
          onError?.(err);
        };

        document.head.appendChild(script);
      } catch (err) {
        console.error("Error loading Tableau API:", err);
        setError("Error loading Tableau API");
        setIsLoading(false);
        onError?.(err);
      }
    };

    const initializeViz = () => {
      if (!vizRef.current || !safeWindow?.tableau) {
        return;
      }

      // Dispose of any existing viz
      if (vizInstance.current) {
        vizInstance.current.dispose();
        vizInstance.current = null;
      }

      try {
        // Get container dimensions
        const containerWidth = vizRef.current.clientWidth;
        const containerHeight = vizRef.current.clientHeight;

        // Configure visualization options for responsive behavior
        const options = {
          width: containerWidth,
          height: containerHeight,
          hideTabs: hideTabs,
          hideToolbar: hideToolbar,
          device: device,
          // Enable responsive behavior
          onFirstInteractive: () => {
            console.log("Tableau viz is interactive");
            setIsLoading(false);
            onLoad?.();

            // Make iframe responsive after load
            setTimeout(() => {
              makeIframeResponsive();
            }, 100);
          },
        };

        // Create new Tableau visualization
        vizInstance.current = new safeWindow.tableau.Viz(
          vizRef.current,
          vizUrl,
          options
        );

        if (!vizInstance.current) {
          return;
        }

        // Add event listeners
        vizInstance.current.addEventListener("tabswitch", (event: any) => {
          console.log("Tab switched:", event);
        });

        vizInstance.current.addEventListener(
          "storypointswitch",
          (event: any) => {
            console.log("Story point switched:", event);
          }
        );
      } catch (err) {
        console.error("Error initializing Tableau viz:", err);
        setError("Error initializing visualization");
        setIsLoading(false);
        onError?.(err);
      }
    };

    // Function to make iframe responsive
    const makeIframeResponsive = () => {
      if (!vizRef.current) return;

      const iframe = vizRef.current.querySelector("iframe");
      if (iframe) {
        // Remove fixed dimensions
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.minWidth = "auto";
        iframe.style.minHeight = "auto";
        iframe.style.maxWidth = "100%";
        iframe.style.maxHeight = "100%";

        // Add responsive attributes
        iframe.setAttribute("width", "100%");
        iframe.setAttribute("height", "100%");

        console.log("Made iframe responsive");
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (vizInstance.current && vizRef.current) {
        const containerWidth = vizRef.current.clientWidth;
        const containerHeight = vizRef.current.clientHeight;

        // Update iframe dimensions
        makeIframeResponsive();

        // Optionally trigger Tableau resize
        setTimeout(() => {
          try {
            // Force a redraw by toggling a parameter or similar
            const workbook = vizInstance.current?.getWorkbook();
            if (workbook) {
              // This helps trigger a responsive update
              workbook.revertAllAsync();
            }
          } catch (err) {
            console.log(
              "Resize optimization failed, but iframe should still be responsive"
            );
          }
        }, 100);
      }
    };

    loadTableauAPI();

    // Add resize listener
    safeWindow?.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      safeWindow?.removeEventListener("resize", handleResize);
      if (vizInstance.current) {
        try {
          vizInstance.current.dispose();
          vizInstance.current = null;
        } catch (err) {
          console.error("Error disposing viz:", err);
        }
      }
    };
  }, [vizUrl, width, height, hideToolbar, hideTabs, device, onLoad, onError]);

  // Method to export data (optional feature)
  const exportData = async () => {
    if (!vizInstance.current) return;

    try {
      const workbook = vizInstance.current.getWorkbook();
      const activeSheet = workbook.getActiveSheet();

      if (activeSheet.getSheetType() === "worksheet") {
        const data = await activeSheet.getUnderlyingDataAsync();
        console.log("Exported data:", data);
        return data;
      }
    } catch (err) {
      console.error("Error exporting data:", err);
    }
  };

  // Method to filter data (optional feature)
  const applyFilter = async (fieldName: string, values: string[]) => {
    if (!vizInstance.current) return;

    try {
      const workbook = vizInstance.current.getWorkbook();
      const activeSheet = workbook.getActiveSheet();

      if (activeSheet.getSheetType() === "worksheet") {
        await activeSheet.applyFilterAsync(fieldName, values, "replace");
      }
    } catch (err) {
      console.error("Error applying filter:", err);
    }
  };

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 border border-red-200 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-red-600 font-semibold mb-2">
            Failed to load Tableau visualization
          </div>
          <div className="text-red-500 text-sm">{error}</div>
          <button
            onClick={() => safeWindow?.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative bg-white rounded-lg shadow-sm border"
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">
              Loading Tableau visualization...
            </div>
          </div>
        </div>
      )}

      <div
        ref={vizRef}
        className="w-full h-full overflow-hidden"
        style={{
          width: "100%",
          height: "100%",
          visibility: isLoading ? "hidden" : "visible",
        }}
      />

      {/* Optional: Control buttons */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 space-x-2 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={exportData}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            title="Export Data"
          >
            Export
          </button>
          <button
            onClick={() => safeWindow?.open(vizUrl, "_blank")}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            title="Open in Tableau"
          >
            Full View
          </button>
        </div>
      )}
    </div>
  );
};

export const MyViz: React.FC = () => {
  return (
    <>
      <div
        className="tableauPlaceholder"
        id="viz1752551618327"
        style={{ position: "relative" }}
      >
        <noscript>
          <a href="#">
            <img
              alt="Story 1 "
              src="https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;Gr&#47;Groundwater-2&#47;Story1&#47;1_rss.png"
            />
          </a>
        </noscript>
        <object className="tableauViz">
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param name="site_root" value="" />
          <param name="name" value="Groundwater-2&#47;Story1" />
          <param name="tabs" value="no" />
          <param name="toolbar" value="yes" />
          <param
            name="static_image"
            value="https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;Gr&#47;Groundwater-2&#47;Story1&#47;1.png"
          />
          <param name="animate_transition" value="yes" />
          <param name="display_static_image" value="yes" />
          <param name="display_spinner" value="yes" />
          <param name="display_overlay" value="yes" />
          <param name="display_count" value="yes" />
          <param name="language" value="en-US" />
        </object>
      </div>
      <script type="text/javascript">
        var divElement = document.getElementById('viz1752551618327'); var
        vizElement = divElement.getElementsByTagName('object')[0];
        vizElement.style.width='1600px'; vizElement.style.height='927px'; var
        scriptElement = document.createElement('script'); scriptElement.src =
        'https://public.tableau.com/javascripts/api/viz_v1.js';
        vizElement.parentNode.insertBefore(scriptElement, vizElement);
      </script>
    </>
  );
};

// TypeScript declaration for Tableau API
// declare global {
//   interface Window {
//     tableau?: any;
//   }
// }

const TableauEmbed: React.FC<TableauProps> = ({ url, sheetName }) => {
  const vizRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    const loadTableauScript = () => {
      if (scriptLoaded.current || safeWindow?.tableau) {
        initializeViz();
        return;
      }
      const scriptElement = document.createElement("script");
      scriptElement.src =
        "https://public.tableau.com/javascripts/api/viz_v1.js";
      scriptElement.onload = () => {
        scriptLoaded.current = true;
        initializeViz();
      };
      document.head.appendChild(scriptElement);
    };

    const initializeViz = () => {
      if (vizRef.current) {
        const vizElement = vizRef.current.getElementsByTagName("object")[0];
        if (vizElement) {
          vizElement.style.width = "100%";
          vizElement.style.height = "100%";
          vizElement.style.display = "block";
          
          // Apply additional styles to ensure proper sizing
          const container = vizRef.current;
          container.style.width = "100%";
          container.style.height = "100%";
          container.style.position = "relative";
          
          // Create and execute the Tableau script with responsive dimensions
          const scriptElement = document.createElement("script");
          scriptElement.type = "text/javascript";
          scriptElement.innerHTML = `
            (function() {
              var divElement = document.querySelector('.tableauPlaceholder');
              if (divElement) {
                var vizElement = divElement.getElementsByTagName('object')[0];
                if (vizElement) {
                  // Set responsive dimensions instead of fixed ones
                  vizElement.style.width = '100%';
                  vizElement.style.height = '100%';
                  
                  // Load the Tableau API script
                  var apiScript = document.createElement('script');
                  apiScript.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';
                  vizElement.parentNode.insertBefore(apiScript, vizElement);
                  
                  // Wait for iframe to load and apply responsive styles
                  setTimeout(function() {
                    var iframe = divElement.querySelector('iframe');
                    if (iframe) {
                      iframe.style.width = '100%';
                      iframe.style.height = '100%';
                      iframe.style.maxWidth = '100%';
                      iframe.style.maxHeight = '100%';
                      iframe.style.minWidth = 'auto';
                      iframe.style.minHeight = 'auto';
                    }
                  }, 2000);
                }
              }
            })();
          `;
          
          // Execute the script
          document.head.appendChild(scriptElement);
        }
      }
    };

    loadTableauScript();
    return () => {};
  }, []);

  // Responsive wrapper with aspect ratio
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <style jsx>{`
        .tableauPlaceholder {
          width: 100% !important;
          height: 100% !important;
          position: relative !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        .tableauViz {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
        }

        /* Ensure the Tableau iframe fills the container */
        .tableauPlaceholder iframe {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          min-width: auto !important;
          min-height: auto !important;
          border: none !important;
        }
      `}</style>
      <div
        ref={vizRef}
        className="tableauPlaceholder"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
        }}
      >
        
        <object className="tableauViz" style={{ width: "100%", height: "100%", display: "block" }}>
          <param name="host_url" value="https%3A%2F%2Fpublic.tableau.com%2F" />
          <param name="embed_code_version" value="3" />
          <param name="site_root" value="" />
          <param name="name" value={sheetName} />
          <param name="tabs" value="no" />
          <param name="toolbar" value="no" />
          {/* <param name="static_image" value={url} /> */}
          <param name="animate_transition" value="yes" />
          {/* <param name="display_static_image" value="yes" /> */}
          <param name="display_spinner" value="yes" />
          <param name="display_overlay" value="yes" />
          <param name="display_count" value="yes" />
          <param name="language" value="en-US" />
          <param name="width" value="100%" />
          <param name="height" value="100%" />
        </object>
      </div>
    </div>
  );
};

export default TableauEmbed;