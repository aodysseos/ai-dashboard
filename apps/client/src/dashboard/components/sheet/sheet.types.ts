import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { VariantProps } from "class-variance-authority"

// Base sheet types
export type SheetProps = React.ComponentProps<typeof SheetPrimitive.Root>
export type SheetTriggerProps = React.ComponentProps<typeof SheetPrimitive.Trigger>
export type SheetCloseProps = React.ComponentProps<typeof SheetPrimitive.Close>
export type SheetPortalProps = React.ComponentProps<typeof SheetPrimitive.Portal>

// Overlay and content types
export type SheetOverlayProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
export type SheetContentProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & 
  VariantProps<typeof sheetVariants>

// Header and footer types
export type SheetHeaderProps = React.HTMLAttributes<HTMLDivElement>
export type SheetFooterProps = React.HTMLAttributes<HTMLDivElement>

// Title and description types
export type SheetTitleProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
export type SheetDescriptionProps = React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>

// Import the sheetVariants from styles
import { sheetVariants } from "./sheet.styles"
