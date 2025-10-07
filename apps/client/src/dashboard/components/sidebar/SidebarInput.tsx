import * as React from "react"
import { Input } from "../input"
import { cn } from "../../../common/lib/utils"
import { SidebarInputProps } from "./sidebar.types"

const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  SidebarInputProps
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

export { SidebarInput }
