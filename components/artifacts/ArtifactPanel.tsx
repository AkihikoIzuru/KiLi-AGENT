'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/CloseRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import CodeIcon from '@mui/icons-material/CodeRounded';
import VisibilityIcon from '@mui/icons-material/VisibilityRounded';
import { type ParsedArtifact } from '@/lib/artifact/parser';
import ArtifactPreview from './ArtifactPreview';

interface ArtifactPanelProps {
  artifact: ParsedArtifact | null;
  onClose: () => void;
}

export default function ArtifactPanel({ artifact, onClose }: ArtifactPanelProps) {
  const [tab, setTab] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extension = artifact.type === 'html' ? 'html'
      : artifact.type === 'svg' ? 'svg'
      : artifact.type === 'markdown' ? 'md'
      : artifact.type === 'mermaid' ? 'mmd'
      : artifact.language || 'txt';

    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.title.replace(/[^a-z0-9]/gi, '-')}.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderLeft: 1,
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
            {artifact.title}
          </Typography>
          <Tooltip title="Tutup">
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ flexGrow: 1, minHeight: 36 }}>
            <Tab label="Pratinjau" value="preview" icon={<VisibilityIcon />} iconPosition="start" sx={{ minHeight: 36 }} />
            <Tab label="Kode" value="code" icon={<CodeIcon />} iconPosition="start" sx={{ minHeight: 36 }} />
          </Tabs>

          <Tooltip title={copied ? 'Tersalin!' : 'Salin'}>
            <IconButton size="small" onClick={handleCopy}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Unduh">
            <IconButton size="small" onClick={handleDownload}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {tab === 'preview' ? (
          <ArtifactPreview artifact={artifact} />
        ) : (
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
        )}
      </Box>
    </Paper>
  );
}
