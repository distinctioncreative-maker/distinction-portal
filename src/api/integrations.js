import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    provider: row.provider,
    status: row.status,
    config: row.config || {},
    connectedAt: row.connected_at,
    lastSyncedAt: row.last_synced_at,
  };
}

export const integrationsApi = {
  list: async (orgId) => {
    const { data, error } = await supabase
      .from('integration_connections')
      .select('*')
      .eq('organization_id', orgId);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  connect: async (orgId, provider, config = {}) => {
    const { data, error } = await supabase
      .from('integration_connections')
      .upsert(
        { organization_id: orgId, provider, status: 'active', config, connected_at: new Date().toISOString() },
        { onConflict: 'organization_id,provider' }
      )
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  disconnect: async (orgId, provider) => {
    const { error } = await supabase
      .from('integration_connections')
      .delete()
      .eq('organization_id', orgId)
      .eq('provider', provider);
    if (error) throw error;
  },

  markSynced: async (orgId, provider) => {
    const { error } = await supabase
      .from('integration_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('organization_id', orgId)
      .eq('provider', provider);
    if (error) throw error;
  },
};
