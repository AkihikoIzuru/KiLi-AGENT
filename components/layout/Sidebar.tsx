'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Divider,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';
import MoreVertIcon from '@mui/icons-material/MoreVertRounded';
import PushPinIcon from '@mui/icons-material/PushPinRounded';
import SettingsIcon from '@mui/icons-material/SettingsRounded';
import EditIcon from '@mui/icons-material/EditRounded';
import DeleteIcon from '@mui/icons-material/DeleteRounded';
import DownloadIcon from '@mui/icons-material/DownloadRounded';
import { db, type Conversation } from '@/lib/db/dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { nanoid } from 'nanoid';
import RenameDialog from './RenameDialog';
import { downloadMarkdown } from '@/lib/db/export';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);

  const conversations = useLiveQuery(
    async () => {
      let query = db.conversations.orderBy('updatedAt').reverse();

      if (searchQuery) {
        const all = await query.toArray();
        return all.filter(conv =>
          conv.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      return query.toArray();
    },
    [searchQuery]
  );

  const handleNewChat = () => {
    const id = nanoid();
    router.push(`/c/${id}`);
    onClose?.();
  };

  const handleConversationClick = (id: string) => {
    router.push(`/c/${id}`);
    onClose?.();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, conversation: Conversation) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handlePin = async () => {
    if (selectedConversation) {
      await db.conversations.update(selectedConversation.id, {
        pinned: !selectedConversation.pinned,
      });
    }
    handleMenuClose();
  };

  const handleRename = () => {
    setRenameDialogOpen(true);
    handleMenuClose();
  };

  const handleRenameSubmit = async (newTitle: string) => {
    if (selectedConversation) {
      await db.conversations.update(selectedConversation.id, {
        title: newTitle,
        updatedAt: Date.now(),
      });
    }
  };

  const handleExport = async () => {
    if (selectedConversation) {
      try {
        await downloadMarkdown(selectedConversation.id);
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedConversation) {
      await db.conversations.delete(selectedConversation.id);
      await db.messages.where('conversationId').equals(selectedConversation.id).delete();
    }
    setDeleteDialogOpen(false);
    setSelectedConversation(null);
  };

  // Group conversations by date
  const groupedConversations = conversations?.reduce((groups, conv) => {
    const now = Date.now();
    const convDate = conv.updatedAt;
    const dayMs = 24 * 60 * 60 * 1000;

    let group: string;
    if (now - convDate < dayMs) {
      group = 'Hari ini';
    } else if (now - convDate < 2 * dayMs) {
      group = 'Kemarin';
    } else if (now - convDate < 7 * dayMs) {
      group = '7 hari terakhir';
    } else {
      group = 'Lebih lama';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  // Separate pinned conversations
  const pinnedConversations = conversations?.filter(c => c.pinned) || [];
  const groupOrder = ['Hari ini', 'Kemarin', '7 hari terakhir', 'Lebih lama'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{ mb: 2 }}
        >
          Chat Baru
        </Button>

        <TextField
          fullWidth
          size="small"
          placeholder="Cari percakapan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Conversation list */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <List sx={{ py: 0 }}>
          {/* Pinned conversations */}
          {pinnedConversations.length > 0 && (
            <>
              <ListItem sx={{ px: 1, py: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Disematkan
                </Typography>
              </ListItem>
              {pinnedConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  onClick={() => handleConversationClick(conv.id)}
                  onMenuClick={(e) => handleMenuOpen(e, conv)}
                />
              ))}
              <Divider sx={{ my: 1 }} />
            </>
          )}

          {/* Grouped conversations */}
          {groupedConversations && groupOrder.map((group) => {
            const convs = groupedConversations[group]?.filter(c => !c.pinned);
            if (!convs || convs.length === 0) return null;

            return (
              <Box key={group}>
                <ListItem sx={{ px: 1, py: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {group}
                  </Typography>
                </ListItem>
                {convs.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    onClick={() => handleConversationClick(conv.id)}
                    onMenuClick={(e) => handleMenuOpen(e, conv)}
                  />
                ))}
              </Box>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Button
          fullWidth
          startIcon={<SettingsIcon />}
          onClick={() => {
            router.push('/settings');
            onClose?.();
          }}
        >
          Pengaturan
        </Button>
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handlePin}>
          <PushPinIcon sx={{ mr: 1, fontSize: 20 }} />
          {selectedConversation?.pinned ? 'Lepas Pin' : 'Pin'}
        </MenuItem>
        <MenuItem onClick={handleRename}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Ganti Nama
        </MenuItem>
        <MenuItem onClick={handleExport}>
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Ekspor ke Markdown
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Hapus
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <RenameDialog
        open={renameDialogOpen}
        currentTitle={selectedConversation?.title || ''}
        onClose={() => setRenameDialogOpen(false)}
        onRename={handleRenameSubmit}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Hapus Percakapan?</DialogTitle>
        <DialogContent>
          <Typography>
            Yakin ingin menghapus percakapan ini? Tindakan ini tidak dapat dibatalkan.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function ConversationItem({
  conversation,
  onClick,
  onMenuClick,
}: {
  conversation: Conversation;
  onClick: () => void;
  onMenuClick: (e: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
    <ListItem
      disablePadding
      secondaryAction={
        <IconButton edge="end" size="small" onClick={onMenuClick}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      }
    >
      <ListItemButton onClick={onClick} sx={{ borderRadius: 2 }}>
        <ListItemText
          primary={conversation.title || 'Percakapan Baru'}
          primaryTypographyProps={{
            noWrap: true,
            fontSize: '0.875rem',
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
