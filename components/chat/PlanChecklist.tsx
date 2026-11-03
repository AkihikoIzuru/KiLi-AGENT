'use client';

import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ErrorIcon from '@mui/icons-material/ErrorRounded';

interface PlanStep {
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

interface PlanChecklistProps {
  steps: PlanStep[];
}

export default function PlanChecklist({ steps }: PlanChecklistProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: 1,
        borderColor: 'primary.main',
        bgcolor: 'primary.50',
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
        📋 Rencana
      </Typography>
      <List dense sx={{ py: 0 }}>
        {steps.map((step, index) => (
          <ListItem key={index} sx={{ py: 0.5, px: 0 }}>
            <ListItemIcon sx={{ minWidth: 32 }}>
              {step.status === 'completed' && (
                <CheckCircleIcon fontSize="small" color="success" />
              )}
              {step.status === 'failed' && (
                <ErrorIcon fontSize="small" color="error" />
              )}
              {(step.status === 'pending' || step.status === 'in_progress') && (
                <RadioButtonUncheckedIcon
                  fontSize="small"
                  color={step.status === 'in_progress' ? 'primary' : 'disabled'}
                />
              )}
            </ListItemIcon>
            <ListItemText
              primary={step.description}
              primaryTypographyProps={{
                variant: 'body2',
                sx: {
                  textDecoration: step.status === 'completed' ? 'line-through' : 'none',
                  color: step.status === 'completed' ? 'text.secondary' : 'text.primary',
                  fontWeight: step.status === 'in_progress' ? 600 : 400,
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
