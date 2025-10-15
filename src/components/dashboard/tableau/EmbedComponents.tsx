"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import TableauEmbed from "./TableauEmbed";

// Base Generic Embed Component
interface EmbedComponentProps {
  title?: string;
  description?: string;
  height?: string | number;
  width?: string | number;
  children: ReactNode;
  className?: string;
}

export function EmbedComponent({ 
  title = "Data Visualization", 
  description = "Interactive embedded content",
  height = "800px",
  width = "100%",
  children,
  className = ""
}: EmbedComponentProps) {
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="">
        <CardTitle className="">{title}</CardTitle>
        <CardDescription className="">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full h-full" style={{ height, width, minHeight: height }}>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// Tableau Embed Component
interface TableauEmbedProps {
  url: string;
  sheetName: string; 
  title?: string;
  description?: string;
  height?: string | number;
  width?: string | number;
}

export function TableauEmbedComponent({ 
  url, 
  sheetName,
  title = "Data Visualization", 
  description = "Interactive Tableau dashboard",
  height = "800px",
  width = "100%" 
}: TableauEmbedProps) {
  return (
    <EmbedComponent
      title={title}
      description={description}
      height={height}
      width={width}
    >
      <TableauEmbed url={url} sheetName={sheetName} />
    </EmbedComponent>
  );
}

// Infographic Embed Component
interface InfographicEmbedProps {
  title?: string;
  description?: string;
  height?: string | number;
  width?: string | number;
  children: ReactNode;
  className?: string;
}

export function InfographicEmbedComponent({ 
  title = "Infographic", 
  description = "Educational infographic content",
  height = "auto",
  width = "100%",
  children,
  className = ""
}: InfographicEmbedProps) {
  return (
    <EmbedComponent
      title={title}
      description={description}
      height={height}
      width={width}
      className={className}
    >
      {children}
    </EmbedComponent>
  );
}

// Default exports for backward compatibility
export default EmbedComponent;