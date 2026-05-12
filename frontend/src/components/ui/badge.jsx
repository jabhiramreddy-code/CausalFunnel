import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/20 text-primary',
        click: 'border-transparent bg-blue-500/20 text-blue-400 border-blue-500/30',
        page_view: 'border-transparent bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        outline: 'border-border text-muted-foreground',
        destructive: 'border-transparent bg-destructive/20 text-red-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
