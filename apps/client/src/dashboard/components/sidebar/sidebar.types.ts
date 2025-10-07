import * as React from "react"

// Constants
export const SIDEBAR_COOKIE_NAME = "sidebar_state"
export const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
export const SIDEBAR_WIDTH = "16rem"
export const SIDEBAR_WIDTH_MOBILE = "18rem"
export const SIDEBAR_WIDTH_ICON = "3rem"
export const SIDEBAR_KEYBOARD_SHORTCUT = "b"

// Context Types
export type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

// Context
export const SidebarContext = React.createContext<SidebarContextProps | null>(null)

// Provider Props
export type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

// Component Props
export type SidebarProps = React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export type SidebarInsetProps = React.ComponentProps<"div">

export type SidebarContentProps = React.ComponentProps<"div">

export type SidebarHeaderProps = React.ComponentProps<"div">

export type SidebarFooterProps = React.ComponentProps<"div">

export type SidebarGroupProps = React.ComponentProps<"div">

export type SidebarGroupLabelProps = React.ComponentProps<"div"> & {
  asChild?: boolean
}

export type SidebarGroupContentProps = React.ComponentProps<"div">

export type SidebarGroupActionProps = React.ComponentProps<"button"> & {
  asChild?: boolean
}

export type SidebarMenuProps = React.ComponentProps<"ul">

export type SidebarMenuItemProps = React.ComponentProps<"li">

export type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}

export type SidebarMenuActionProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  showOnHover?: boolean
}

export type SidebarMenuBadgeProps = React.ComponentProps<"div">

export type SidebarMenuSkeletonProps = React.ComponentProps<"div"> & {
  showIcon?: boolean
}

export type SidebarMenuSubProps = React.ComponentProps<"ul">

export type SidebarMenuSubButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  size?: "sm" | "md"
}

export type SidebarMenuSubItemProps = React.ComponentProps<"li">

export type SidebarTriggerProps = React.ComponentProps<"button"> & {
  asChild?: boolean
}

export type SidebarRailProps = React.ComponentProps<"button">

export type SidebarInputProps = React.ComponentProps<typeof Input>

export type SidebarSeparatorProps = React.ComponentProps<typeof Separator>

// Variant Props - will be defined after importing the styles
export type SidebarMenuButtonVariants = {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
}
export type SidebarMenuSubButtonVariants = {
  size?: "sm" | "md"
}

// Import types that need to be imported from other files
import { TooltipContent } from "../tooltip"
import { Input } from "../input"
import { Separator } from "../separator"
