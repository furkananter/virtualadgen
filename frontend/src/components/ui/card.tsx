import * as React from "react"
import { cn } from "@/lib/utils"

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative group flex flex-col min-h-fit", className)} {...props}>
      <div
        className={cn(
          "absolute inset-0 bg-card dark:bg-card transition-all duration-300 rounded-[20px] border border-border shadow-md",
          "group-hover:shadow-xl group-hover:border-primary/30 transition-all",
          "group-data-[status=RUNNING]:border-[#10b981] group-data-[status=RUNNING]:border-2",
          "group-data-[status=COMPLETED]:border-[#10b981] group-data-[status=COMPLETED]:border-2",
          "group-data-[status=FAILED]:border-[#ef4444] group-data-[status=FAILED]:border-2",
          "group-data-[status=PAUSED]:border-[#f59e0b] group-data-[status=PAUSED]:border-2",
          "group-data-[selected=true]:border-primary group-data-[selected=true]:border-2 group-data-[selected=true]:shadow-lg group-data-[selected=true]:shadow-primary/20 group-data-[selected=true]:bg-primary/5"
        )}
      />
      <div data-slot="card" className="relative flex flex-col h-full z-10">
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col gap-1.5 p-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold tracking-tight", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-6 pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-6 pt-0", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
