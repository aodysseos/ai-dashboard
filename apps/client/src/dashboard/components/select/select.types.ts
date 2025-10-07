import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"

// Base select types
export type SelectProps = React.ComponentProps<typeof SelectPrimitive.Root>
export type SelectGroupProps = React.ComponentProps<typeof SelectPrimitive.Group>
export type SelectValueProps = React.ComponentProps<typeof SelectPrimitive.Value>

// Trigger and content types
export type SelectTriggerProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
export type SelectContentProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>

// Scroll button types
export type SelectScrollUpButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
export type SelectScrollDownButtonProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>

// Item types
export type SelectLabelProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
export type SelectItemProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
export type SelectSeparatorProps = React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
