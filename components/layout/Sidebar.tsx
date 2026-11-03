'use client';

import { useState } from 'react';
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
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
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

  // Group conversations
  const groupedConversations = conversations?.reduce((groups, conv) => {
    const now = Date.now();
    const convDate = conv.updatedAt;
    const dayMs = 24 * 60 * 60 * 1000;

    let group: string;
    if (now - convDate < dayMs) {
      group = 'Today';
    } else if (now - convDate < 7 * dayMs) {
      group = 'Last 7 days';
    } else if (now - convDate < 30 * dayMs) {
      group = 'Last 30 days';
    } else {
      group = 'Older';
    }

    if (!groups[group]) groups[group] = [];
    groups[group].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const pinnedConversations = conversations?.filter(c => c.pinned) || [];
  const groupOrder = ['Today', 'Last 7 days', 'Last 30 days', 'Older'];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Button
          fullWidth
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleNewChat}
          sx={{ mb: 1.5, justifyContent: 'flex-start', px: 2 }}
        >
          New Chat
        </Button>

        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
            },
          }}
        />
      </Box>

      {/* Conversation list */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          px: 1,
          '&::-webkit-scrollbar': {
            width: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'divider',
            borderRadius: 3,
          },
        }}
      >
        {conversations && conversations.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '200px',
              color: 'text.secondary',
            }}
          >
            <ChatBubbleOutlineIcon sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
            <Typography variant="body2">No conversations yet</Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {/* Pinned */}
            {pinnedConversations.length > 0 && (
              <>
                <ListItem sx={{ px: 1, py: 1, minHeight: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontSize: '0.6875rem',
                    }}
                  >
                    Pinned
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
                <Box sx={{ height: 12 }} />
              </>
            )}

            {/* Grouped */}
            {groupedConversations && groupOrder.map((group) => {
              const convs = groupedConversations[group]?.filter(c => !c.pinned);
              if (!convs || convs.length === 0) return null;

              return (
                <Box key={group}>
                  <ListItem sx={{ px: 1, py: 1, minHeight: 0 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontSize: '0.6875rem',
                      }}
                    >
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
                  <Box sx={{ height: 8 }} />
                </Box>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          pt: 1.5,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Button
          fullWidth
          variant="text"
          startIcon={<SettingsIcon />}
          onClick={() => {
            router.push('/settings');
            onClose?.();
          }}
          sx={{
            justifyContent: 'flex-start',
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
        >
          Settings
        </Button>
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handlePin} sx={{ fontSize: '0.875rem' }}>
          <PushPinIcon sx={{ mr: 1.5, fontSize: 18 }} />
          {selectedConversation?.pinned ? 'Unpin' : 'Pin'}
        </MenuItem>
        <MenuItem onClick={handleRename} sx={{ fontSize: '0.875rem' }}>
          <EditIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Rename
        </MenuItem>
        <MenuItem onClick={handleExport} sx={{ fontSize: '0.875rem' }}>
          <DownloadIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Export
        </MenuItem>
        <Box sx={{ my: 0.5, borderTop: 1, borderColor: 'divider' }} />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main', fontSize: '0.875rem' }}>
          <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Rename dialog */}
      <RenameDialog
        open={renameDialogOpen}
        currentTitle={selectedConversation?.title || ''}
        onClose={() => setRenameDialogOpen(false)}
        onRename={handleRenameSubmit}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Delete conversation?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This conversation will be permanently deleted. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="text">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
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
      sx={{
        mb: 0.5,
        '&:hover .menu-button': {
          opacity: 1,
        },
      }}
      secondaryAction={
        <IconButton
          className="menu-button"
          edge="end"
          size="small"
          onClick={onMenuClick}
          sx={{
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      }
    >
      <ListItemButton
        onClick={onClick}
        sx={{
          borderRadius: 1,
          px: 1.5,
          py: 1,
          minHeight: 0,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <ListItemText
          primary={conversation.title || 'New conversation'}
          primaryTypographyProps={{
            noWrap: true,
            fontSize: '0.875rem',
            fontWeight: 400,
          }}
        />
      </ListItemButton>
    </ListItem>
  );
}
