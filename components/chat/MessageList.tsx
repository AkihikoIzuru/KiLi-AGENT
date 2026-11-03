'use client';

import { Box } from '@mui/material';
import { type Message as DBMessage } from '@/lib/db/dexie';
import Message from './Message';

interface MessageListProps {
  messages: DBMessage[];
  streamingMessage?: any;
}

export default function MessageList({ messages, streamingMessage }: MessageListProps) {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
      {/* Display all messages from DB */}
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      {/* Display streaming message if it's an assistant response */}
      {streamingMessage && streamingMessage.role === 'assistant' && (
        <Message
          key="streaming"
          message={{
            id: 'streaming',
            conversationId: '',
            role: 'assistant',
            content: streamingMessage.content || '',
            createdAt: Date.now(),
          }}
          isStreaming
        />
      )}
    </Box>
  );
}
