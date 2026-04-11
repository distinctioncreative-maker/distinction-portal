import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    leadId: row.lead_id,
    userId: row.user_id,
    content: row.content,
    noteType: row.note_type,
    created_date: row.created_date,
  };
}

function toDb(data) {
  const fieldMap = {
    organizationId: 'organization_id',
    leadId: 'lead_id',
    userId: 'user_id',
    noteType: 'note_type',
  };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    const dbKey = fieldMap[k] ?? k;
    result[dbKey] = v === '' ? null : v;
  }
  return result;
}

export const clientNotesApi = {
  listForLead: async (leadId, orgId) => {
    const { data, error } = await supabase
      .from('client_notes')
      .select('*')
      .eq('lead_id', leadId)
      .eq('organization_id', orgId)
      .order('created_date', { ascending: false });
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  create: async (data) => {
    const { data: row, error } = await supabase
      .from('client_notes')
      .insert(toDb(data))
      .select()
      .single();
    if (error) throw error;
    return fromDb(row);
  },
};
