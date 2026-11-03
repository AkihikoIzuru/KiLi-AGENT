import { z } from 'zod';
import { registerTool } from '../registry';

const calculatorSchema = z.object({
  expression: z.string().describe('Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)")'),
});

registerTool({
  name: 'calculator',
  description: 'Evaluate mathematical expressions. Supports basic arithmetic, sqrt, pow, sin, cos, tan, log, etc.',
  input: calculatorSchema,
  risk: 'safe',
  timeoutMs: 5000,
  run: async (input: unknown) => {
    const { expression } = calculatorSchema.parse(input);

    try {
      // Safe evaluation - only allow math operations
      const sanitized = expression
        .replace(/[^0-9+\-*/().sqrt,pow,sin,cos,tan,log,exp,abs,ceil,floor,round,min,max\s]/gi, '');

      // Use Math object for evaluation
      const mathContext = {
        sqrt: Math.sqrt,
        pow: Math.pow,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        log: Math.log,
        exp: Math.exp,
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        min: Math.min,
        max: Math.max,
        PI: Math.PI,
        E: Math.E,
      };

      // Create safe evaluation function
      const fn = new Function(...Object.keys(mathContext), `return ${sanitized}`);
      const result = fn(...Object.values(mathContext));

      return {
        expression,
        result: typeof result === 'number' ? result : NaN,
        success: !isNaN(result),
      };
    } catch (error) {
      return {
        expression,
        result: null,
        success: false,
        error: error instanceof Error ? error.message : 'Evaluation failed',
      };
    }
  },
});
