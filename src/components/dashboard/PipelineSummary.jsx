import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PipelineSummary({ stages, items }) {
  const data = (stages || []).sort((a, b) => a.order - b.order).map(stage => {
    const stageItems = (items || []).filter(i => i.stageId === stage.id && i.status === 'active');
    return {
      name: stage.name,
      value: stageItems.reduce((sum, i) => sum + (i.value || 0), 0),
      count: stageItems.length,
    };
  });

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-base font-bold tracking-tight mb-1">Pipeline Health</h3>
        <p className="text-xs text-muted-foreground/70">Active deals by stage</p>
      </div>
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} stroke="none" />
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
              formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Bar dataKey="value" fill="hsl(40, 100%, 70%)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-6 pt-6 border-t border-border/30">
        {data.slice(0, 3).map(d => (
          <div key={d.name} className="text-center p-3 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 hover:from-muted/70 hover:to-muted/30 transition-colors">
            <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-1">{d.name}</p>
            <p className="text-lg font-bold">{d.count}</p>
            <p className="text-[9px] text-muted-foreground/60">deals</p>
          </div>
        ))}
      </div>
    </Card>
  );
}