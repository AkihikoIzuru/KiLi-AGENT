'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Snackbar,
} from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { exportAllData, importData } from '@/lib/db/export';

export default function SettingsPage() {
  const router = useRouter();
  const settings = useLiveQuery(() => db.settings.get('global'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customInstructions, setCustomInstructions] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (settings) {
      setCustomInstructions(settings.customInstructions || '');
      setTheme(settings.theme);
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleSave = async () => {
    await db.settings.update('global', {
      customInstructions,
      theme,
      language,
    });
    setSnackbar({ open: true, message: 'Pengaturan berhasil disimpan', severity: 'success' });
  };

  const handleExport = async () => {
    try {
      await exportAllData();
      setSnackbar({ open: true, message: 'Data berhasil diekspor', severity: 'success' });
    } catch (error) {
      console.error('Export failed:', error);
      setSnackbar({ open: true, message: 'Gagal mengekspor data', severity: 'error' });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importData(file);
      setSnackbar({
        open: true,
        message: `Berhasil mengimpor ${result.conversations} percakapan dan ${result.messages} pesan`,
        severity: 'success'
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Import failed:', error);
      setSnackbar({ open: true, message: 'Gagal mengimpor data. Pastikan file valid.', severity: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={600}>
          Pengaturan
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sesuaikan aplikasi sesuai preferensi Anda
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Umum
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tema</InputLabel>
          <Select
            value={theme}
            label="Tema"
            onChange={(e) => setTheme(e.target.value as any)}
          >
            <MenuItem value="light">Terang</MenuItem>
            <MenuItem value="dark">Gelap</MenuItem>
            <MenuItem value="system">Ikuti Sistem</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Bahasa</InputLabel>
          <Select
            value={language}
            label="Bahasa"
            onChange={(e) => setLanguage(e.target.value as any)}
          >
            <MenuItem value="id">Indonesia</MenuItem>
            <MenuItem value="en">English</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Instruksi Kustom"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Tambahkan instruksi kustom untuk AI..."
          helperText="Instruksi ini akan ditambahkan ke setiap percakapan"
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={handleSave}>
          Simpan Perubahan
        </Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Ekspor atau impor data aplikasi Anda. Data disimpan lokal di perangkat ini.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={handleExport}>
            Ekspor Data (JSON)
          </Button>
          <Button variant="outlined" onClick={handleImportClick}>
            Impor Data
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          💡 <strong>Tip:</strong> Ekspor data Anda secara berkala untuk backup. Data hanya tersimpan di browser dan akan hilang jika Anda menghapus data situs.
        </Alert>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Akun
        </Typography>
        <Button variant="outlined" color="error" onClick={handleLogout}>
          Keluar
        </Button>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
