import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    type: row.type,
    status: row.status,
    startAt: row.start_at,
    endAt: row.end_at,
    location: row.location,
    description: row.description,
    assignedToUserId: row.assigned_to_user_id,
    leadId: row.lead_id,
    created_date: row.created_date,
  };
}

function toDb(data) {
  const fieldMap = {
    organizationId: 'organization_id',
    startAt: 'start_at',
    endAt: 'end_at',
    assignedToUserId: 'assigned_to_user_id',
    leadId: 'lead_id',
  };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    const dbKey = fieldMap[k] ?? k;
    result[dbKey] = v === '' ? null : v;
  }
  return result;
}

export const appointmentsApi = {
  list: async (orgId, limit = 200) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('organization_id', orgId)
      .order('start_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  listForLead: async (leadId, orgId) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('lead_id', leadId)
      .eq('organization_id', orgId)
      .order('start_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  create: async (data) => {
    const { data: row, error } = await supabase
      .from('appointments')
      .insert(toDb(data))
      .select()
      .single();
    if (error) throw error;
    return fromDb(row);
  },

  update: async (id, data) => {
    const { data: row, error } = await supabase
      .from('appointments')
      .update(toDb(data))
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDb(row);
  },
};
