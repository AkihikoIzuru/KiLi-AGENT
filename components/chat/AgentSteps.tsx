'use client';

import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Stack,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMoreRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorIcon from '@mui/icons-material/ErrorRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTimeRounded';

interface AgentStep {
  id: string;
  toolName: string;
  input: any;
  output?: any;
  status: 'running' | 'success' | 'error' | 'pending_approval';
  startTime: number;
  endTime?: number;
  error?: string;
}

interface AgentStepsProps {
  steps: AgentStep[];
  currentStep?: number;
  maxSteps?: number;
}

export default function AgentSteps({ steps, currentStep = 0, maxSteps = 10 }: AgentStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Langkah Agent
          </Typography>
          <Chip
            label={`${currentStep}/${maxSteps}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>

        <Stack spacing={1}>
          {steps.map((step, index) => (
            <Accordion
              key={step.id}
              defaultExpanded={index === steps.length - 1}
              sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                border: 1,
                borderColor: 'divider',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                  {step.status === 'running' && <CircularProgress size={16} />}
                  {step.status === 'success' && <CheckCircleIcon fontSize="small" color="success" />}
                  {step.status === 'error' && <ErrorIcon fontSize="small" color="error" />}
                  {step.status === 'pending_approval' && <AccessTimeIcon fontSize="small" color="warning" />}

                  <Typography variant="body2" fontWeight={500}>
                    {step.toolName}
                  </Typography>

                  {step.endTime && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      {((step.endTime - step.startTime) / 1000).toFixed(1)}s
                    </Typography>
                  )}
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Input:
                  </Typography>
                  <Paper sx={{ p: 1, mt: 0.5, mb: 1.5, bgcolor: 'action.hover' }}>
                    <Typography variant="body2" component="pre" sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                    }}>
                      {JSON.stringify(step.input, null, 2)}
                    </Typography>
                  </Paper>

                  {step.output && (
                    <>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Output:
                      </Typography>
                      <Paper sx={{ p: 1, mt: 0.5, bgcolor: 'action.hover' }}>
                        <Typography variant="body2" component="pre" sx={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                        }}>
                          {JSON.stringify(step.output, null, 2)}
                        </Typography>
                      </Paper>
                    </>
                  )}

                  {step.error && (
                    <Paper sx={{ p: 1, mt: 1, bgcolor: 'error.light', color: 'error.dark' }}>
                      <Typography variant="body2">
                        {step.error}
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}
