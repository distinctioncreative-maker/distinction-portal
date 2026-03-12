import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <Card className="p-12 text-center border-dashed border-2 border-border/50 bg-gradient-to-br from-muted/20 to-transparent">
      <div className="max-w-sm mx-auto space-y-4">
        {Icon && (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 flex items-center justify-center mx-auto">
            <Icon className="w-8 h-8 text-accent/70" />
          </div>
        )}
        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action && onAction && (
          <Button onClick={onAction} size="sm" className="mt-4">
            {action}
          </Button>
        )}
      </div>
    </Card>
  );
}