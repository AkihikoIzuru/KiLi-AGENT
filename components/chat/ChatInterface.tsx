'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Chip, Stack } from '@mui/material';
import { db, type Message, type Conversation } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import MessageList from './MessageList';
import Composer from './Composer';
import { useChat } from '@ai-sdk/react';

interface ChatInterfaceProps {
  conversationId: string;
  isNew?: boolean;
}

export default function ChatInterface({ conversationId, isNew = false }: ChatInterfaceProps) {
  const [initialized, setInitialized] = useState(false);
  const [selectedModel, setSelectedModel] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation and messages
  const conversation = useLiveQuery(
    () => db.conversations.get(conversationId),
    [conversationId]
  );

  const messages = useLiveQuery(
    () => db.messages.where('conversationId').equals(conversationId).sortBy('createdAt'),
    [conversationId]
  );

  const initializeConversation = useCallback(async () => {
    const exists = await db.conversations.get(conversationId);
    if (!exists) {
      await db.conversations.add({
        id: conversationId,
        title: 'Percakapan Baru',
        model: selectedModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }, [conversationId, selectedModel]);

  const fetchDefaultModel = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        if (data.models?.length > 0) {
          setSelectedModel(conversation?.model || data.models[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  }, [conversation?.model]);

  // Initialize conversation if new
  useEffect(() => {
    if (!initialized && conversationId) {
      initializeConversation();
      setInitialized(true);
    }
  }, [conversationId, initialized, initializeConversation]);

  // Fetch default model
  useEffect(() => {
    fetchDefaultModel();
  }, [fetchDefaultModel]);

  // Chat hook for streaming
  const { messages: streamMessages, append, isLoading, stop } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
      conversationId,
    },
    onFinish: async (message) => {
      // Save assistant message
      await saveMessage({
        role: 'assistant',
        content: message.content,
      });

      // Update conversation
      await db.conversations.update(conversationId, {
        updatedAt: Date.now(),
      });

      // Generate title if first message
      if (messages && messages.length === 1) {
        generateTitle();
      }
    },
  });

  const saveMessage = async (message: { role: 'user' | 'assistant'; content: string }) => {
    await db.messages.add({
      id: nanoid(),
      conversationId,
      role: message.role,
      content: message.content,
      createdAt: Date.now(),
    });
  };

  const generateTitle = async () => {
    try {
      const msgs = await db.messages
        .where('conversationId')
        .equals(conversationId)
        .sortBy('createdAt');

      if (msgs.length >= 2) {
        const response = await fetch('/api/title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: msgs.slice(0, 4).map(m => ({
              role: m.role,
              content: m.content,
            })),
            model: selectedModel,
            language: 'id',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          await db.conversations.update(conversationId, {
            title: data.title,
          });
        }
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
  };

  const handleSend = async (content: string) => {
    if (!content.trim() || !selectedModel) return;

    // Save user message
    await saveMessage({
      role: 'user',
      content: content.trim(),
    });

    // Update conversation
    await db.conversations.update(conversationId, {
      updatedAt: Date.now(),
    });

    // Send to AI
    await append({
      role: 'user',
      content: content.trim(),
    });
  };

  const handleStop = () => {
    stop();
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamMessages]);

  // Empty state
  const isEmpty = !messages || messages.length === 0;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 4 },
          py: 3,
        }}
      >
        {isEmpty ? (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: 600,
              mx: 'auto',
              textAlign: 'center',
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight={600}>
              Halo! Bagaimana saya bisa membantu Anda hari ini?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Tanyakan apa saja, saya siap membantu
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {[
                'Jelaskan konsep quantum computing',
                'Buatkan halaman web interaktif',
                'Bantu saya menganalisis data',
                'Tulis cerita pendek',
              ].map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => handleSend(suggestion)}
                  sx={{ m: 0.5 }}
                />
              ))}
            </Stack>
          </Box>
        ) : (
          <>
            <MessageList messages={messages || []} streamingMessage={isLoading ? streamMessages[streamMessages.length - 1] : undefined} />
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      {/* Composer */}
      <Box
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          px: { xs: 2, sm: 4 },
          py: 2,
        }}
      >
        <Composer
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          disabled={!selectedModel}
        />
      </Box>
    </Box>
  );
}
