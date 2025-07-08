import * as React from "react"

import { cn } from "@/app/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "px-8 pr-8 py-5 text-sm w-full bg-[#2a2a2a] text-[#f1f1f1] border border-[#333] rounded-md outline-none placeholder:text-[#888] hover:border-[#1db954] hover:border-3 focus:border-[#1db954] active:border-[#1db954] transition-all",
        "file:text-foreground selection:bg-primary selection:text-primary-foreground flex h-9 min-w-0 shadow-xs transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#1db954] focus-visible:ring-[#1db954]/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
