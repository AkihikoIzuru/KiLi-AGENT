'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
  Typography,
  Skeleton,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();
  const [models, setModels] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchModels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/models');
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        if (data.models?.length > 0 && !selectedModel) {
          setSelectedModel(data.models[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        height: 56,
        px: 2,
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
      }}
    >
      {/* Model Selector */}
      {loading ? (
        <Skeleton variant="rounded" width={200} height={32} />
      ) : (
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <Select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            displayEmpty
            sx={{
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 0.75,
              },
            }}
          >
            {models.length === 0 && (
              <MenuItem value="" disabled>
                <Typography variant="body2" color="text.secondary">
                  No models available
                </Typography>
              </MenuItem>
            )}
            {models.map((model) => (
              <MenuItem key={model.id} value={model.id} sx={{ fontSize: '0.875rem' }}>
                {model.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Box sx={{ flexGrow: 1 }} />

      {/* Settings Button */}
      <Tooltip title="Settings" arrow>
        <IconButton
          onClick={() => router.push('/settings')}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
            },
          }}
        >
          <SettingsIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
