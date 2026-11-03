'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

interface RenameDialogProps {
  open: boolean;
  currentTitle: string;
  onClose: () => void;
  onRename: (newTitle: string) => void;
}

export default function RenameDialog({
  open,
  currentTitle,
  onClose,
  onRename,
}: RenameDialogProps) {
  const [title, setTitle] = useState(currentTitle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onRename(title.trim());
      onClose();
    }
  };

  const handleClose = () => {
    setTitle(currentTitle);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Ganti Nama Percakapan</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Judul"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Batal</Button>
          <Button type="submit" variant="contained" disabled={!title.trim()}>
            Simpan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
