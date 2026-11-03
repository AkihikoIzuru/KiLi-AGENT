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
  const [agentMode, setAgentMode] = useState(false);
  const [agentSupported, setAgentSupported] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation and messages from DB
  const conversation = useLiveQuery(
    () => db.conversations.get(conversationId),
    [conversationId]
  );

  const dbMessages = useLiveQuery(
    () => db.messages.where('conversationId').equals(conversationId).sortBy('createdAt'),
    [conversationId]
  );

  const initializeConversation = useCallback(async () => {
    const exists = await db.conversations.get(conversationId);
    if (!exists) {
      await db.conversations.add({
        id: conversationId,
        title: 'New Conversation',
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
          const model = data.models.find((m: any) => m.id === conversation?.model) || data.models[0];
          setSelectedModel(model.id);
          setAgentSupported(model.tools !== false);
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
  const {
    messages: streamMessages,
    append,
    isLoading,
    stop,
    setMessages,
  } = useChat({
    api: '/api/chat',
    body: {
      model: selectedModel,
      conversationId,
      agentMode,
    },
    onFinish: async (message) => {
      // Save assistant message to DB
      await db.messages.add({
        id: nanoid(),
        conversationId,
        role: 'assistant',
        content: message.content,
        createdAt: Date.now(),
      });

      // Update conversation timestamp
      await db.conversations.update(conversationId, {
        updatedAt: Date.now(),
      });

      // Generate title if first exchange
      const msgCount = await db.messages.where('conversationId').equals(conversationId).count();
      if (msgCount === 2) {
        generateTitle();
      }

      // Clear streaming messages after save
      setMessages([]);
    },
  });

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
            language: 'en',
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

  const handleSend = async (content: string, useAgentMode?: boolean) => {
    if (!content.trim() || !selectedModel) return;

    // Save user message to DB immediately
    await db.messages.add({
      id: nanoid(),
      conversationId,
      role: 'user',
      content: content.trim(),
      createdAt: Date.now(),
    });

    // Update conversation timestamp
    await db.conversations.update(conversationId, {
      updatedAt: Date.now(),
    });

    // Start streaming (this adds to streamMessages)
    await append({
      role: 'user',
      content: content.trim(),
    });
  };

  const handleStop = () => {
    stop();
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dbMessages, streamMessages]);

  // Get current streaming message (last assistant message being generated)
  const streamingMessage = isLoading && streamMessages.length > 0
    ? streamMessages[streamMessages.length - 1]
    : undefined;

  // Empty state
  const isEmpty = (!dbMessages || dbMessages.length === 0) && !isLoading;

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: 3,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 3,
          },
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
              px: 2,
            }}
          >
            <Typography variant="h4" gutterBottom fontWeight={600}>
              How can I help you today?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Ask me anything, I'm here to help
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {[
                'Explain quantum computing',
                'Create an interactive webpage',
                'Help me analyze data',
                'Write a short story',
              ].map((suggestion, index) => (
                <Chip
                  key={index}
                  label={suggestion}
                  onClick={() => handleSend(suggestion)}
                  sx={{ m: 0.5 }}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>
        ) : (
          <>
            <MessageList
              messages={dbMessages || []}
              streamingMessage={streamingMessage}
            />
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
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
        }}
      >
        <Composer
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          disabled={!selectedModel}
          agentMode={agentMode}
          onAgentModeChange={setAgentMode}
          agentSupported={agentSupported}
        />
      </Box>
    </Box>
  );
}
