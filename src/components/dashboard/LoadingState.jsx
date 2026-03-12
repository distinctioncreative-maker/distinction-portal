import React from 'react';
import { Card } from '@/components/ui/card';

export default function LoadingState({ rows = 3 }) {
  return (
    <Card className="p-6 space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          <div className="h-4 bg-muted/50 rounded-lg w-1/3" />
          <div className="h-8 bg-muted/50 rounded-lg w-full" />
        </div>
      ))}
    </Card>
  );
}