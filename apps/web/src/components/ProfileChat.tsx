import type { MessageDto } from '@evoyamwana/shared';
import { Send } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { messagesService } from '../services/messages.service';
import { Button } from './Button';
import { LoadingRows } from './LoadingRows';

interface ProfileChatProps {
  recipientId: string;
  recipientName: string;
}

const formatTime = (value: string) => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(new Date(value));

export const ProfileChat = ({ recipientId, recipientName }: ProfileChatProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    setError('');
    try {
      setMessages(await messagesService.getConversation(recipientId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();
  }, [recipientId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setIsSending(true);
    setError('');
    try {
      const message = await messagesService.send(recipientId, body);
      setMessages((current) => [...current, message]);
      setDraft('');
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Unable to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-lg border border-ocean/10 bg-white shadow-panel">
      <div className="border-b border-ocean/10 bg-ocean px-5 py-4 text-white">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Conversation</p>
        <h3 className="mt-1 text-xl font-bold">{recipientName}</h3>
      </div>

      <div className="h-[430px] overflow-y-auto bg-[linear-gradient(135deg,rgba(0,127,255,0.08),transparent_38%),linear-gradient(45deg,rgba(247,214,24,0.12),transparent_52%)] p-4">
        {isLoading ? (
          <LoadingRows rows={5} />
        ) : messages.length ? (
          <div className="grid gap-3">
            {messages.map((message) => {
              const isMine = message.senderId === user?.id;
              return (
                <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${isMine ? 'rounded-br-sm bg-ocean text-white' : 'rounded-bl-sm bg-white text-ink'}`}>
                    <p className="whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                    <p className={`mt-1 text-right text-[11px] font-semibold ${isMine ? 'text-white/70' : 'text-ink/45'}`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        ) : (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="font-bold text-ink">Aucune conversation</p>
              <p className="mt-1 text-sm text-ink/55">Envoyez le premier message.</p>
            </div>
          </div>
        )}
      </div>

      {error ? <p className="mx-4 mt-3 rounded-md bg-clay/10 px-3 py-2 text-sm font-semibold text-clay">{error}</p> : null}

      <form onSubmit={handleSend} className="flex gap-2 border-t border-ocean/10 bg-white p-4">
        <input
          className="h-12 flex-1 rounded-full border border-ocean/10 bg-sky px-4 text-sm outline-none focus:border-ocean"
          placeholder="Écrire un message..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit" className="h-12 rounded-full px-4" disabled={isSending || !draft.trim()} aria-label="Send message">
          <Send size={18} />
        </Button>
      </form>
    </article>
  );
};
