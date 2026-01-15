import * as React from "react"
import { Squircle } from "@squircle-js/react"
import { cn } from "@/lib/utils"

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("relative group flex flex-col min-h-fit", className)} {...props}>
      {/* 
        To fix the corner radius problem with borders, we use an inset box-shadow 
        instead of a standard CSS border. Standard borders on clipped elements 
        often look jagged or misaligned at the corners.
      */}
      <Squircle
        cornerRadius={20}
        cornerSmoothing={1}
        className="absolute inset-0 bg-card shadow-[inset_0_0_0_1.5px_var(--border)] group-data-[selected=true]:shadow-[inset_0_0_0_2.5px_var(--primary)] transition-all duration-200"
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
