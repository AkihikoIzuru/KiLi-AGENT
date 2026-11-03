'use client';

import { ReactNode, useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import CloseIcon from '@mui/icons-material/CloseRounded';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ArtifactPanel from '@/components/artifacts/ArtifactPanel';
import { type ParsedArtifact } from '@/lib/artifact/parser';

const DRAWER_WIDTH = 260;
const ARTIFACT_WIDTH = 480;

export default function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<ParsedArtifact | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Global artifact handler
  if (typeof window !== 'undefined') {
    (window as any).showArtifact = setCurrentArtifact;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Sidebar - Desktop */}
      {!isMobile && (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            height: '100vh',
            borderRight: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Sidebar />
        </Box>
      )}

      {/* Sidebar - Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
          },
        }}
      >
        <Sidebar onClose={handleDrawerToggle} />
      </Drawer>

      {/* Main Content Area */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Top Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 56,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
            px: isMobile ? 1 : 0,
          }}
        >
          {isMobile && (
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              size="small"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <TopBar />
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </Box>
      </Box>

      {/* Artifact Panel - Desktop */}
      {currentArtifact && !isMobile && (
        <Box
          sx={{
            width: ARTIFACT_WIDTH,
            flexShrink: 0,
            height: '100vh',
            borderLeft: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ArtifactPanel
            artifact={currentArtifact}
            onClose={() => setCurrentArtifact(null)}
          />
        </Box>
      )}

      {/* Artifact Panel - Mobile Drawer */}
      {currentArtifact && isMobile && (
        <Drawer
          anchor="right"
          open
          onClose={() => setCurrentArtifact(null)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '100%',
              border: 'none',
            },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              p: 1,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <IconButton onClick={() => setCurrentArtifact(null)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <ArtifactPanel
            artifact={currentArtifact}
            onClose={() => setCurrentArtifact(null)}
          />
        </Drawer>
      )}
    </Box>
  );
}
