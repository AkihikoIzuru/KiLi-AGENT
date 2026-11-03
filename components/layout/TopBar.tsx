'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  FormControl,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const router = useRouter();
  const [models, setModels] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedModel, setSelectedModel] = useState('');

  const fetchModels = useCallback(async () => {
    try {
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
    }
  }, [selectedModel]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <Select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          displayEmpty
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ flexGrow: 1 }} />

      <Tooltip title="Pengaturan">
        <IconButton onClick={() => router.push('/settings')}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
