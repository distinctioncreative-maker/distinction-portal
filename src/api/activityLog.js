import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    entityType: row.entity_type,
    entityId: row.entity_id,
    action: row.action,
    description: row.description,
    userId: row.user_id,
    userEmail: row.user_email,
    created_date: row.created_date,
  };
}

export const activityLogApi = {
  listForOrg: async (orgId, limit = 100) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  listForEntity: async (entityId, orgId, limit = 50) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('entity_id', entityId)
      .eq('organization_id', orgId)
      .order('created_date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },
};
