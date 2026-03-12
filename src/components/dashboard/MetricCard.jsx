import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend, trendLabel, className }) {
  const trendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const TrendIcon = trendIcon;
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-muted-foreground/70';

  return (
    <Card className={cn('p-6 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300 border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden relative group', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-accent/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/70">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground/80">{subtitle}</p>}
          </div>
          {Icon && (
            <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 shadow-lg shadow-accent/5 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-5 h-5 text-accent" />
            </div>
          )}
        </div>
        {trendLabel && (
          <div className={cn('flex items-center gap-2 mt-4 pt-4 border-t border-border/30 text-xs font-semibold', trendColor)}>
            <TrendIcon className="w-4 h-4" />
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
    </Card>
  );
}