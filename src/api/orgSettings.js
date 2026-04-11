import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    pipelineEnabled: row.pipeline_enabled,
    calendarEnabled: row.calendar_enabled,
    crmEnabled: row.crm_enabled,
    revenueTrackingEnabled: row.revenue_tracking_enabled,
    chatbotEnabled: row.chatbot_enabled,
    whatsappAssistantEnabled: row.whatsapp_assistant_enabled,
    aiInsightsEnabled: row.ai_insights_enabled,
  };
}

const keyMap = {
  pipelineEnabled: 'pipeline_enabled',
  calendarEnabled: 'calendar_enabled',
  crmEnabled: 'crm_enabled',
  revenueTrackingEnabled: 'revenue_tracking_enabled',
  chatbotEnabled: 'chatbot_enabled',
  whatsappAssistantEnabled: 'whatsapp_assistant_enabled',
  aiInsightsEnabled: 'ai_insights_enabled',
};

export const orgSettingsApi = {
  get: async (orgId) => {
    const { data, error } = await supabase
      .from('organization_settings')
      .select('*')
      .eq('organization_id', orgId)
      .maybeSingle();
    if (error) throw error;
    return fromDb(data);
  },

  upsert: async (orgId, updates) => {
    const dbUpdates = { organization_id: orgId };
    for (const [k, v] of Object.entries(updates)) {
      const dbKey = keyMap[k] ?? k;
      dbUpdates[dbKey] = v;
    }
    const { data, error } = await supabase
      .from('organization_settings')
      .upsert(dbUpdates, { onConflict: 'organization_id' })
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },
};

function orgFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    isActive: row.is_active,
    planType: row.plan_type,
    businessType: row.business_type,
    timezone: row.timezone,
    createdDate: row.created_at || row.created_date,
  };
}

export const organizationsApi = {
  listAll: async (limit = 200) => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(orgFromDb);
  },

  create: async ({ name, businessType, planType }) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('organizations')
      .insert({ name, slug, business_type: businessType, plan_type: planType, status: 'trial', is_active: true })
      .select()
      .single();
    if (error) throw error;
    return orgFromDb(data);
  },

  toggleStatus: async (org) => {
    const newActive = !org.isActive;
    const { error } = await supabase
      .from('organizations')
      .update({ is_active: newActive, status: newActive ? 'active' : 'inactive' })
      .eq('id', org.id);
    if (error) throw error;
  },

  update: async (orgId, data) => {
    const fieldMap = {
      name: 'name',
      businessType: 'business_type',
      timezone: 'timezone',
      primaryColor: 'primary_color',
    };
    const dbData = {};
    for (const [k, v] of Object.entries(data)) {
      dbData[fieldMap[k] ?? k] = v;
    }
    const { data: row, error } = await supabase
      .from('organizations')
      .update(dbData)
      .eq('id', orgId)
      .select()
      .single();
    if (error) throw error;
    return row;
  },
};
