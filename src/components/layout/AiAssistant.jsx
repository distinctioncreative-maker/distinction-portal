import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Loader2, ChevronDown, Bot } from 'lucide-react';
import { chatAI, aiProvider } from '@/lib/ai';
import { useOrg } from '../OrgContext';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dailyMetricsApi } from '@/api/dailyMetrics';
import { leadsApi } from '@/api/leads';
import { tasksApi } from '@/api/tasks';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const STARTER_PROMPTS = [
  'Summarize my business performance this month',
  'What leads need follow-up?',
  'What tasks are overdue?',
  'Give me a revenue forecast based on current leads',
];

function buildSystemPrompt({ org, metrics, leadCount, taskCount, openTaskCount }) {
  return `You are an AI business assistant embedded in Distinction OS — a business operating system for ${org?.name || 'a business'}. You help the user understand their CRM data, financials, and operations.

Current context:
- Organization: ${org?.name || 'Unknown'}
- Total leads in CRM: ${leadCount ?? '?'}
- Total tasks: ${taskCount ?? '?'} (${openTaskCount ?? '?'} open)
- Latest daily revenue: $${metrics?.revenueDaily ?? 0}
- MTD revenue: $${metrics?.revenueMTD ?? 0}
- YTD revenue: $${metrics?.revenueYTD ?? 0}

You are concise, professional, and action-oriented. Answer in 1-3 sentences unless a detailed breakdown is explicitly requested. Always speak as if you have full context of this business.`;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { activeOrgId, organization } = useOrg();
  const { user } = useAuth();

  const { data: metrics } = useQuery({
    queryKey: ['dailyMetrics', activeOrgId],
    queryFn: () => activeOrgId ? dailyMetricsApi.list(activeOrgId, 1) : [],
    enabled: !!activeOrgId,
    select: (data) => data[0] || null,
  });

  const { data: leads } = useQuery({
    queryKey: ['leads', activeOrgId],
    queryFn: () => activeOrgId ? leadsApi.list(activeOrgId) : [],
    enabled: !!activeOrgId,
    initialData: [],
  });

  const { data: tasks } = useQuery({
    queryKey: ['tasks', activeOrgId],
    queryFn: () => activeOrgId ? tasksApi.list(activeOrgId) : [],
    enabled: !!activeOrgId,
    initialData: [],
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const systemPrompt = buildSystemPrompt({
    org: organization,
    metrics,
    leadCount: leads.length,
    taskCount: tasks.length,
    openTaskCount: tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
  });

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || isThinking) return;

    setInput('');
    const newMessages = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setIsThinking(true);

    try {
      const reply = await chatAI(newMessages, systemPrompt);
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      const errMsg = err.message?.includes('Ollama') || err.message?.includes('Local model')
        ? 'Local AI offline. Run `ollama serve` in your terminal.'
        : 'Something went wrong. Please try again.';
      setMessages([...newMessages, { role: 'assistant', content: errMsg, isError: true }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40',
          'w-14 h-14 rounded-2xl shadow-2xl',
          'bg-gradient-to-br from-accent to-accent/80',
          'flex items-center justify-center',
          'hover:scale-110 active:scale-95 transition-transform duration-200',
          'hover:shadow-accent/30',
          isOpen && 'hidden'
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 text-accent-foreground" />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-[420px] h-[600px] max-h-[calc(100vh-80px)]',
              'flex flex-col rounded-2xl overflow-hidden',
              'border border-border/50 shadow-2xl shadow-black/30',
              'bg-gradient-to-b from-card/95 to-card/90 backdrop-blur-2xl'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold">Distinction AI</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{aiProvider} model · context-aware</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={() => setMessages([])}
                    className="text-[10px] text-muted-foreground/60 hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center pt-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/20 flex items-center justify-center mx-auto mb-3">
                      <Bot className="w-7 h-7 text-accent" />
                    </div>
                    <p className="text-sm font-semibold">How can I help?</p>
                    <p className="text-xs text-muted-foreground mt-1">Ask about your leads, revenue, tasks, or anything.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {STARTER_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-left text-xs px-3 py-2.5 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/50 hover:border-accent/30 transition-all text-muted-foreground hover:text-foreground"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-accent text-accent-foreground rounded-br-md'
                        : msg.isError
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-bl-md'
                          : 'bg-muted/50 text-foreground border border-border/30 rounded-bl-md'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-border/20">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask anything about your business..."
                  rows={1}
                  className={cn(
                    'flex-1 resize-none rounded-xl px-4 py-3 text-sm',
                    'bg-muted/30 border border-border/40',
                    'focus:outline-none focus:ring-1 focus:ring-accent/40 focus:border-accent/40',
                    'placeholder:text-muted-foreground/50',
                    'max-h-32 overflow-y-auto'
                  )}
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isThinking}
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0',
                    'bg-accent hover:bg-accent/90 transition-colors',
                    'disabled:opacity-40 disabled:cursor-not-allowed',
                    'shadow-lg shadow-accent/20'
                  )}
                >
                  {isThinking ? (
                    <Loader2 className="w-4 h-4 text-accent-foreground animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-accent-foreground" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-2 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
