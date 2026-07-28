import { useEffect, useState } from 'react';
import { Send, Inbox, CheckCheck, Plus } from 'lucide-react';
import db from '@/lib/shared/kliv-database.js';
import auth from '@/lib/shared/kliv-auth.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ recipient_name: '', subject: '', body: '' });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    auth.getUser().then(setUser);
  }, []);

  const load = async () => {
    if (!user) return;
    const all = await db.query('messages', { order: '_created_at.desc', limit: '100' });
    setMessages(all);
  };

  useEffect(() => { if (user) load(); }, [user, tab]);

  const inbox = messages.filter(m => m.recipient_id === user?.userUuid);
  const sent = messages.filter(m => m.sender_id === user?.userUuid);
  const displayed = tab === 'inbox' ? inbox : sent;

  const sendMessage = async () => {
    if (!user) return;
    await db.insert('messages', {
      sender_id: user.userUuid,
      sender_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
      recipient_name: form.recipient_name,
      subject: form.subject,
      body: form.body,
      channel: 'in_app',
    });
    toast.success('Message sent!');
    setDialogOpen(false);
    setForm({ recipient_name: '', subject: '', body: '' });
    load();
  };

  const markRead = async (msg: any) => {
    if (msg.is_read || msg.sender_id === user?.userUuid) return;
    await db.update('messages', { _row_id: `eq.${msg._row_id}` }, { is_read: 1, read_at: new Date().toISOString() });
    load();
  };

  const formatDate = (ts: number) => {
    if (!ts) return '';
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <PageHeader title="Messages" description="In-app messaging with read receipts">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> New Message
        </Button>
      </PageHeader>

      <div className="flex gap-1 mb-4 bg-muted rounded-lg p-1 w-fit">
        {(['inbox', 'sent'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${tab === t ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t === 'inbox' ? <Inbox className="w-4 h-4 inline mr-1.5" /> : <Send className="w-4 h-4 inline mr-1.5" />}
            {t} ({t === 'inbox' ? inbox.length : sent.length})
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm divide-y">
        {displayed.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted-foreground text-sm">
            No messages in {tab}
          </div>
        ) : displayed.map(m => (
          <div
            key={m._row_id}
            onClick={() => markRead(m)}
            className={`px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors ${!m.is_read && tab === 'inbox' ? 'bg-primary/5' : ''}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!m.is_read && tab === 'inbox' && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  <p className="text-sm font-semibold truncate">{tab === 'inbox' ? m.sender_name : m.recipient_name || 'All'}</p>
                </div>
                <p className="text-sm font-medium text-foreground mt-0.5">{m.subject}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{m.body}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-muted-foreground">{formatDate(m._created_at)}</p>
                {m.is_read && tab === 'sent' && (
                  <div className="flex items-center gap-1 text-xs text-emerald-500 mt-1 justify-end">
                    <CheckCheck className="w-3.5 h-3.5" /> Read
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Message</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label>To</Label><Input placeholder="Recipient name" value={form.recipient_name} onChange={e => setForm({...form, recipient_name: e.target.value})} className="mt-1" /></div>
            <div><Label>Subject</Label><Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="mt-1" /></div>
            <div><Label>Message</Label><Textarea rows={4} value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="mt-1" /></div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={sendMessage} disabled={!form.subject || !form.body}>
              <Send className="w-4 h-4 mr-1" /> Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
