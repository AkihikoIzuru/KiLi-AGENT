'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import ChatInterface from '@/components/chat/ChatInterface';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Create new conversation and redirect
    const conversationId = nanoid();
    router.replace(`/c/${conversationId}`);
  }, [router]);

  return <ChatInterface conversationId="" isNew />;
}
