'use client';

import { Box, Paper } from '@mui/material';
import { type Message as DBMessage } from '@/lib/db/dexie';
import Message from './Message';

interface MessageListProps {
  messages: DBMessage[];
  streamingMessage?: any;
}

export default function MessageList({ messages, streamingMessage }: MessageListProps) {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      {streamingMessage && (
        <Message
          message={{
            id: 'streaming',
            conversationId: '',
            role: 'assistant',
            content: streamingMessage.content,
            createdAt: Date.now(),
          }}
          isStreaming
        />
      )}
    </Box>
  );
}
