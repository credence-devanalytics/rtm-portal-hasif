"use client";

import * as React from "react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import * as ProgressPrimitive from "@radix-ui/react-progress";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps extends React.ComponentProps<"div"> {}
function Card({ className, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}
Card.displayName = "Card";

interface CardHeaderProps extends React.ComponentProps<"div"> {}
function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}
CardHeader.displayName = "CardHeader";

interface CardTitleProps extends React.ComponentProps<"div"> {}
function CardTitle({ className, ...props }: CardTitleProps) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

interface CardDescriptionProps extends React.ComponentProps<"div"> {}
function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}
CardDescription.displayName = "CardDescription";

interface CardActionProps extends React.ComponentProps<"div"> {}
function CardAction({ className, ...props }: CardActionProps) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  );
}
CardAction.displayName = "CardAction";

interface CardContentProps extends React.ComponentProps<"div"> {}
function CardContent({ className, ...props }: CardContentProps) {
  return (
    <div data-slot="card-content" className={cn("px-6", className)} {...props} />
  );
}
CardContent.displayName = "CardContent";

interface CardFooterProps extends React.ComponentProps<"div"> {}
function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}
CardFooter.displayName = "CardFooter";

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> { className?: string; value:number; }

const getProgressColor = (percentage: number) => {
  const clampedValue = Math.max(0, Math.min(100, percentage || 0));
  
  // Convert percentage to hue (0 = red, 120 = green)
  const hue = (clampedValue / 100) * 120;
  
  return `hsl(${hue}, 70%, 50%)`;
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, ...props }, ref) => {
  // Calculate dynamic color based on percentage (0% = red, 100% = green)

  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      className={cn(
        "bg-gray-200 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 transition-all duration-300"
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: getProgressColor(value || 0)
        }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

interface Stats09Props {
  name: string;
  stat: number;
  limit: number;
  percentage: number;
}

interface Stats09ComponentProps {
  data: Stats09Props[];
}

export default function Stats09(data: Stats09Props) {
  return (
    <div className="w-full h-fit">
      <div className="w-full">
        <Card key={data.name} className="py-4 w-full">
          <CardContent className="w-full">
            <dt className="text-sm text-muted-foreground">{data.name}</dt>
            <dd className="text-2xl font-semibold text-foreground">
              {data.stat.toLocaleString()}
            </dd>
            <Progress value={data.percentage} className="mt-6 h-2" />
            <dd className="mt-2 flex items-center justify-between text-sm">
              {/* Add dynamic color based on percentage like the progress bar*/}
              <span style={{ color: getProgressColor(data.percentage), fontWeight: "bold" }}>{data.percentage.toPrecision(3)}%</span>
              <span className="text-muted-foreground">
                {data.stat.toLocaleString()} of {data.limit.toLocaleString()}
              </span>
            </dd>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}