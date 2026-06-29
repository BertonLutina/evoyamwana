import type { UserRole } from '@evoyamwana/shared';
import { MessageSquare, Send, UsersRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { messagesService, type MessageContactDto } from '../../services/messages.service';

const roleLabels: Partial<Record<UserRole, string>> = {
  DIRECTOR: 'Direction',
  SECRETARY: 'Secrétariat',
  ACCOUNTANT: 'Comptabilité',
  CLASS_TUTOR: 'Titulaire',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothèque',
  NURSE: 'Infirmerie',
  TRANSPORT_MANAGER: 'Transport',
  CANTEEN_MANAGER: 'Cantine'
};

type StaffMessageRole = Extract<UserRole, 'DIRECTOR' | 'SECRETARY' | 'ACCOUNTANT' | 'CLASS_TUTOR' | 'DISCIPLINE_OFFICER' | 'LIBRARIAN' | 'NURSE' | 'TRANSPORT_MANAGER' | 'CANTEEN_MANAGER'>;

export const StaffMessagesPage = ({ role }: { role: StaffMessageRole }) => {
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    messagesService
      .listContacts()
      .then((items) => {
        if (!isMounted) return;
        setContacts(items);
        setSelectedId((current) => current || items[0]?.id || '');
      })
      .catch((loadError) => {
        if (isMounted) setMessage(loadError instanceof Error ? loadError.message : 'Impossible de charger les contacts.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selected = contacts.find((contact) => contact.id === selectedId);
  const parentCount = useMemo(() => contacts.filter((contact) => contact.role === 'PARENT').length, [contacts]);

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedId || !body.trim()) return;
    setIsSending(true);
    setMessage('');
    try {
      await messagesService.send(selectedId, body.trim());
      setBody('');
      setMessage('Message envoyé.');
    } catch (sendError) {
      setMessage(sendError instanceof Error ? sendError.message : 'Impossible d’envoyer le message.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="rounded-lg border border-ocean/10 bg-white p-6 shadow-panel sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Messagerie {roleLabels[role]}</p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink">Contacts école</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink/60">Écrivez aux contacts autorisés par le backend existant, sans créer de nouveau canal.</p>
        </section>

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Contacts" value={isLoading ? '...' : String(contacts.length)} icon={UsersRound} tone="blue" detail="Selon votre rôle" />
          <StatCard label="Parents" value={isLoading ? '...' : String(parentCount)} icon={UsersRound} tone="green" detail="Contacts famille" />
          <StatCard label="Canal" value="API" icon={MessageSquare} tone="orange" detail="Messages existants" />
        </section>

        {message ? <p className="mt-4 rounded-md bg-sky px-3 py-2 text-sm font-semibold text-ocean">{message}</p> : null}

        <section className="mt-6 grid gap-5 xl:grid-cols-[360px_1fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-ember">Contacts</p>
            <div className="mt-4 grid gap-2">
              {isLoading ? (
                <LoadingRows rows={6} />
              ) : contacts.length ? (
                contacts.map((contact) => (
                  <button key={contact.id} className={`rounded-lg border p-4 text-left ${selectedId === contact.id ? 'border-ocean bg-sky' : 'border-ocean/10 bg-white'}`} onClick={() => setSelectedId(contact.id)}>
                    <p className="font-bold text-ink">{contact.fullName}</p>
                    <p className="text-xs text-ink/50">{contact.email}</p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-ocean/65">{contact.role}</p>
                  </button>
                ))
              ) : (
                <EmptyState icon={MessageSquare} title="Aucun contact" description="Les contacts autorisés apparaîtront ici." />
              )}
            </div>
          </article>

          <form onSubmit={sendMessage} className="rounded-lg border border-ocean/10 bg-white p-5 shadow-panel">
            <div className="flex items-center gap-3">
              <MessageSquare className="text-ocean" />
              <div>
                <p className="font-bold text-ink">{selected ? `Message à ${selected.fullName}` : 'Choisissez un contact'}</p>
                <p className="text-sm text-ink/55">Communication sécurisée de l’école</p>
              </div>
            </div>
            <textarea className="mt-5 min-h-56 w-full rounded-lg border border-ocean/10 bg-sky px-4 py-3 outline-none focus:border-ocean" value={body} onChange={(event) => setBody(event.target.value)} placeholder="Écrire un message..." disabled={!selected} />
            <Button type="submit" className="mt-4 gap-2" disabled={isSending || !selected || !body.trim()}>
              <Send size={18} />
              {isSending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
};
