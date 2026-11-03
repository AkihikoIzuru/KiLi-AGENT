import { z } from 'zod';
import { registerTool } from '../registry';

const updatePlanSchema = z.object({
  steps: z.array(z.object({
    description: z.string(),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed']),
  })).describe('List of plan steps with their status'),
});

registerTool({
  name: 'update_plan',
  description: 'Update the task plan/checklist shown to the user. Use this to communicate your progress.',
  input: updatePlanSchema,
  risk: 'safe',
  timeoutMs: 1000,
  run: async (input: unknown) => {
    const { steps } = updatePlanSchema.parse(input);

    // This returns the plan which will be displayed in UI
    return {
      plan: steps,
      updated_at: new Date().toISOString(),
    };
  },
});
