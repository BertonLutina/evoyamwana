import type { MessageDto, UserRole } from '@evoyamwana/shared';
import { Archive, CheckCheck, ChevronDown, MessageCircle, Mic, MoreVertical, Paperclip, Search, Send, ShieldAlert, Smile, UsersRound, Video } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { useAuth } from '../../hooks/useAuth';
import { ApiClientError } from '../../services/api';
import { chatService, type ChatContactDto, type ChatConversationDto } from '../../services/chat.service';

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  DIRECTOR: 'Director',
  SECRETARY: 'Secretary',
  ACCOUNTANT: 'Accountant',
  TEACHER: 'Teacher',
  CLASS_TUTOR: 'Class Tutor',
  PARENT: 'Parent',
  STUDENT: 'Student',
  DISCIPLINE_OFFICER: 'Discipline Officer',
  LIBRARIAN: 'Librarian',
  NURSE: 'Nurse',
  TRANSPORT_MANAGER: 'Transport Manager',
  CANTEEN_MANAGER: 'Canteen Manager'
};

const roleGroups: Array<{ label: string; roles: UserRole[] }> = [
  { label: 'Direction', roles: ['DIRECTOR'] },
  { label: 'Administration', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'SECRETARY', 'ACCOUNTANT'] },
  { label: 'Teachers', roles: ['TEACHER', 'CLASS_TUTOR'] },
  { label: 'Students', roles: ['STUDENT'] },
  { label: 'Parents', roles: ['PARENT'] },
  { label: 'Health', roles: ['NURSE'] },
  { label: 'Discipline', roles: ['DISCIPLINE_OFFICER'] },
  { label: 'Library', roles: ['LIBRARIAN'] },
  { label: 'Transport', roles: ['TRANSPORT_MANAGER'] },
  { label: 'Canteen', roles: ['CANTEEN_MANAGER'] }
];

const permissionMessage = 'You are not allowed to message this user.';
const serverMessage = 'A server error occurred. Please try again later.';
const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
const formatChatTime = (value?: string | null) => (value ? new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : '');

export const ChatRoomPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState<ChatContactDto[]>([]);
  const [conversations, setConversations] = useState<ChatConversationDto[]>([]);
  const [activeContactId, setActiveContactId] = useState('');
  const [activeConversation, setActiveConversation] = useState<ChatConversationDto | null>(null);
  const [thread, setThread] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'staff' | 'families'>('all');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoadingContacts(true);
    setIsLoadingConversations(true);
    setError('');

    Promise.all([chatService.listContacts(), chatService.listConversations()])
      .then(([allowedContacts, allowedConversations]) => {
        if (!mounted) return;
        setContacts(allowedContacts);
        setConversations(allowedConversations);
        const firstConversation = allowedConversations[0] ?? null;
        if (firstConversation) {
          const contact = getConversationContact(firstConversation, allowedContacts, user?.id ?? '');
          setActiveContactId(contact?.id ?? '');
          setActiveConversation(firstConversation);
          setThread(firstConversation.messages ?? []);
        }
      })
      .catch((loadError) => {
        if (mounted) setError(getChatErrorMessage(loadError, navigate, logout, 'Contacts cannot be loaded.'));
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingContacts(false);
        setIsLoadingConversations(false);
      });

    return () => {
      mounted = false;
    };
  }, [logout, navigate, user?.id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.id, thread]);

  const visibleContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const text = `${contact.fullName} ${contact.email} ${roleLabels[contact.role]} ${contact.className ?? ''} ${contact.relationLabel ?? ''}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesFilter =
        filter === 'all' ||
        (filter === 'staff' && contact.role !== 'PARENT' && contact.role !== 'STUDENT') ||
        (filter === 'families' && (contact.role === 'PARENT' || contact.role === 'STUDENT')) ||
        (filter === 'unread' && getConversationForContact(contact.id, conversations, user?.id ?? '')?.unreadCount);
      return matchesSearch && Boolean(matchesFilter);
    });
  }, [contacts, conversations, filter, search, user?.id]);

  const groupedContacts = useMemo(() => {
    return roleGroups
      .map((group) => ({
        ...group,
        contacts: visibleContacts.filter((contact) => group.roles.includes(contact.role))
      }))
      .filter((group) => group.contacts.length > 0);
  }, [visibleContacts]);

  const visibleConversations = useMemo(() => {
    return conversations.filter((conversation) => {
      const contact = getConversationContact(conversation, contacts, user?.id ?? '');
      const lastMessage = getConversationLastMessage(conversation);
      const text = `${contact?.fullName ?? ''} ${contact?.email ?? ''} ${lastMessage?.body ?? ''}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [contacts, conversations, search, user?.id]);

  const activeContact = contacts.find((contact) => contact.id === activeContactId) ?? getConversationContact(activeConversation, contacts, user?.id ?? '');
  const canSend = Boolean(activeContact && activeConversation?.id && draft.trim() && !isSending && !isCreatingConversation);

  const handleSelectContact = async (contact: ChatContactDto) => {
    if (!contacts.some((allowedContact) => allowedContact.id === contact.id)) {
      setError(permissionMessage);
      return;
    }

    setError('');
    setActiveContactId(contact.id);
    setIsCreatingConversation(true);
    try {
      const conversation = await chatService.createConversation(contact.id);
      setActiveConversation(conversation);
      setThread(conversation.messages ?? []);
      setConversations((current) => upsertConversation(current, conversation));
    } catch (createError) {
      setActiveConversation(null);
      setThread([]);
      setError(getChatErrorMessage(createError, navigate, logout, permissionMessage));
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleSelectConversation = (conversation: ChatConversationDto) => {
    const contact = getConversationContact(conversation, contacts, user?.id ?? '');
    setError('');
    setActiveConversation(conversation);
    setActiveContactId(contact?.id ?? '');
    setThread(conversation.messages ?? []);
  };

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!activeContact || !activeConversation?.id || !body) return;

    setIsSending(true);
    setError('');
    try {
      const sent = await chatService.sendMessage({
        conversationId: activeConversation.id,
        recipientId: activeContact.id,
        body
      });
      setThread((current) => mergeMessages(current, [sent]));
      setConversations((current) => updateConversationLastMessage(current, activeConversation.id, sent));
      setDraft('');
    } catch (sendError) {
      setError(getChatErrorMessage(sendError, navigate, logout, permissionMessage));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid h-[calc(100vh-9.5rem)] min-h-[720px] max-w-[1600px] overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel xl:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-ocean/10 bg-white">
          <div className="border-b border-ocean/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-canopy">ChatRoom</p>
                <h1 className="font-display text-2xl font-black text-ink">Allowed contacts</h1>
              </div>
              <div className="flex items-center gap-2 text-ink/55">
                <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-sky" type="button"><Archive size={18} /></button>
                <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-sky" type="button"><MoreVertical size={18} /></button>
              </div>
            </div>
            <label className="mt-4 flex h-11 items-center gap-2 rounded-full border border-ocean/10 bg-sky px-4">
              <Search size={18} className="text-ocean/55" />
              <input className="w-full bg-transparent text-sm outline-none placeholder:text-ink/35" placeholder="Search allowed contacts or conversations" value={search} onChange={(event) => setSearch(event.target.value)} />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                ['all', 'All'],
                ['unread', 'Unread'],
                ['staff', 'School'],
                ['families', 'Families']
              ].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setFilter(value as typeof filter)} className={`rounded-full border px-4 py-2 text-sm font-black transition ${filter === value ? 'border-canopy/25 bg-canopy/15 text-canopy' : 'border-ocean/10 bg-white text-ink/62 hover:bg-sky'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <SectionTitle label="Conversations" count={visibleConversations.length} />
            {isLoadingConversations ? <LoadingRows rows={3} /> : visibleConversations.length ? visibleConversations.map((conversation) => {
              const contact = getConversationContact(conversation, contacts, user?.id ?? '');
              const lastMessage = getConversationLastMessage(conversation);
              return (
                <button key={conversation.id} type="button" onClick={() => handleSelectConversation(conversation)} className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-sky ${activeConversation?.id === conversation.id ? 'bg-sky' : ''}`}>
                  <Avatar name={contact?.fullName ?? 'Conversation'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-black text-ink">{contact?.fullName ?? 'Conversation'}</p>
                      <span className="shrink-0 text-xs font-semibold text-ink/45">{formatChatTime(lastMessage?.createdAt ?? conversation.updatedAt)}</span>
                    </div>
                    <p className="mt-1 truncate text-sm text-ink/55">{lastMessage?.body ?? 'No message yet'}</p>
                  </div>
                  {conversation.unreadCount ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-canopy px-2 text-xs font-black text-white">{conversation.unreadCount}</span> : null}
                </button>
              );
            }) : <p className="mb-4 rounded-lg bg-sky px-3 py-2 text-sm font-semibold text-ink/55">No conversations yet.</p>}

            <SectionTitle label="Contacts" count={visibleContacts.length} />
            {isLoadingContacts ? <LoadingRows rows={7} /> : error && !contacts.length ? (
              <EmptyState icon={ShieldAlert} title="Contacts cannot be loaded." description={error} />
            ) : groupedContacts.length ? groupedContacts.map((group) => (
              <div key={group.label} className="mb-4">
                <button type="button" className="mb-2 flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs font-black uppercase tracking-[0.14em] text-ink/45">
                  <span>{group.label}</span>
                  <ChevronDown size={14} />
                </button>
                <div className="space-y-1">
                  {group.contacts.map((contact) => {
                    const conversation = getConversationForContact(contact.id, conversations, user?.id ?? '');
                    const lastMessage = getConversationLastMessage(conversation);
                    return (
                      <button key={contact.id} type="button" onClick={() => void handleSelectContact(contact)} className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition hover:bg-sky ${activeContactId === contact.id ? 'bg-sky' : ''}`}>
                        <Avatar name={contact.fullName} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <p className="truncate text-sm font-black text-ink">{contact.fullName}</p>
                            <span className="shrink-0 text-xs font-semibold text-ink/45">{roleLabels[contact.role]}</span>
                          </div>
                          <p className="mt-1 truncate text-sm text-ink/55">{lastMessage?.body ?? contact.relationLabel ?? contact.email}</p>
                        </div>
                        {conversation?.unreadCount ? <span className="grid h-6 min-w-6 place-items-center rounded-full bg-canopy px-2 text-xs font-black text-white">{conversation.unreadCount}</span> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            )) : <EmptyState icon={MessageCircle} title="No available contacts for chat." description="The backend did not return any contact you are allowed to message." />}
          </div>
        </aside>

        <article className="flex min-h-0 flex-col bg-[#efeae2]">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-ocean/10 bg-white px-5">
            <div className="flex min-w-0 items-center gap-3">
              {activeContact ? <Avatar name={activeContact.fullName} /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-sky text-ocean"><UsersRound size={20} /></span>}
              <div className="min-w-0">
                <p className="truncate text-lg font-black text-ink">{activeContact?.fullName ?? 'Select an allowed contact'}</p>
                <p className="text-sm font-semibold text-ink/50">{activeContact ? `${roleLabels[activeContact.role]} · allowed by backend` : 'ChatRoom school'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-ink/65">
              <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sky" type="button"><Video size={20} /></button>
              <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sky" type="button"><Search size={20} /></button>
              <button className="grid h-10 w-10 place-items-center rounded-full hover:bg-sky" type="button"><MoreVertical size={20} /></button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_1px_1px,rgba(15,38,70,0.08)_1px,transparent_0)] bg-[length:28px_28px] p-5">
            {error ? <p className="mb-3 rounded-lg bg-clay/10 px-3 py-2 text-sm font-bold text-clay">{error}</p> : null}
            {isCreatingConversation ? <LoadingRows rows={4} /> : activeContact && thread.length ? (
              <div className="grid gap-3">
                {thread.map((message) => {
                  const mine = message.senderId === user?.id;
                  return (
                    <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[78%] rounded-lg px-4 py-2 shadow-sm ${mine ? 'rounded-br-sm bg-[#d9fdd3]' : 'rounded-bl-sm bg-white'}`}>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-ink">{message.body}</p>
                        <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-ink/45">{formatChatTime(message.createdAt)} {mine ? <CheckCheck size={14} className="text-ocean" /> : null}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={scrollRef} />
              </div>
            ) : <EmptyState icon={MessageCircle} title={activeContact ? 'No messages yet' : 'Choose an allowed contact'} description={activeContact ? 'Start this conversation only if the backend allows it.' : 'Only contacts returned by the backend are available.'} />}
          </div>

          <form onSubmit={sendMessage} className="flex shrink-0 items-center gap-3 border-t border-ocean/10 bg-white p-4">
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-ink/55 hover:bg-sky"><Paperclip size={21} /></button>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full text-ink/55 hover:bg-sky"><Smile size={21} /></button>
            <input className="h-12 flex-1 rounded-full border border-ocean/10 bg-sky px-5 text-sm outline-none focus:border-ocean disabled:cursor-not-allowed disabled:opacity-60" placeholder={activeContact ? 'Enter a message' : 'Choose an allowed contact'} value={draft} onChange={(event) => setDraft(event.target.value)} disabled={!activeContact || !activeConversation?.id || isCreatingConversation} />
            <button type={draft.trim() ? 'submit' : 'button'} disabled={!canSend} className="grid h-12 w-12 place-items-center rounded-full bg-canopy text-white transition hover:bg-canopy/90 disabled:cursor-not-allowed disabled:bg-ink/25">
              {draft.trim() ? <Send size={19} /> : <Mic size={19} />}
            </button>
          </form>
        </article>
      </div>
    </section>
  );
};

const SectionTitle = ({ label, count }: { label: string; count: number }) => (
  <div className="mb-2 mt-3 flex items-center justify-between px-2">
    <p className="text-xs font-black uppercase tracking-[0.16em] text-ink/45">{label}</p>
    <span className="rounded-full bg-sky px-2 py-0.5 text-xs font-black text-ocean">{count}</span>
  </div>
);

const Avatar = ({ name }: { name: string }) => (
  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ocean/10 text-sm font-black text-ocean ring-1 ring-ocean/10">
    {initials(name)}
  </span>
);

const mergeMessages = (current: MessageDto[], incoming: MessageDto[]) => {
  const messages = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => messages.set(message.id, message));
  return Array.from(messages.values()).sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
};

const upsertConversation = (conversations: ChatConversationDto[], next: ChatConversationDto) => {
  const byId = new Map(conversations.map((conversation) => [conversation.id, conversation]));
  byId.set(next.id, next);
  return Array.from(byId.values()).sort((left, right) => new Date(right.updatedAt ?? right.createdAt ?? 0).getTime() - new Date(left.updatedAt ?? left.createdAt ?? 0).getTime());
};

const updateConversationLastMessage = (conversations: ChatConversationDto[], conversationId: string, message: MessageDto) =>
  conversations.map((conversation) => conversation.id === conversationId
    ? {
        ...conversation,
        lastMessage: message,
        messages: mergeMessages(conversation.messages ?? [], [message]),
        updatedAt: message.createdAt
      }
    : conversation
  );

const getConversationLastMessage = (conversation?: ChatConversationDto | null) => {
  if (!conversation) return null;
  if (conversation.lastMessage) return conversation.lastMessage;
  return [...(conversation.messages ?? [])].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null;
};

const getConversationContact = (conversation: ChatConversationDto | null | undefined, contacts: ChatContactDto[], currentUserId: string) => {
  if (!conversation) return null;
  if (conversation.contact) return conversation.contact;
  const participant = conversation.participants?.find((item) => item.id !== currentUserId);
  if (participant) return participant;
  const lastMessage = getConversationLastMessage(conversation);
  const otherUserId = lastMessage?.senderId === currentUserId ? lastMessage?.recipientId : lastMessage?.senderId;
  return contacts.find((contact) => contact.id === otherUserId) ?? null;
};

const getConversationForContact = (contactId: string, conversations: ChatConversationDto[], currentUserId: string) =>
  conversations.find((conversation) => {
    const contact = getConversationContact(conversation, [], currentUserId);
    if (contact?.id === contactId) return true;
    const lastMessage = getConversationLastMessage(conversation);
    return Boolean(lastMessage && [lastMessage.senderId, lastMessage.recipientId].includes(contactId));
  }) ?? null;

const getChatErrorMessage = (error: unknown, navigate: (path: string) => void, logout: () => void, fallback: string) => {
  if (error instanceof ApiClientError) {
    if (error.statusCode === 401) {
      logout();
      navigate('/login');
      return 'Please sign in again.';
    }
    if (error.statusCode === 403) return permissionMessage;
    if (error.statusCode >= 500) return serverMessage;
    return error.message || fallback;
  }

  return error instanceof Error ? error.message : fallback;
};
