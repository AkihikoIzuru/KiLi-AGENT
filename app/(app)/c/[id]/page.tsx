'use client';

import { use } from 'react';
import ChatInterface from '@/components/chat/ChatInterface';

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return <ChatInterface conversationId={id} />;
}
