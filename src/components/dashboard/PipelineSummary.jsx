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
    <Card className="p-5">
      <h3 className="text-sm font-semibold mb-4">Pipeline Overview</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
            />
            <Bar dataKey="value" fill="hsl(43, 74%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {data.slice(0, 3).map(d => (
          <div key={d.name} className="text-center p-2 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground">{d.name}</p>
            <p className="text-sm font-semibold">{d.count} deals</p>
          </div>
        ))}
      </div>
    </Card>
  );
}