import { supabase } from '@/lib/supabaseClient';

// Map camelCase frontend fields to snake_case DB columns.
function toDb(data) {
  const fieldMap = {
    organizationId: 'organization_id',
    firstName: 'first_name',
    lastName: 'last_name',
    fullName: 'full_name',
    valueEstimate: 'value_estimate',
    nextFollowUpAt: 'next_follow_up_at',
    createdBy: 'created_by',
  };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    result[fieldMap[k] ?? k] = v;
  }
  return result;
}

// Map snake_case DB row to camelCase frontend shape.
function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    firstName: row.first_name,
    lastName: row.last_name,
    fullName: row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim(),
    email: row.email,
    phone: row.phone,
    status: row.status,
    source: row.source,
    valueEstimate: row.value_estimate,
    notes: row.notes,
    tags: row.tags || [],
    nextFollowUpAt: row.next_follow_up_at,
    created_date: row.created_date,
  };
}

export const leadsApi = {
  list: async (orgId) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_date', { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  get: async (id, orgId) => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('organization_id', orgId)
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  create: async (payload) => {
    const { data, error } = await supabase
      .from('leads')
      .insert(toDb(payload))
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },

  update: async (id, payload) => {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...toDb(payload), updated_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },
};
