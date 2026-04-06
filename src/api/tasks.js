import { supabase } from '@/lib/supabaseClient';

function toDb(data) {
  const fieldMap = {
    organizationId: 'organization_id',
    relatedLeadId: 'related_lead_id',
    assignedToUserId: 'assigned_to_user_id',
    createdByUserId: 'created_by_user_id',
    dueAt: 'due_at',
  };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    // Coerce empty strings to null for uuid/timestamptz columns to avoid Postgres type errors.
    const dbKey = fieldMap[k] ?? k;
    result[dbKey] = v === '' ? null : v;
  }
  return result;
}

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueAt: row.due_at,
    relatedLeadId: row.related_lead_id,
    assignedToUserId: row.assigned_to_user_id,
    createdByUserId: row.created_by_user_id,
    created_date: row.created_date,
  };
}

export const tasksApi = {
  list: async (orgId, filters = {}) => {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_date', { ascending: false })
      .limit(200);

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.relatedLeadId) query = query.eq('related_lead_id', filters.relatedLeadId);

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  get: async (id, orgId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  create: async (payload) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert(toDb(payload))
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...toDb(payload), updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },
};
