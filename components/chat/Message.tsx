'use client';

import { Box, IconButton, Tooltip, Stack, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/PersonRounded';
import SmartToyIcon from '@mui/icons-material/SmartToyRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import CheckIcon from '@mui/icons-material/CheckRounded';
import CodeIcon from '@mui/icons-material/CodeRounded';
import { type Message as DBMessage } from '@/lib/db/dexie';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import { useState } from 'react';
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

export default function Message({ message, isStreaming = false }: MessageProps) {
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
        mb: 4,
        alignItems: 'flex-start',
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1,
          bgcolor: isUser ? 'primary.main' : 'background.paper',
          border: isUser ? 'none' : 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: isUser ? 'white' : 'text.secondary',
        }}
      >
        {isUser ? <PersonIcon sx={{ fontSize: 18 }} /> : <SmartToyIcon sx={{ fontSize: 18 }} />}
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: 'calc(100% - 48px)' }}>
        {/* Thinking block */}
        {!isUser && thinking && <ThinkingBlock thinking={thinking} />}

        {/* Message content */}
        <Box>
          {isUser ? (
            <Box
              sx={{
                color: 'text.primary',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {finalContent}
            </Box>
          ) : (
            <Box
              className="markdown-content"
              sx={{
                color: 'text.primary',
                fontSize: '0.9375rem',
                lineHeight: 1.6,
                '& p': {
                  mb: 1.5,
                  '&:last-child': { mb: 0 },
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontWeight: 600,
                  mt: 2,
                  mb: 1,
                  '&:first-of-type': { mt: 0 },
                },
                '& ul, & ol': {
                  pl: 3,
                  mb: 1.5,
                },
                '& li': {
                  mb: 0.5,
                },
                '& pre': {
                  position: 'relative',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  mb: 1.5,
                  '& code': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    lineHeight: 1.6,
                  },
                },
                '& code': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  bgcolor: 'action.hover',
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 0.5,
                },
                '& pre code': {
                  bgcolor: 'transparent',
                  p: 0,
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  mb: 1.5,
                  fontSize: '0.875rem',
                },
                '& th, & td': {
                  border: 1,
                  borderColor: 'divider',
                  p: 1,
                  textAlign: 'left',
                },
                '& th': {
                  bgcolor: 'action.hover',
                  fontWeight: 600,
                },
                '& blockquote': {
                  borderLeft: 3,
                  borderColor: 'divider',
                  pl: 2,
                  py: 0.5,
                  my: 1.5,
                  color: 'text.secondary',
                },
                '& a': {
                  color: 'secondary.main',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                },
                '& img': {
                  maxWidth: '100%',
                  borderRadius: 1,
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
        </Box>

        {/* Artifacts */}
        {!isUser && artifacts.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            {artifacts.map((artifact) => (
              <Chip
                key={artifact.id}
                icon={<CodeIcon sx={{ fontSize: 16 }} />}
                label={artifact.title}
                onClick={() => handleArtifactClick(artifact)}
                sx={{ mr: 1, mb: 1 }}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}

        {/* Actions */}
        {!isStreaming && !isUser && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              mt: 1,
              opacity: 0.7,
              '&:hover': { opacity: 1 },
              transition: 'opacity 0.15s',
            }}
          >
            <Tooltip title={copied ? 'Copied!' : 'Copy'} arrow>
              <IconButton size="small" onClick={handleCopy} sx={{ color: 'text.secondary' }}>
                {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          </Stack>
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <Box
            sx={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: 'secondary.main',
              mt: 1,
              animation: 'pulse 1.5s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.3 },
              },
            }}
          />
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
    <Tooltip title={copied ? 'Copied!' : 'Copy code'} arrow>
      <IconButton
        size="small"
        onClick={handleCopy}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: 'background.default',
          border: 1,
          borderColor: 'divider',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
      </IconButton>
    </Tooltip>
  );
}
