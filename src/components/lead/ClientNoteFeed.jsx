import React, { useState } from 'react';
import { clientNotesApi } from '@/api/clientNotes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useOrg } from '@/components/OrgContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Phone, Mail, Calendar, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const noteTypeIcons = {
  general: MessageSquare,
  call_log: Phone,
  email_note: Mail,
  meeting_notes: Calendar,
};

const noteTypeLabels = {
  general: 'General Note',
  call_log: 'Call Log',
  email_note: 'Email Note',
  meeting_notes: 'Meeting Notes',
};

export default function ClientNoteFeed({ leadId }) {
  const { activeOrgId } = useOrg();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');

  const { data: notes } = useQuery({
    queryKey: ['clientNotes', leadId],
    queryFn: () => activeOrgId ? clientNotesApi.listForLead(leadId, activeOrgId) : [],
    initialData: [],
  });

  const createNoteMut = useMutation({
    mutationFn: (data) => clientNotesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clientNotes', leadId] });
      setNewNote('');
      setNoteType('general');
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note'),
  });

  const handleSubmit = () => {
    if (!newNote.trim() || !user?.id) return;
    createNoteMut.mutate({
      organizationId: activeOrgId,
      leadId,
      userId: user.id,
      content: newNote,
      noteType,
    });
  };

  return (
    <Card className="p-6 border-border/50 bg-gradient-to-br from-card/80 via-card/50 to-card/30 backdrop-blur-xl">
      <h3 className="text-base font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-accent" />
        Client Notes
      </h3>

      {/* New Note Input */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <Select value={noteType} onValueChange={setNoteType}>
            <SelectTrigger className="w-44 h-10 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(noteTypeLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note about this client..."
            rows={3}
            className="rounded-xl pr-12 resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!newNote.trim() || createNoteMut.isPending}
            size="icon"
            className="absolute bottom-2 right-2 rounded-lg h-8 w-8"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notes Feed */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border/40 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold mb-1">No Notes Yet</p>
            <p className="text-xs text-muted-foreground/70">Add your first note to track client interactions</p>
          </div>
        ) : (
          notes.map((note) => {
            const Icon = noteTypeIcons[note.noteType] || MessageSquare;
            return (
              <div
                key={note.id}
                className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 hover:from-muted/60 hover:to-muted/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-accent capitalize">
                        {noteTypeLabels[note.noteType]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/70">
                        {note.created_date && format(new Date(note.created_date), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}