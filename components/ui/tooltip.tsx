'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'

function TooltipProvider({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider {...props} />
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root {...props} />
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger {...props} />
}

function TooltipContent({ className, sideOffset = 6, ...props }: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Content
      className={cn(
        'z-50 overflow-hidden rounded-md bg-popover px-2 py-1.5 text-xs text-popover-foreground shadow-md border',
        'data-[state=delayed-open]:data-[side=top]:animate-in data-[state=delayed-open]:data-[side=bottom]:animate-in',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=delayed-open]:fade-in-0',
        className,
      )}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }


