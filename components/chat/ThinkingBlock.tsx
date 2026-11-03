'use client';

import { Box, Paper, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import PsychologyIcon from '@mui/icons-material/PsychologyRounded';

interface ThinkingBlockProps {
  thinking: string;
}

export default function ThinkingBlock({ thinking }: ThinkingBlockProps) {
  if (!thinking) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Accordion
        sx={{
          boxShadow: 'none',
          border: 1,
          borderColor: 'divider',
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: 'action.hover' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PsychologyIcon fontSize="small" color="primary" />
            <Typography variant="body2" fontWeight={600}>
              Berpikir...
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography
            variant="body2"
            component="pre"
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              m: 0,
            }}
          >
            {thinking}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
