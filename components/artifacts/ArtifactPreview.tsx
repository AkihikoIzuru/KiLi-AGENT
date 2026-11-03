'use client';

import { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { type ParsedArtifact } from '@/lib/artifact/parser';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArtifactPreviewProps {
  artifact: ParsedArtifact;
}

export default function ArtifactPreview({ artifact }: ArtifactPreviewProps) {
  const [error, setError] = useState<string | null>(null);

  if (artifact.type === 'html' || artifact.type === 'svg') {
    return <SandboxedPreview content={artifact.content} type={artifact.type} />;
  }

  if (artifact.type === 'markdown') {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {artifact.content}
        </ReactMarkdown>
      </Paper>
    );
  }

  if (artifact.type === 'mermaid') {
    return <MermaidPreview content={artifact.content} />;
  }

  if (artifact.type === 'code') {
    return (
      <Paper
        component="pre"
        sx={{
          p: 2,
          bgcolor: 'action.hover',
          overflow: 'auto',
          fontSize: '0.875rem',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          m: 0,
        }}
      >
        {artifact.content}
      </Paper>
    );
  }

  return (
    <Typography color="text.secondary">
      Tipe artifact tidak didukung: {artifact.type}
    </Typography>
  );
}

function SandboxedPreview({ content, type }: { content: string; type: 'html' | 'svg' }) {
  const [iframeHeight, setIframeHeight] = useState('400px');

  const fullContent = type === 'html'
    ? content.includes('<!DOCTYPE') || content.includes('<html')
      ? content
      : `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
  </style>
</head>
<body>
${content}
</body>
</html>`
    : `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 16px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    svg { max-width: 100%; height: auto; }
  </style>
</head>
<body>
${content}
</body>
</html>`;

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 400 }}>
      <iframe
        srcDoc={fullContent}
        sandbox="allow-scripts"
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          backgroundColor: 'white',
        }}
        title="Artifact Preview"
      />
    </Box>
  );
}

function MermaidPreview({ content }: { content: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import mermaid
    import('mermaid').then((mermaid) => {
      mermaid.default.initialize({
        startOnLoad: false,
        theme: 'default',
      });

      const id = `mermaid-${Date.now()}`;
      mermaid.default.render(id, content)
        .then(({ svg }) => setSvg(svg))
        .catch((err) => setError(err.message));
    }).catch((err) => {
      setError('Failed to load Mermaid library');
    });
  }, [content]);

  if (error) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
        <Typography color="error.dark">
          Gagal merender diagram: {error}
        </Typography>
      </Paper>
    );
  }

  if (!svg) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Typography color="text.secondary">Memuat diagram...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        justifyContent: 'center',
        '& svg': { maxWidth: '100%', height: 'auto' },
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
