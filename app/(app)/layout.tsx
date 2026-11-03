'use client';

import { ReactNode, useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/MenuRounded';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import ArtifactPanel from '@/components/artifacts/ArtifactPanel';
import { type ParsedArtifact } from '@/lib/artifact/parser';

const DRAWER_WIDTH = 280;
const ARTIFACT_WIDTH = 480;

export default function AppLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentArtifact, setCurrentArtifact] = useState<ParsedArtifact | null>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Pass artifact handlers to children via context or props
  // For now, we'll use window event
  if (typeof window !== 'undefined') {
    (window as any).showArtifact = setCurrentArtifact;
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          <Sidebar />
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          width: {
            md: currentArtifact
              ? `calc(100% - ${DRAWER_WIDTH + ARTIFACT_WIDTH}px)`
              : `calc(100% - ${DRAWER_WIDTH}px)`
          },
        }}
      >
        {/* Top bar */}
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
                aria-label="open menu"
              >
                <MenuIcon />
              </IconButton>
            )}
            <TopBar />
          </Toolbar>
        </AppBar>

        {/* Chat area */}
        <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>

      {/* Artifact Panel */}
      {currentArtifact && !isMobile && (
        <Box
          sx={{
            width: ARTIFACT_WIDTH,
            flexShrink: 0,
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <ArtifactPanel
            artifact={currentArtifact}
            onClose={() => setCurrentArtifact(null)}
          />
        </Box>
      )}

      {/* Mobile artifact (full screen) */}
      {currentArtifact && isMobile && (
        <Drawer
          anchor="right"
          open
          onClose={() => setCurrentArtifact(null)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '100%',
            },
          }}
        >
          <ArtifactPanel
            artifact={currentArtifact}
            onClose={() => setCurrentArtifact(null)}
          />
        </Drawer>
      )}
    </Box>
  );
}
