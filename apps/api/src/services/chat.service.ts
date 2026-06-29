import type { Message, UserRole } from '@prisma/client';
import type { AuthUser } from '@evoyamwana/shared';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { chatPermissionService } from './chat-permissions.service.js';

type ChatContact = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  schoolId?: string | null;
};

type MessageWithUsers = Message & {
  sender?: ChatContact;
  recipient?: ChatContact;
};

const sensitiveAuditRoles = new Set<UserRole>(['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DIRECTOR']);

const includeMessageUsers = {
  sender: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      schoolId: true
    }
  },
  recipient: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      schoolId: true
    }
  }
};

const conversationIdFor = (leftUserId: string, rightUserId: string) => `direct:${[leftUserId, rightUserId].sort().join(':')}`;

const getOtherParticipant = (message: MessageWithUsers, currentUserId: string) => (message.senderId === currentUserId ? message.recipient : message.sender) ?? null;

const audit = async (actor: AuthUser, action: string, targetUserId?: string) => {
  if (!sensitiveAuditRoles.has(actor.role as UserRole)) return;
  const db = prisma as unknown as { chatAuditLog?: { create?: (args: unknown) => Promise<unknown> } };
  await db.chatAuditLog?.create?.({
    data: {
      schoolId: actor.schoolId,
      actorUserId: actor.id,
      targetUserId,
      action
    }
  }).catch(() => undefined);
};

const ensureAllowedConversation = async (senderId: string, receiverId: string) => {
  const [canSend, canReceive] = await Promise.all([
    chatPermissionService.canSendMessage(senderId, receiverId),
    chatPermissionService.canReceiveMessage(receiverId, senderId)
  ]);

  if (!canSend || !canReceive) {
    throw new AppError(chatPermissionService.permissionDeniedMessage, 403);
  }
};

export const chatService = {
  async listContacts(user: AuthUser) {
    const contacts = await chatPermissionService.getAllowedChatContacts(user.id);
    await audit(user, 'CHAT_CONTACTS_LIST');
    return contacts.map(({ schoolId: _schoolId, ...contact }) => contact);
  },

  async listConversations(user: AuthUser) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: user.id }, { recipientId: user.id }],
        ...(user.role === 'SUPER_ADMIN' ? {} : { schoolId: user.schoolId ?? undefined })
      },
      include: includeMessageUsers,
      orderBy: { createdAt: 'desc' },
      take: 200
    }) as MessageWithUsers[];

    const conversations = new Map<string, {
      id: string;
      contact: ChatContact | null;
      participants: ChatContact[];
      messages: MessageWithUsers[];
      lastMessage: MessageWithUsers | null;
      unreadCount: number;
      updatedAt: Date | null;
    }>();

    for (const message of messages) {
      const other = getOtherParticipant(message, user.id);
      if (!other) continue;
      const [canSend, canReceive] = await Promise.all([
        chatPermissionService.canSendMessage(user.id, other.id),
        chatPermissionService.canReceiveMessage(other.id, user.id)
      ]);
      if (!canSend || !canReceive) continue;

      const id = conversationIdFor(user.id, other.id);
      const existing = conversations.get(id);
      const nextMessages = [...(existing?.messages ?? []), message].sort((left, right) => left.createdAt.getTime() - right.createdAt.getTime());
      conversations.set(id, {
        id,
        contact: other,
        participants: [other],
        messages: nextMessages,
        lastMessage: existing?.lastMessage ?? message,
        unreadCount: nextMessages.filter((item) => item.senderId === other.id && item.recipientId === user.id && !item.readAt).length,
        updatedAt: existing?.updatedAt && existing.updatedAt > message.createdAt ? existing.updatedAt : message.createdAt
      });
    }

    await audit(user, 'CHAT_CONVERSATIONS_LIST');
    return Array.from(conversations.values()).sort((left, right) => (right.updatedAt?.getTime() ?? 0) - (left.updatedAt?.getTime() ?? 0));
  },

  async createConversation(user: AuthUser, contactId: string) {
    await ensureAllowedConversation(user.id, contactId);
    const contact = await prisma.user.findUnique({
      where: { id: contactId },
      select: { id: true, fullName: true, email: true, role: true, schoolId: true }
    });
    if (!contact) throw new AppError('Conversation user not found', 404);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: user.id, recipientId: contactId },
          { senderId: contactId, recipientId: user.id }
        ],
        ...(user.role === 'SUPER_ADMIN' ? {} : { schoolId: user.schoolId ?? undefined })
      },
      include: includeMessageUsers,
      orderBy: { createdAt: 'asc' }
    }) as MessageWithUsers[];

    await audit(user, 'CHAT_CONVERSATION_CREATE', contactId);
    return {
      id: conversationIdFor(user.id, contactId),
      contact,
      participants: [contact],
      messages,
      lastMessage: messages[messages.length - 1] ?? null,
      unreadCount: messages.filter((message) => message.senderId === contactId && message.recipientId === user.id && !message.readAt).length,
      updatedAt: messages[messages.length - 1]?.createdAt ?? new Date()
    };
  },

  async sendMessage(user: AuthUser, input: { recipientId: string; body: string; conversationId?: string; subject?: string }) {
    await ensureAllowedConversation(user.id, input.recipientId);
    if (!user.schoolId && user.role !== 'SUPER_ADMIN') {
      throw new AppError('School context is required', 403);
    }

    const recipient = await prisma.user.findUnique({ where: { id: input.recipientId }, select: { schoolId: true } });
    if (!recipient) throw new AppError('Conversation user not found', 404);

    const schoolId = user.schoolId ?? recipient.schoolId;
    if (!schoolId) throw new AppError('School context is required', 403);

    const message = await prisma.message.create({
      data: {
        schoolId,
        senderId: user.id,
        recipientId: input.recipientId,
        subject: input.subject || 'ChatRoom',
        body: input.body
      },
      include: includeMessageUsers
    });

    await audit(user, 'CHAT_MESSAGE_SEND', input.recipientId);
    return message;
  }
};
