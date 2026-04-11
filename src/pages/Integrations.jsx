import React, { useState, useCallback } from 'react';
import { integrationsApi } from '@/api/integrations';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrg } from '@/components/OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plug, CheckCircle2, AlertCircle, RefreshCw, Unplug, ExternalLink } from 'lucide-react';
import { usePlaidLink } from 'react-plaid-link';
import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';
import { format } from 'date-fns';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const INTEGRATIONS_CATALOG = [
  {
    id: 'plaid',
    name: 'Plaid',
    category: 'Financial',
    description: 'Connect bank accounts and credit cards. Automatically sync transactions to your Financials dashboard.',
    color: 'from-emerald-500/10 to-emerald-500/5',
    border: 'border-emerald-500/20',
    icon: '🏦',
    badge: 'Auto-sync',
    badgeColor: 'bg-emerald-500/10 text-emerald-400',
    docsUrl: 'https://plaid.com/docs/',
    setupRequired: 'PLAID_CLIENT_ID + PLAID_SECRET (sandbox free at plaid.com)',
  },
  {
    id: 'square',
    name: 'Square',
    category: 'POS',
    description: 'Import sales data, transactions, and inventory from Square. Auto-populate daily revenue metrics.',
    color: 'from-blue-500/10 to-blue-500/5',
    border: 'border-blue-500/20',
    icon: '⬛',
    badge: 'Coming Soon',
    badgeColor: 'bg-muted/50 text-muted-foreground',
    comingSoon: true,
  },
  {
    id: 'toast',
    name: 'Toast',
    category: 'POS',
    description: 'Sync restaurant POS data, orders, and sales into your financial reporting.',
    color: 'from-orange-500/10 to-orange-500/5',
    border: 'border-orange-500/20',
    icon: '🍞',
    badge: 'Coming Soon',
    badgeColor: 'bg-muted/50 text-muted-foreground',
    comingSoon: true,
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    category: 'Marketing',
    description: 'Pull ad spend, ROAS, impressions, and conversions from your Facebook and Instagram campaigns.',
    color: 'from-violet-500/10 to-violet-500/5',
    border: 'border-violet-500/20',
    icon: '📘',
    badge: 'Coming Soon',
    badgeColor: 'bg-muted/50 text-muted-foreground',
    comingSoon: true,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'CRM',
    description: 'Bidirectional lead sync between Distinction OS and Salesforce. Keep both systems in lockstep.',
    color: 'from-sky-500/10 to-sky-500/5',
    border: 'border-sky-500/20',
    icon: '☁️',
    badge: 'Coming Soon',
    badgeColor: 'bg-muted/50 text-muted-foreground',
    comingSoon: true,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'Payments',
    description: 'Sync payment data, subscriptions, and MRR from Stripe directly into your financial dashboard.',
    color: 'from-indigo-500/10 to-indigo-500/5',
    border: 'border-indigo-500/20',
    icon: '💳',
    badge: 'Coming Soon',
    badgeColor: 'bg-muted/50 text-muted-foreground',
    comingSoon: true,
  },
];

// ── Plaid Connect Component ──────────────────────────────────────────────────
function PlaidConnectButton({ orgId, userId, onSuccess }) {
  const [linkToken, setLinkToken] = useState(null);
  const [fetching, setFetching] = useState(false);

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => { const { data } = await supabase.auth.getSession(); return data.session; },
  });

  const fetchLinkToken = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/plaid-link-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ userId, orgId }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLinkToken(data.link_token);
    } catch (err) {
      toast.error(err.message?.includes('credentials not configured')
        ? 'Plaid not configured yet. Add PLAID_CLIENT_ID + PLAID_SECRET to Supabase secrets.'
        : `Plaid error: ${err.message}`);
    } finally {
      setFetching(false);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken, metadata) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/plaid-exchange`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ publicToken, orgId }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        toast.success('Bank account connected successfully');
        onSuccess();
      } catch (err) {
        toast.error(`Failed to connect: ${err.message}`);
      }
    },
    onExit: () => setLinkToken(null),
  });

  const handleClick = async () => {
    if (linkToken && ready) {
      open();
    } else {
      await fetchLinkToken();
    }
  };

  // Auto-open once we have a token
  React.useEffect(() => {
    if (linkToken && ready) open();
  }, [linkToken, ready]);

  return (
    <Button onClick={handleClick} disabled={fetching} size="sm" className="rounded-xl">
      {fetching ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plug className="w-4 h-4 mr-2" />}
      Connect Bank
    </Button>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function Integrations() {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: connections } = useQuery({
    queryKey: ['integrations', activeOrgId],
    queryFn: () => activeOrgId ? integrationsApi.list(activeOrgId) : [],
    enabled: !!activeOrgId,
    initialData: [],
  });

  const disconnectMut = useMutation({
    mutationFn: (provider) => integrationsApi.disconnect(activeOrgId, provider),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration disconnected');
    },
    onError: () => toast.error('Failed to disconnect'),
  });

  const connectedMap = Object.fromEntries(connections.map(c => [c.provider, c]));

  const categories = [...new Set(INTEGRATIONS_CATALOG.map(i => i.category))];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative px-8 pt-12 pb-10 border-b border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,168,83,0.05),transparent_50%)]" />
        <div className="relative max-w-[90rem] mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 shadow-lg">
                <Plug className="w-7 h-7 text-violet-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">Integrations</h1>
                <p className="text-base text-muted-foreground/80 mt-1.5">Connect your tools and automate data sync</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{connections.length} connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8 max-w-[90rem] mx-auto space-y-10">
        {categories.map(category => (
          <div key={category}>
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {INTEGRATIONS_CATALOG.filter(i => i.category === category).map(integration => {
                const connection = connectedMap[integration.id];
                const isConnected = !!connection;

                return (
                  <Card
                    key={integration.id}
                    className={`p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl hover:shadow-2xl hover:shadow-black/10 transition-all duration-300 ${integration.comingSoon ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${integration.color} border ${integration.border} flex items-center justify-center text-2xl`}>
                          {integration.icon}
                        </div>
                        <div>
                          <p className="font-bold text-base">{integration.name}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${integration.badgeColor}`}>
                            {isConnected ? '● Connected' : integration.badge}
                          </span>
                        </div>
                      </div>
                      {isConnected && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground/80 leading-relaxed mb-4">{integration.description}</p>

                    {isConnected && connection.lastSyncedAt && (
                      <p className="text-[10px] text-muted-foreground/50 mb-4">
                        Last synced {format(new Date(connection.lastSyncedAt), 'MMM d, h:mm a')}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      {integration.comingSoon ? (
                        <Button variant="outline" size="sm" disabled className="rounded-xl text-xs">Coming Soon</Button>
                      ) : isConnected ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => disconnectMut.mutate(integration.id)}
                          disabled={disconnectMut.isPending}
                        >
                          <Unplug className="w-3.5 h-3.5 mr-1.5" /> Disconnect
                        </Button>
                      ) : integration.id === 'plaid' ? (
                        <PlaidConnectButton
                          orgId={activeOrgId}
                          userId={user?.id}
                          onSuccess={() => qc.invalidateQueries({ queryKey: ['integrations'] })}
                        />
                      ) : (
                        <Button size="sm" className="rounded-xl text-xs" disabled>
                          <Plug className="w-3.5 h-3.5 mr-1.5" /> Connect
                        </Button>
                      )}

                      {integration.docsUrl && (
                        <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="rounded-xl text-xs text-muted-foreground">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>

                    {!integration.comingSoon && !isConnected && integration.setupRequired && (
                      <p className="text-[10px] text-muted-foreground/40 mt-3">
                        Requires: {integration.setupRequired}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
