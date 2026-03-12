import React from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ metrics }) {
  const data = (metrics || []).slice(-14).map(m => ({
    date: m.date?.split('-').slice(1).join('/') || '',
    revenue: m.revenueDaily || 0,
    profit: m.profitDaily || 0,
  }));

  return (
    <Card className="p-8 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 group overflow-hidden relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/[0.02] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-1">Performance Trend</h3>
            <p className="text-xs text-muted-foreground/70">14-day revenue & profit analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-accent shadow-lg shadow-accent/50" />
              <span className="text-xs font-semibold text-accent">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="text-xs font-semibold text-emerald-400">Profit</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(40, 100%, 70%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(40, 100%, 70%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 71%, 55%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(142, 71%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="none" />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="none" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: '13px',
                  padding: '12px',
                  backdropFilter: 'blur(20px)',
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(40, 100%, 70%)" fill="url(#revGrad)" strokeWidth={3} />
              <Area type="monotone" dataKey="profit" stroke="hsl(142, 71%, 55%)" fill="url(#profGrad)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}