import { supabase } from '@/lib/supabaseClient';

function fromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    organizationId: row.organization_id,
    date: row.date,
    revenueDaily: row.revenue_daily,
    revenueMTD: row.revenue_mtd,
    revenueYTD: row.revenue_ytd,
    profitDaily: row.profit_daily,
    profitMTD: row.profit_mtd,
    profitYTD: row.profit_ytd,
    leadsDaily: row.leads_daily,
    leadsMTD: row.leads_mtd,
    leadsYTD: row.leads_ytd,
    bookedCallsDaily: row.booked_calls_daily,
    bookedCallsMTD: row.booked_calls_mtd,
    bookedCallsYTD: row.booked_calls_ytd,
    conversionRateDaily: row.conversion_rate_daily,
  };
}

export const dailyMetricsApi = {
  list: async (orgId, limit = 90) => {
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('organization_id', orgId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map(fromDb);
  },

  upsert: async (orgId, date, metrics) => {
    const fieldMap = {
      revenueDaily: 'revenue_daily', revenueMTD: 'revenue_mtd', revenueYTD: 'revenue_ytd',
      profitDaily: 'profit_daily', profitMTD: 'profit_mtd', profitYTD: 'profit_ytd',
      leadsDaily: 'leads_daily', leadsMTD: 'leads_mtd', leadsYTD: 'leads_ytd',
      bookedCallsDaily: 'booked_calls_daily', bookedCallsMTD: 'booked_calls_mtd', bookedCallsYTD: 'booked_calls_ytd',
      conversionRateDaily: 'conversion_rate_daily',
    };
    const dbData = { organization_id: orgId, date };
    for (const [k, v] of Object.entries(metrics)) {
      dbData[fieldMap[k] ?? k] = v;
    }
    const { data, error } = await supabase
      .from('daily_metrics')
      .upsert(dbData, { onConflict: 'organization_id,date' })
      .select()
      .single();
    if (error) throw error;
    return fromDb(data);
  },
};
