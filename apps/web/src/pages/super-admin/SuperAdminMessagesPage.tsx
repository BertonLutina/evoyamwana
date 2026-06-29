import { MessageSquare, Send, ShieldCheck } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { messagesService, type MessageContactDto } from '../../services/messages.service';
import { SuperAdminShell } from './SuperAdminShell';

export const SuperAdminMessagesPage = () => {
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [activeId, setActiveId] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;
    messagesService.listContacts()
      .then((data) => {
        if (!isMounted) return;
        setContacts(data);
        setActiveId(data[0]?.id ?? '');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeId || !body.trim()) return;
    setIsSending(true);
    try {
      await messagesService.send(activeId, body.trim());
      setBody('');
      setMessage('Message envoyé.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible d’envoyer le message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SuperAdminShell eyebrow="Support plateforme" title="Messages" description="Communiquez avec les administrateurs scolaires depuis l’espace super admin." icon={MessageSquare}>
      {message ? <p className="mt-4 rounded-md bg-sky px-3 py-2 text-sm font-semibold text-ocean">{message}</p> : null}
      <section className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
        <article className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Contacts</p>
          <div className="mt-4 grid gap-2">
            {isLoading ? <LoadingRows rows={6} /> : contacts.length ? contacts.map((contact) => (
              <button key={contact.id} className={`rounded-lg border p-4 text-left ${activeId === contact.id ? 'border-ocean bg-sky' : 'border-ocean/10 bg-white'}`} onClick={() => setActiveId(contact.id)}>
                <p className="font-bold text-ink">{contact.fullName}</p>
                <p className="text-xs text-ink/50">{contact.email}</p>
              </button>
            )) : <EmptyState icon={MessageSquare} title="Aucun contact" description="Les contacts plateforme apparaîtront ici." />}
          </div>
        </article>
        <form onSubmit={send} className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-ocean" />
            <div>
              <p className="font-bold text-ink">Message plateforme</p>
              <p className="text-sm text-ink/55">Envoyé via l’API partagée</p>
            </div>
          </div>
          <textarea className="mt-5 min-h-56 w-full rounded-lg border border-ocean/10 bg-sky px-4 py-3 outline-none focus:border-ocean" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Écrire un message..." />
          <Button type="submit" className="mt-4 gap-2" disabled={isSending || !activeId || !body.trim()}><Send size={18} /> Envoyer</Button>
        </form>
      </section>
    </SuperAdminShell>
  );
};
