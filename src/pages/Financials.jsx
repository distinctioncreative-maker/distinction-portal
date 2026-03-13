import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Target } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, subDays } from 'date-fns';

export default function Financials() {
  const { activeOrgId } = useOrg();

  const { data: metrics } = useQuery({
    queryKey: ['dailyMetrics', activeOrgId],
    queryFn: () => activeOrgId ? base44.entities.DailyMetric.filter({ organizationId: activeOrgId }, '-date', 90) : [],
    initialData: [],
  });

  const latestMetric = metrics[0] || {};
  const chartData = metrics.slice(0, 30).reverse().map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    revenue: m.revenueDaily || 0,
    profit: m.profitDaily || 0,
  }));

  const totalRevenue = latestMetric.revenueYTD || 0;
  const totalProfit = latestMetric.profitYTD || 0;
  const monthlyRevenue = latestMetric.revenueMTD || 0;
  const monthlyProfit = latestMetric.profitMTD || 0;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,83,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 shadow-lg shadow-accent/5">
                  <DollarSign className="w-7 h-7 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Financials</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">Comprehensive financial overview and analytics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">YTD Revenue</p>
                <p className="text-3xl font-bold tracking-tight mt-2">${(totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>MTD: ${(monthlyRevenue / 1000).toFixed(1)}k</span>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">YTD Profit</p>
                <p className="text-3xl font-bold tracking-tight mt-2">${(totalProfit / 1000).toFixed(1)}k</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <PiggyBank className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span>MTD: ${(monthlyProfit / 1000).toFixed(1)}k</span>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Profit Margin</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{profitMargin}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">Industry avg: 15-20%</p>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Daily Avg Revenue</p>
                <p className="text-3xl font-bold tracking-tight mt-2">${((latestMetric.revenueDaily || 0) / 1000).toFixed(1)}k</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <TrendingUp className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">Last recorded day</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-base font-bold">Revenue Trend (30 Days)</CardTitle>
              <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Daily Performance</p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-base font-bold">Profit vs Revenue (30 Days)</CardTitle>
              <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Comparison</p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="profit" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}