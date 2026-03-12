import React from 'react';
import { cn } from '@/lib/utils';

export function PremiumTable({ children, className }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          {children}
        </table>
      </div>
    </div>
  );
}

export function PremiumTableHeader({ children }) {
  return (
    <thead className="bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/30">
      {children}
    </thead>
  );
}

export function PremiumTableRow({ children, className, onClick }) {
  return (
    <tr 
      className={cn(
        "border-b border-border/20 transition-all duration-200",
        onClick && "cursor-pointer hover:bg-muted/20",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function PremiumTableHead({ children, className }) {
  return (
    <th className={cn("px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70", className)}>
      {children}
    </th>
  );
}

export function PremiumTableCell({ children, className }) {
  return (
    <td className={cn("px-6 py-5 text-sm", className)}>
      {children}
    </td>
  );
}

export function PremiumTableBody({ children }) {
  return (
    <tbody>
      {children}
    </tbody>
  );
}