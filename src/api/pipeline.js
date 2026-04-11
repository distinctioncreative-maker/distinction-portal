import { supabase } from '@/lib/supabaseClient';

// ── PipelineStage helpers ────────────────────────────────────────────────────

function stageToDb(data) {
  const fieldMap = { organizationId: 'organization_id' };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    result[fieldMap[k] ?? k] = v === '' ? null : v;
  }
  return result;
}

function stageFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    color: row.color,
    order: row.order,
    created_date: row.created_date,
  };
}

// ── PipelineItem helpers ─────────────────────────────────────────────────────

function itemToDb(data) {
  const fieldMap = {
    organizationId: 'organization_id',
    stageId: 'stage_id',
    leadId: 'lead_id',
    ownerUserId: 'owner_user_id',
    nextAction: 'next_action',
    expectedCloseDate: 'expected_close_date',
  };
  const result = {};
  for (const [k, v] of Object.entries(data)) {
    result[fieldMap[k] ?? k] = v === '' ? null : v;
  }
  return result;
}

function itemFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    stageId: row.stage_id,
    leadId: row.lead_id,
    title: row.title,
    value: row.value,
    probability: row.probability,
    status: row.status,
    notes: row.notes,
    nextAction: row.next_action,
    ownerUserId: row.owner_user_id,
    expectedCloseDate: row.expected_close_date,
    created_date: row.created_date,
  };
}

// ── Exported API ─────────────────────────────────────────────────────────────

export const pipelineApi = {
  stages: {
    list: async (orgId) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .eq('organization_id', orgId)
        .order('order', { ascending: true });
      if (error) throw error;
      return (data || []).map(stageFromDb);
    },

    create: async (payload) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert(stageToDb(payload))
        .select()
        .single();
      if (error) throw error;
      return stageFromDb(data);
    },

    update: async (id, payload) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update({ ...stageToDb(payload), updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return stageFromDb(data);
    },

    delete: async (id) => {
      const { error } = await supabase
        .from('pipeline_stages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  },

  items: {
    list: async (orgId) => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_date', { ascending: false });
      if (error) throw error;
      return (data || []).map(itemFromDb);
    },

    create: async (payload) => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .insert(itemToDb(payload))
        .select()
        .single();
      if (error) throw error;
      return itemFromDb(data);
    },

    update: async (id, payload) => {
      const { data, error } = await supabase
        .from('pipeline_items')
        .update({ ...itemToDb(payload), updated_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return itemFromDb(data);
    },
  },
};
