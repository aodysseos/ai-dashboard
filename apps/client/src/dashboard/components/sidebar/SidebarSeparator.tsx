import * as React from "react"
import { Separator } from "../separator"
import { cn } from "../../../common/lib/utils"
import { SidebarSeparatorProps } from "./sidebar.types"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  SidebarSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

export { SidebarSeparator }
