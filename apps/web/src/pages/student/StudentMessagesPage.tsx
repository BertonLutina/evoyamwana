import type { MessageDto, UserRole } from '@evoyamwana/shared';
import { Bell, MessageSquare, Search, Send, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { StatCard } from '../../components/StatCard';
import { useLocale } from '../../contexts/LocaleContext';
import { useAuth } from '../../hooks/useAuth';
import { type MessageContactDto, messagesService } from '../../services/messages.service';

const formatTime = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));

export const StudentMessagesPage = () => {
  const { user } = useAuth();
  const { t } = useLocale();
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [activeContactId, setActiveContactId] = useState('');
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError('');

    Promise.all([messagesService.listContacts(), messagesService.listMine()])
      .then(([loadedContacts, loadedMessages]) => {
        if (!isMounted) return;
        setContacts(loadedContacts);
        setMessages(loadedMessages);
        setActiveContactId((current) => current || loadedContacts[0]?.id || '');
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t('student.loadMessagesError'));
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeContactId) return;
    let isMounted = true;
    setIsThreadLoading(true);
    setError('');

    messagesService
      .getConversation(activeContactId)
      .then((conversation) => {
        if (isMounted) setMessages((current) => mergeMessages(current, conversation));
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError instanceof Error ? loadError.message : t('student.loadConversationError'));
      })
      .finally(() => {
        if (isMounted) setIsThreadLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeContactId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeContactId, messages]);

  const unreadCount = messages.filter((message) => message.recipientId === user?.id && !message.readAt).length;
  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? null;
  const roleLabels: Record<UserRole, string> = {
    SUPER_ADMIN: t('student.superAdmin'),
    SCHOOL_ADMIN: t('student.schoolAdmin'),
    DIRECTOR: 'Direction',
    SECRETARY: 'Secrétariat',
    ACCOUNTANT: 'Comptabilité',
    TEACHER: t('student.teacherRole'),
    CLASS_TUTOR: 'Titulaire',
    PARENT: t('student.parentRole'),
    STUDENT: t('student.studentRole'),
    DISCIPLINE_OFFICER: 'Discipline',
    LIBRARIAN: 'Bibliothèque',
    NURSE: 'Infirmerie',
    TRANSPORT_MANAGER: 'Transport',
    CANTEEN_MANAGER: 'Cantine'
  };
  const filteredContacts = contacts.filter((contact) => `${contact.fullName} ${contact.email} ${roleLabels[contact.role]}`.toLowerCase().includes(search.toLowerCase()));
  const thread = useMemo(
    () =>
      activeContactId
        ? messages
            .filter((message) => [message.senderId, message.recipientId].includes(activeContactId))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        : [],
    [activeContactId, messages]
  );

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!activeContactId || !body) return;

    setIsSending(true);
    setError('');
    try {
      const message = await messagesService.send(activeContactId, body);
      setMessages((current) => mergeMessages(current, [message]));
      setDraft('');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : t('student.sendMessageError'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
          <div className="grid gap-6 p-6 sm:p-8 xl:grid-cols-[1fr_360px] xl:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{t('student.space')}</p>
              <h2 className="mt-3 font-display text-4xl font-bold text-ink">{t('student.myMessages')}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/60">
                {t('student.myMessagesDescription')}
              </p>
            </div>
            <article className="rounded-lg border border-ocean/10 bg-sky p-5">
              <MessageSquare className="text-ocean" size={28} />
              <p className="mt-4 text-sm font-bold text-ink">{user?.fullName ?? 'Espace messages'}</p>
              <p className="mt-1 text-sm text-ink/55">{t('student.secureSchoolMessaging')}</p>
            </article>
          </div>
        </section>

        {error ? <p className="mt-4 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

        <section className="mt-5 grid gap-4 md:grid-cols-3">
          <StatCard label={t('student.conversations')} value={isLoading ? '...' : String(contacts.length)} icon={MessageSquare} tone="blue" detail={t('student.allowedContacts')} />
          <StatCard label={t('student.unread')} value={isLoading ? '...' : String(unreadCount)} icon={Bell} tone="orange" detail={t('student.messagesToRead')} />
          <StatCard label={t('student.access')} value={t('student.securedAccess')} icon={ShieldCheck} tone="green" detail={t('student.schoolTeacherOnly')} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[380px_1fr]">
          <article className="rounded-lg border border-ocean/10 bg-white p-4 shadow-panel">
            <label className="flex h-11 items-center gap-2 rounded-md border border-ocean/10 bg-sky px-3">
              <Search size={18} className="text-ocean/55" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35"
                placeholder={t('student.searchContact')}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <div className="mt-4 grid gap-2">
              {isLoading ? (
                <LoadingRows rows={5} />
              ) : filteredContacts.length ? (
                filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => setActiveContactId(contact.id)}
                    className={`rounded-lg border p-4 text-left transition hover:border-ocean/30 hover:bg-sky ${activeContactId === contact.id ? 'border-ocean bg-sky' : 'border-ocean/10 bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-ocean text-sm font-black text-white">
                        {contact.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                      </span>
                      <span>
                        <span className="block font-bold text-ink">{contact.fullName}</span>
                        <span className="mt-1 block text-xs font-semibold text-ember">{roleLabels[contact.role]}</span>
                        <span className="mt-1 block text-xs text-ink/45">{contact.email}</span>
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <EmptyState icon={UserRoundCheck} title={t('student.noContact')} description={t('student.noContactDetail')} />
              )}
            </div>
          </article>

          <article className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
            <div className="border-b border-ocean/10 bg-ocean px-5 py-4 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">{t('student.conversation')}</p>
              <h3 className="mt-1 text-xl font-bold">{activeContact?.fullName ?? t('student.selectContact')}</h3>
            </div>

            <div className="h-[520px] overflow-y-auto bg-[linear-gradient(135deg,rgba(0,127,255,0.08),transparent_38%),linear-gradient(45deg,rgba(247,214,24,0.12),transparent_52%)] p-4">
              {isThreadLoading ? (
                <LoadingRows rows={6} />
              ) : activeContact ? (
                thread.length ? (
                  <div className="grid gap-3">
                    {thread.map((message) => {
                      const isMine = message.senderId === user?.id;
                      return (
                        <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'rounded-br-sm bg-ocean text-white' : 'rounded-bl-sm bg-white text-ink'}`}>
                            <p className="text-xs font-bold opacity-70">{message.subject}</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                            <p className={`mt-1 text-right text-[11px] font-semibold ${isMine ? 'text-white/70' : 'text-ink/45'}`}>{formatTime(message.createdAt)}</p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                ) : (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <p className="font-bold text-ink">{t('student.noMessage')}</p>
                      <p className="mt-1 text-sm text-ink/55">{t('student.noMessageDetail')}</p>
                    </div>
                  </div>
                )
              ) : (
                <EmptyState icon={MessageSquare} title={t('student.chooseContact')} description={t('student.chooseContactDetail')} />
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 border-t border-ocean/10 bg-white p-4">
              <input
                className="h-12 flex-1 rounded-full border border-ocean/10 bg-sky px-4 text-sm outline-none focus:border-ocean"
                placeholder={activeContact ? `${t('student.writeTo')} ${activeContact.fullName}` : t('student.chooseContact')}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!activeContact}
              />
              <Button type="submit" className="h-12 rounded-full px-4" disabled={isSending || !activeContact || !draft.trim()} aria-label="Envoyer le message">
                <Send size={18} />
              </Button>
            </form>
          </article>
        </section>
      </div>
    </div>
  );
};

const mergeMessages = (current: MessageDto[], incoming: MessageDto[]) => {
  const messages = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => messages.set(message.id, message));
  return Array.from(messages.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};
