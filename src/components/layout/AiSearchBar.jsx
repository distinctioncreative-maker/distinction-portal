import React, { useState } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { askAI } from '@/lib/ai';
import { leadsApi } from '@/api/leads';
import { tasksApi } from '@/api/tasks';
import { appointmentsApi } from '@/api/appointments';
import { useOrg } from '../OrgContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AiSearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const { activeOrgId } = useOrg();

  const handleSearch = async () => {
    if (!query.trim() || !activeOrgId) return;

    setIsSearching(true);
    try {
      const [leads, tasks, appointments] = await Promise.all([
        leadsApi.list(activeOrgId),
        tasksApi.list(activeOrgId),
        appointmentsApi.list(activeOrgId),
      ]);

      const q = query.toLowerCase();
      const matchedLeads = leads.filter(l =>
        l.fullName?.toLowerCase().includes(q) ||
        l.firstName?.toLowerCase().includes(q) ||
        l.lastName?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q)
      );
      const matchedTasks = tasks.filter(t =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
      const matchedAppts = appointments.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
      );

      const prompt = `You are a helpful business intelligence assistant for Distinction OS, a business CRM.
Analyze this search query: "${query}"

Available CRM data:
- Total Leads: ${leads.length} (${matchedLeads.length} matching)
- Total Tasks: ${tasks.length} (${matchedTasks.length} matching)
- Total Appointments: ${appointments.length} (${matchedAppts.length} matching)
${matchedLeads.length > 0 ? `Matched leads: ${matchedLeads.slice(0, 3).map(l => l.fullName || `${l.firstName} ${l.lastName}`).join(', ')}` : ''}
${matchedTasks.length > 0 ? `Matched tasks: ${matchedTasks.slice(0, 3).map(t => t.title).join(', ')}` : ''}

Provide a concise, actionable response (2-3 sentences) that acknowledges what was found and suggests next steps. Professional, executive tone.`;

      const message = await askAI(prompt);

      setResults({
        type: 'ai',
        message,
        leads: matchedLeads.slice(0, 5),
        tasks: matchedTasks.slice(0, 5),
        appointments: matchedAppts.slice(0, 5),
      });
    } catch (error) {
      setResults({
        type: 'error',
        message: error.message?.includes('Ollama') || error.message?.includes('Local model')
          ? 'Local AI model unavailable. Make sure Ollama is running: `ollama serve`'
          : 'Unable to process search. Please try again.',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl',
          'bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-xl',
          'border border-border/40 hover:border-accent/30',
          'transition-all duration-500 hover:shadow-lg hover:shadow-accent/5',
          'w-[320px]'
        )}
      >
        <Search className="w-4 h-4 text-muted-foreground/60 group-hover:text-accent/60 transition-colors duration-300" />
        <span className="text-sm text-muted-foreground/60 group-hover:text-foreground/60 transition-colors duration-300">
          Search or ask anything...
        </span>
        <Sparkles className="ml-auto w-3.5 h-3.5 text-accent/40 group-hover:text-accent/70 transition-all duration-300 group-hover:rotate-12" />
      </button>

      <Dialog open={isOpen} onOpenChange={(o) => { setIsOpen(o); if (!o) { setResults(null); setQuery(''); } }}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden p-0 gap-0 bg-background/95 backdrop-blur-2xl border-border/50">
          <div className="sticky top-0 z-10 bg-gradient-to-b from-background via-background to-background/50 backdrop-blur-xl border-b border-border/30 p-6 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center shadow-lg shadow-accent/10">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">AI-Powered Search</h2>
                <p className="text-xs text-muted-foreground">Search records or ask questions about your data</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Find leads, tasks, or ask anything..."
                className="pl-11 pr-24 h-12 rounded-xl bg-muted/30 border-border/40 focus-visible:ring-accent/30 text-base"
                autoFocus
              />
              <Button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                size="sm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-lg"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
              </Button>
            </div>
          </div>

          <div className="overflow-y-auto p-6 pt-4">
            <AnimatePresence mode="wait">
              {results && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {results.type === 'ai' && (
                    <>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-accent/5 to-accent/[0.02] border border-accent/10">
                        <p className="text-sm leading-relaxed text-foreground/80">{results.message}</p>
                      </div>
                      {results.leads?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Matched Leads</h3>
                          <div className="space-y-2">
                            {results.leads.map(lead => (
                              <div key={lead.id} className="p-3 rounded-lg bg-card border border-border/50 hover:bg-muted/30 transition-colors">
                                <p className="text-sm font-medium">{lead.fullName || `${lead.firstName} ${lead.lastName}`}</p>
                                <p className="text-xs text-muted-foreground">{lead.email}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {results.tasks?.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Matched Tasks</h3>
                          <div className="space-y-2">
                            {results.tasks.map(task => (
                              <div key={task.id} className="p-3 rounded-lg bg-card border border-border/50 hover:bg-muted/30 transition-colors">
                                <p className="text-sm font-medium">{task.title}</p>
                                <p className="text-xs text-muted-foreground capitalize">{task.status}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {results.type === 'error' && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20">
                      <p className="text-sm text-destructive">{results.message}</p>
                    </div>
                  )}
                </motion.div>
              )}
              {!results && !isSearching && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <Sparkles className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">Start typing to search or ask a question</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
