import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    supportUserId: row.support_user_id,
    organizationId: row.organization_id,
    reason: row.reason,
    mode: row.mode,
    status: row.status,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdDate: row.created_date,
  };
}

export const supportSessionsApi = {
  list: async (limit = 100) => {
    const { data, error } = await supabase
      .from('support_sessions')
      .select('*')
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  listForUser: async (userId, limit = 10) => {
    const { data, error } = await supabase
      .from('support_sessions')
      .select('*')
      .eq('support_user_id', userId)
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  create: async ({ supportUserId, organizationId, reason, mode = 'read' }) => {
    const { data, error } = await supabase
      .from('support_sessions')
      .insert({ support_user_id: supportUserId, organization_id: organizationId, reason, mode, status: 'active' })
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  end: async (sessionId) => {
    const { error } = await supabase
      .from('support_sessions')
      .update({ status: 'ended', ended_at: new Date().toISOString() })
      .eq('id', sessionId);
    if (error) throw error;
  },
};
