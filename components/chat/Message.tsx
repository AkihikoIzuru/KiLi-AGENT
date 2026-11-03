'use client';

import { Box, Paper, Typography, IconButton, Tooltip, Stack, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/PersonRounded';
import SmartToyIcon from '@mui/icons-material/SmartToyRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import ThumbUpIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownIcon from '@mui/icons-material/ThumbDownRounded';
import RefreshIcon from '@mui/icons-material/RefreshRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import { type Message as DBMessage } from '@/lib/db/dexie';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { useState, useEffect } from 'react';
import { parseArtifacts, extractThinking } from '@/lib/artifact/parser';
import ThinkingBlock from './ThinkingBlock';
import 'katex/dist/katex.min.css';
import 'highlight.js/styles/github-dark.css';

interface MessageProps {
  message: DBMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
}

export default function Message({ message, isStreaming = false, onRegenerate, onEdit }: MessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  // Parse artifacts and thinking from content
  const { text: contentWithoutArtifacts, artifacts } = parseArtifacts(message.content);
  const { text: finalContent, thinking } = extractThinking(contentWithoutArtifacts);

  // Show artifact in panel when clicked
  const handleArtifactClick = (artifact: any) => {
    if (typeof window !== 'undefined' && (window as any).showArtifact) {
      (window as any).showArtifact(artifact);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        mb: 3,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'white',
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        {/* Thinking block */}
        {!isUser && thinking && <ThinkingBlock thinking={thinking} />}

        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: isUser ? 'primary.main' : 'background.paper',
            color: isUser ? 'primary.contrastText' : 'text.primary',
            borderRadius: 3,
            border: isUser ? 'none' : 1,
            borderColor: 'divider',
          }}
        >
          {isUser ? (
            <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {finalContent}
            </Typography>
          ) : (
            <Box
              className="markdown-content"
              sx={{
                '& p': { mb: 1, '&:last-child': { mb: 0 } },
                '& pre': {
                  position: 'relative',
                  p: 2,
                  borderRadius: 2,
                  overflow: 'auto',
                  bgcolor: 'rgba(0,0,0,0.05)',
                  '& code': {
                    fontFamily: 'var(--font-roboto-mono)',
                    fontSize: '0.875em',
                  },
                },
                '& code': {
                  fontFamily: 'var(--font-roboto-mono)',
                  fontSize: '0.875em',
                  bgcolor: 'rgba(0,0,0,0.05)',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  mb: 2,
                },
                '& th, & td': {
                  border: 1,
                  borderColor: 'divider',
                  p: 1,
                },
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeHighlight, rehypeSanitize]}
                components={{
                  pre: ({ children, ...props }) => (
                    <Box sx={{ position: 'relative' }}>
                      <pre {...props}>{children}</pre>
                      <CodeCopyButton code={extractCode(children)} />
                    </Box>
                  ),
                }}
              >
                {finalContent}
              </ReactMarkdown>
            </Box>
          )}
        </Paper>

        {/* Artifacts */}
        {!isUser && artifacts.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {artifacts.map((artifact) => (
              <Chip
                key={artifact.id}
                label={`📎 ${artifact.title}`}
                onClick={() => handleArtifactClick(artifact)}
                sx={{ mr: 1, mb: 1 }}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Actions */}
        {!isStreaming && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
            <Tooltip title={copied ? 'Tersalin!' : 'Salin'}>
              <IconButton size="small" onClick={handleCopy}>
                {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
              </IconButton>
            </Tooltip>

            {!isUser && (
              <>
                <Tooltip title="Regenerate">
                  <IconButton size="small" onClick={onRegenerate}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bagus">
                  <IconButton size="small">
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Kurang Bagus">
                  <IconButton size="small">
                    <ThumbDownIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {isUser && onEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(message.content)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

// Helper to extract code from markdown code block
function extractCode(children: any): string {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) {
    return children.map(child => extractCode(child)).join('');
  }
  if (children?.props?.children) {
    return extractCode(children.props.children);
  }
  return '';
}

// Copy button for code blocks
function CodeCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <IconButton
      size="small"
      onClick={handleCopy}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        bgcolor: 'background.paper',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
    </IconButton>
  );
}
