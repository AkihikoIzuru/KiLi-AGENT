'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Tooltip,
  ToggleButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/SendRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import AttachFileIcon from '@mui/icons-material/AttachFileRounded';
import SmartToyIcon from '@mui/icons-material/SmartToyRounded';

interface ComposerProps {
  onSend: (message: string, agentMode?: boolean) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
  agentMode?: boolean;
  onAgentModeChange?: (enabled: boolean) => void;
  agentSupported?: boolean;
}

export default function Composer({
  onSend,
  onStop,
  isLoading,
  disabled = false,
  agentMode = false,
  onAgentModeChange,
  agentSupported = true,
}: ComposerProps) {
  const [message, setMessage] = useState('');
  const textFieldRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend(message.trim(), agentMode);
      setMessage('');

      // Reset textarea height
      if (textFieldRef.current) {
        textFieldRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-grow textarea
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 7,
        overflow: 'hidden',
        maxWidth: 800,
        mx: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', p: 1 }}>
        {/* Attach button */}
        <Tooltip title="Lampirkan File">
          <IconButton size="small" disabled={isLoading || disabled}>
            <AttachFileIcon />
          </IconButton>
        </Tooltip>

        {/* Text input */}
        <TextField
          fullWidth
          multiline
          maxRows={8}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ketik pesan Anda..."
          disabled={isLoading || disabled}
          inputRef={textFieldRef}
          sx={{
            '& .MuiOutlinedInput-root': {
              border: 'none',
              '& fieldset': { border: 'none' },
            },
          }}
        />

        {/* Agent mode toggle */}
        {onAgentModeChange && (
          <Tooltip title={agentSupported ? "Mode Agent" : "Model tidak mendukung Agent"}>
            <span>
              <ToggleButton
                value="agent"
                selected={agentMode}
                onChange={() => onAgentModeChange(!agentMode)}
                size="small"
                disabled={isLoading || disabled || !agentSupported}
                sx={{ border: 'none', mr: 0.5 }}
              >
                <SmartToyIcon fontSize="small" />
              </ToggleButton>
            </span>
          </Tooltip>
        )}

        {/* Send/Stop button */}
        {isLoading ? (
          <Tooltip title="Berhenti">
            <IconButton
              color="error"
              onClick={onStop}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              <StopIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Kirim">
            <span>
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                  '&:disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                <SendIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
}
