import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    widgetKey: row.widget_key,
    isVisible: row.is_visible,
  };
}

export const widgetSettingsApi = {
  list: async (orgId, userId) => {
    const { data, error } = await supabase
      .from('widget_settings')
      .select('*')
      .eq('organization_id', orgId)
      .eq('user_id', userId);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  upsert: async (orgId, userId, widgetKey, isVisible) => {
    const { data, error } = await supabase
      .from('widget_settings')
      .upsert({ organization_id: orgId, user_id: userId, widget_key: widgetKey, is_visible: isVisible }, { onConflict: 'organization_id,user_id,widget_key' })
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },
};
