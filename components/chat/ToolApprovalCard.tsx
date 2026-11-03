'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Paper,
} from '@mui/material';

interface ToolApprovalProps {
  open: boolean;
  toolName: string;
  toolDescription: string;
  input: any;
  onApprove: (mode: 'once' | 'session') => void;
  onReject: () => void;
}

export default function ToolApprovalCard({
  open,
  toolName,
  toolDescription,
  input,
  onApprove,
  onReject,
}: ToolApprovalProps) {
  return (
    <Dialog open={open} onClose={onReject} maxWidth="sm" fullWidth>
      <DialogTitle>Persetujuan Tool Diperlukan</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Agent ingin menggunakan tool berikut:
        </Typography>

        <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {toolName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {toolDescription}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Input:
          </Typography>
          <Box
            component="pre"
            sx={{
              mt: 0.5,
              p: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              fontSize: '0.75rem',
              overflow: 'auto',
              maxHeight: 200,
            }}
          >
            {JSON.stringify(input, null, 2)}
          </Box>
        </Paper>

        <Typography variant="body2" color="text.secondary">
          Apakah Anda ingin mengizinkan penggunaan tool ini?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onReject} color="error">
          Tolak
        </Button>
        <Button onClick={() => onApprove('once')} variant="outlined">
          Izinkan Sekali
        </Button>
        <Button onClick={() => onApprove('session')} variant="contained">
          Izinkan untuk Sesi Ini
        </Button>
      </DialogActions>
    </Dialog>
  );
}
