import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-slate-200 bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-950 placeholder:text-slate-500 focus-visible:border-slate-950 focus-visible:ring-3 focus-visible:ring-slate-950/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-slate-200/50 disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-500/20 md:text-sm dark:bg-slate-200/30 dark:disabled:bg-slate-200/80 dark:aria-invalid:border-red-500/50 dark:aria-invalid:ring-red-500/40 dark:border-slate-800 dark:file:text-slate-50 dark:placeholder:text-slate-400 dark:focus-visible:border-slate-300 dark:focus-visible:ring-slate-300/50 dark:disabled:bg-slate-800/50 dark:aria-invalid:border-red-900 dark:aria-invalid:ring-red-900/20 dark:dark:bg-slate-800/30 dark:dark:disabled:bg-slate-800/80 dark:dark:aria-invalid:border-red-900/50 dark:dark:aria-invalid:ring-red-900/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
