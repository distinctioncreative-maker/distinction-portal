import React from 'react';
import { dailyMetricsApi } from '@/api/dailyMetrics';
import { useQuery } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Phone, Target, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

export default function Metrics() {
  const { activeOrgId } = useOrg();

  const { data: metrics } = useQuery({
    queryKey: ['dailyMetrics', activeOrgId],
    queryFn: () => activeOrgId ? dailyMetricsApi.list(activeOrgId, 90) : [],
    initialData: [],
  });

  const latestMetric = metrics[0] || {};
  const chartData = metrics.slice(0, 30).reverse().map(m => ({
    date: format(new Date(m.date), 'MMM d'),
    leads: m.leadsDaily || 0,
    calls: m.bookedCallsDaily || 0,
    conversion: m.conversionRateDaily || 0,
  }));

  const totalLeadsYTD = latestMetric.leadsYTD || 0;
  const totalLeadsMTD = latestMetric.leadsMTD || 0;
  const totalCallsYTD = latestMetric.bookedCallsYTD || 0;
  const totalCallsMTD = latestMetric.bookedCallsMTD || 0;
  const avgConversion = latestMetric.conversionRateDaily || 0;

  return (
    <div className="min-h-screen">
      {/* Premium Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 shadow-lg shadow-violet-500/5">
                  <TrendingUp className="w-7 h-7 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Key Metrics</h1>
                  <p className="text-base text-muted-foreground/80 mt-1.5">Performance analytics and business intelligence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">YTD Leads</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{totalLeadsYTD}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span>MTD: {totalLeadsMTD}</span>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">YTD Booked Calls</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{totalCallsYTD}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                <Phone className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>MTD: {totalCallsMTD}</span>
            </div>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Conversion Rate</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{avgConversion.toFixed(1)}%</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                <Target className="w-5 h-5 text-violet-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">Industry avg: 2-5%</p>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/70">Daily Leads</p>
                <p className="text-3xl font-bold tracking-tight mt-2">{latestMetric.leadsDaily || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground/70">Last recorded day</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-base font-bold">Lead Generation (30 Days)</CardTitle>
              <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Daily New Leads</p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="leads" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorLeads)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-base font-bold">Leads vs Booked Calls (30 Days)</CardTitle>
              <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Performance Comparison</p>
            </CardHeader>
            <CardContent className="p-0">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="leads" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="calls" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Rate Chart */}
        <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-base font-bold">Conversion Rate Trend (30 Days)</CardTitle>
            <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-[0.15em]">Daily Conversion Performance</p>
          </CardHeader>
          <CardContent className="p-0">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line type="monotone" dataKey="conversion" stroke="hsl(var(--chart-4))" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}