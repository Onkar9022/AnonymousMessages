"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // Use CSS custom properties instead of undefined Tailwind theme colors.
        // Tailwind arbitrary value syntax (bg-[var(--...)] ) ensures the
        // generated CSS uses the CSS variables defined in globals.css.
        "peer data-[state=checked]:bg-[var(--primary)] data-[state=unchecked]:bg-[var(--input)] focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-[var(--input)]/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Thumb uses CSS variables for bg colors so dark/light themes apply.
          "bg-[var(--background)] dark:data-[state=unchecked]:bg-[var(--foreground)] dark:data-[state=checked]:bg-[var(--primary-foreground)] pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
