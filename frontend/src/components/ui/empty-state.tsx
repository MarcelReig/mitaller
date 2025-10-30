/**
 * EmptyState Component
 *
 * Componente reutilizable para mostrar estados vacíos con mensaje
 * amigable y CTA opcional.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<Package className="h-12 w-12" />}
 *   title="Sin productos todavía"
 *   description="Este artesano está preparando sus productos..."
 *   action={
 *     <Button asChild>
 *       <Link href="#portfolio">Ver portfolio</Link>
 *     </Button>
 *   }
 * />
 * ```
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      {/* Icono opcional */}
      {icon && (
        <div className="mb-4 text-muted-foreground opacity-50">
          {icon}
        </div>
      )}

      {/* Título */}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>

      {/* Descripción opcional */}
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Acción opcional (CTA) */}
      {action && <div>{action}</div>}
    </div>
  );
}
