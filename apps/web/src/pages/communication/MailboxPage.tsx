import type { MessageDto, UserRole } from '@evoyamwana/shared';
import { Archive, Bell, Bold, ChevronDown, Edit3, FileText, Flag, Inbox, Italic, Mail, MailOpen, MoreHorizontal, Paperclip, Reply, Search, Send, Settings, Sparkles, Trash2, Underline } from 'lucide-react';
import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../components/EmptyState';
import { LoadingRows } from '../../components/LoadingRows';
import { useAuth } from '../../hooks/useAuth';
import { messagesService, type MessageContactDto } from '../../services/messages.service';

const roleLabels: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  SCHOOL_ADMIN: 'Administration',
  DIRECTOR: 'Direction',
  SECRETARY: 'Secrétariat',
  ACCOUNTANT: 'Comptabilité',
  TEACHER: 'Enseignant',
  CLASS_TUTOR: 'Titulaire',
  PARENT: 'Parent',
  STUDENT: 'Élève',
  DISCIPLINE_OFFICER: 'Discipline',
  LIBRARIAN: 'Bibliothèque',
  NURSE: 'Infirmerie',
  TRANSPORT_MANAGER: 'Transport',
  CANTEEN_MANAGER: 'Cantine'
};

const formatMailDate = (value: string) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
const initials = (name: string) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

type FolderKey = 'inbox' | 'unread' | 'sent' | 'drafts' | 'archive';

const folders: Array<{ key: FolderKey; label: string; icon: typeof Inbox }> = [
  { key: 'inbox', label: 'Boîte de réception', icon: Inbox },
  { key: 'unread', label: 'Non lus', icon: Mail },
  { key: 'sent', label: 'Éléments envoyés', icon: Send },
  { key: 'drafts', label: 'Brouillons', icon: Edit3 },
  { key: 'archive', label: 'Archive', icon: Archive }
];

export const MailboxPage = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<MessageContactDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [folder, setFolder] = useState<FolderKey>('inbox');
  const [tab, setTab] = useState<'priority' | 'other'>('priority');
  const [search, setSearch] = useState('');
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    Promise.all([messagesService.listContacts(), messagesService.listMine()])
      .then(([loadedContacts, loadedMessages]) => {
        if (!mounted) return;
        setContacts(loadedContacts);
        setMessages(loadedMessages);
        setRecipientId(loadedContacts[0]?.id ?? '');
        setSelectedId(loadedMessages[0]?.id ?? '');
      })
      .catch((loadError) => {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'Impossible de charger Mailbox.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const folderMessages = useMemo(() => filterMessages(messages, user?.id ?? '', folder), [messages, user?.id, folder]);
  const visibleMessages = folderMessages.filter((message, index) => {
    const text = `${message.sender?.fullName ?? ''} ${message.recipient?.fullName ?? ''} ${message.subject} ${message.body}`.toLowerCase();
    const matchesSearch = text.includes(search.toLowerCase());
    const matchesTab = tab === 'priority' ? index % 3 !== 2 : index % 3 === 2;
    return matchesSearch && matchesTab;
  });
  const selected = messages.find((message) => message.id === selectedId) ?? visibleMessages[0] ?? null;
  const unreadCount = messages.filter((message) => message.recipientId === user?.id && !message.readAt).length;

  const sendMail = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!recipientId || !body.trim()) return;
    setIsSending(true);
    setError('');
    try {
      const sent = await messagesService.send(recipientId, body.trim(), subject.trim() || 'Courrier EVOYAMWANA');
      setMessages((current) => [sent, ...current]);
      setSelectedId(sent.id);
      setSubject('');
      setBody('');
      setIsComposerOpen(false);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Impossible d’envoyer le courrier.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto min-h-[760px] max-w-[1680px] overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
        <header className="flex h-16 items-center justify-between border-b border-ocean/10 bg-white px-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-ocean text-white"><Mail size={20} /></span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-ocean">Mailbox</p>
              <h1 className="text-xl font-black text-ink">Courrier école</h1>
            </div>
          </div>
          <label className="hidden h-11 w-[420px] items-center gap-2 rounded-lg border border-ocean/15 bg-sky px-4 lg:flex">
            <Search size={18} className="text-ocean/55" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Rechercher" value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <div className="flex items-center gap-2 text-ink/55">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-sky"><Bell size={18} /></button>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-lg hover:bg-sky"><Settings size={18} /></button>
            <Avatar name={user?.fullName ?? 'Utilisateur'} />
          </div>
        </header>

        <div className="flex items-center gap-5 border-b border-ocean/10 bg-white px-5 py-3 text-sm font-semibold text-ink/65">
          {['Fichier', 'Accueil', 'Afficher', 'Aide'].map((item) => <button key={item} className={`pb-1 ${item === 'Accueil' ? 'border-b-2 border-ocean text-ink' : ''}`} type="button">{item}</button>)}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-ocean/10 bg-white px-5 py-3">
          <button type="button" onClick={() => setIsComposerOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-lg bg-ocean px-4 text-sm font-black text-white hover:bg-ocean/90"><Edit3 size={17} /> Nouveau message <ChevronDown size={15} /></button>
          {[
            ['Supprimer', Trash2],
            ['Archiver', Archive],
            ['Signaler', Flag],
            ['Répondre', Reply],
            ['Lu / non lu', MailOpen],
            ['Plus', MoreHorizontal]
          ].map(([label, Icon]) => <button key={String(label)} type="button" className="inline-flex h-10 items-center gap-2 rounded-lg border border-ocean/10 bg-white px-3 text-sm font-bold text-ink/65 hover:bg-sky"><Icon size={16} /> {label as string}</button>)}
        </div>

        {error ? <p className="m-4 rounded-lg bg-clay/10 px-3 py-2 text-sm font-bold text-clay">{error}</p> : null}

        <div className="grid min-h-[620px] grid-cols-[280px_minmax(360px,0.9fr)_minmax(420px,1.1fr)]">
          <aside className="border-r border-ocean/10 bg-sky/45 p-4">
            <p className="text-sm font-black text-ink">Favoris</p>
            <div className="mt-3 space-y-1">
              {folders.map(({ key, label, icon: Icon }) => {
                const count = key === 'unread' ? unreadCount : filterMessages(messages, user?.id ?? '', key).length;
                return (
                  <button key={key} type="button" onClick={() => setFolder(key)} className={`flex h-11 w-full items-center justify-between rounded-lg px-3 text-sm font-bold transition ${folder === key ? 'bg-ocean/15 text-ocean' : 'text-ink/70 hover:bg-white'}`}>
                    <span className="flex items-center gap-2"><Icon size={17} /> {label}</span>
                    <span className="text-xs">{count}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-6 text-sm font-black text-ink">Dossiers école</p>
            {['Parents', 'Enseignants', 'Direction', 'Paiements', 'Présences'].map((item, index) => (
              <div key={item} className="mt-2 flex h-10 items-center justify-between rounded-lg px-3 text-sm font-semibold text-ink/65 hover:bg-white">
                <span className="flex items-center gap-2"><FileText size={15} /> {item}</span>
                <span className="text-xs text-ocean">{index ? '' : unreadCount}</span>
              </div>
            ))}
          </aside>

          <main className="border-r border-ocean/10 bg-white">
            <div className="flex items-center justify-between border-b border-ocean/10 px-4 py-3">
              <div className="flex gap-5">
                <button type="button" onClick={() => setTab('priority')} className={`pb-2 text-sm font-black ${tab === 'priority' ? 'border-b-2 border-ocean text-ink' : 'text-ink/50'}`}>Prioritaire</button>
                <button type="button" onClick={() => setTab('other')} className={`pb-2 text-sm font-black ${tab === 'other' ? 'border-b-2 border-ocean text-ink' : 'text-ink/50'}`}>Autres</button>
              </div>
              <button type="button" className="text-sm font-bold text-ink/55">Filtrer</button>
            </div>

            <div className="max-h-[570px] overflow-y-auto">
              {isLoading ? <div className="p-4"><LoadingRows rows={9} /></div> : visibleMessages.length ? visibleMessages.map((message) => {
                const mine = message.senderId === user?.id;
                const person = mine ? message.recipient : message.sender;
                const selectedClass = selected?.id === message.id ? 'border-l-ocean bg-sky' : 'border-l-transparent bg-white hover:bg-sky/50';
                return (
                  <button key={message.id} type="button" onClick={() => setSelectedId(message.id)} className={`grid w-full grid-cols-[48px_1fr_auto] gap-3 border-b border-l-4 border-ocean/10 px-4 py-3 text-left transition ${selectedClass}`}>
                    <Avatar name={person?.fullName ?? 'Contact'} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-ink">{person?.fullName ?? 'Contact'}</p>
                      <p className="mt-1 truncate text-sm font-bold text-ocean">{message.subject}</p>
                      <p className="mt-1 truncate text-xs text-ink/52">{message.body}</p>
                    </div>
                    <span className="text-xs font-bold text-ocean">{formatMailDate(message.createdAt)}</span>
                  </button>
                );
              }) : <EmptyState icon={Inbox} title="Aucun courrier" description="Les courriers de ce dossier apparaîtront ici." />}
            </div>
          </main>

          <section className="min-w-0 bg-[#f6f8fb]">
            {selected ? (
              <MailReader message={selected} currentUserId={user?.id ?? ''} />
            ) : (
              <EmptyState icon={MailOpen} title="Sélectionnez un courrier" description="Le panneau de lecture affichera le message ici." />
            )}
          </section>
        </div>
      </div>

      {isComposerOpen ? (
        <form onSubmit={sendMail} className="fixed bottom-6 right-6 z-40 w-[min(760px,calc(100vw-3rem))] overflow-hidden rounded-lg border border-ocean/15 bg-white shadow-2xl">
          <div className="flex h-12 items-center justify-between bg-ink px-4 text-white">
            <p className="text-sm font-black">Nouveau courrier</p>
            <button type="button" onClick={() => setIsComposerOpen(false)} className="text-white/75 hover:text-white">Fermer</button>
          </div>
          <div className="flex items-center gap-2 border-b border-ocean/10 px-4 py-3">
            <button type="submit" disabled={isSending || !recipientId || !body.trim()} className="inline-flex h-10 items-center gap-2 rounded-lg bg-ocean px-4 text-sm font-black text-white disabled:bg-ink/25"><Send size={16} /> {isSending ? 'Envoi...' : 'Envoyer'}</button>
            {[Bold, Italic, Underline, Paperclip, Sparkles].map((Icon, index) => <button key={index} type="button" className="grid h-9 w-9 place-items-center rounded-lg text-ink/55 hover:bg-sky"><Icon size={17} /></button>)}
          </div>
          <div className="space-y-3 p-4">
            <select className="h-11 w-full rounded-lg border border-ocean/10 px-3 text-sm font-bold outline-none" value={recipientId} onChange={(event) => setRecipientId(event.target.value)}>
              {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.fullName} - {roleLabels[contact.role]}</option>)}
            </select>
            <input className="h-11 w-full border-b border-ocean/15 px-1 text-sm outline-none" placeholder="Ajouter un objet" value={subject} onChange={(event) => setSubject(event.target.value)} />
            <textarea className="min-h-72 w-full resize-none rounded-lg border border-ocean/10 bg-white px-4 py-3 text-sm outline-none focus:border-ocean" placeholder="Écrire le courrier..." value={body} onChange={(event) => setBody(event.target.value)} />
          </div>
        </form>
      ) : null}
    </section>
  );
};

const MailReader = ({ message, currentUserId }: { message: MessageDto; currentUserId: string }) => {
  const mine = message.senderId === currentUserId;
  const person = mine ? message.recipient : message.sender;

  return (
    <article className="h-full overflow-y-auto p-5">
      <div className="rounded-lg border border-ocean/10 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-ocean/10 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={person?.fullName ?? 'Contact'} />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-ink">{message.subject}</h2>
              <p className="mt-1 text-sm font-semibold text-ink/55">{mine ? 'À' : 'De'}: {person?.fullName ?? 'Contact'} · {formatMailDate(message.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sky"><Reply size={17} /></button>
            <button type="button" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-sky"><MoreHorizontal size={17} /></button>
          </div>
        </div>
        <div className="px-6 py-8">
          <div className="mx-auto max-w-2xl rounded-lg bg-sky/60 p-8">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-ocean">Courrier EVOYAMWANA</p>
            <p className="mt-5 whitespace-pre-wrap text-lg leading-8 text-ink">{message.body}</p>
            <div className="mt-8 grid gap-3 rounded-lg bg-white p-4 text-sm text-ink/65 sm:grid-cols-2">
              <p><span className="font-black text-ink">Expéditeur:</span><br />{message.sender?.fullName}</p>
              <p><span className="font-black text-ink">Destinataire:</span><br />{message.recipient?.fullName}</p>
              <p><span className="font-black text-ink">Date:</span><br />{formatMailDate(message.createdAt)}</p>
              <p><span className="font-black text-ink">Statut:</span><br />{message.readAt ? 'Lu' : 'Non lu'}</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

const Avatar = ({ name }: { name: string }) => (
  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ocean/10 text-xs font-black text-ocean ring-1 ring-ocean/10">
    {initials(name)}
  </span>
);

const filterMessages = (messages: MessageDto[], currentUserId: string, folder: FolderKey) => {
  if (folder === 'sent') return messages.filter((message) => message.senderId === currentUserId);
  if (folder === 'unread') return messages.filter((message) => message.recipientId === currentUserId && !message.readAt);
  if (folder === 'drafts' || folder === 'archive') return [];
  return messages.filter((message) => message.recipientId === currentUserId);
};
