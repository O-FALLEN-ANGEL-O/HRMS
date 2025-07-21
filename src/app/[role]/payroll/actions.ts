
'use server';

import { detectPayrollErrors, type DetectPayrollErrorsInput, type DetectPayrollErrorsOutput } from '@/ai/flows/detect-payroll-errors';

export async function detectPayrollErrorsAction(input: DetectPayrollErrorsInput): Promise<DetectPayrollErrorsOutput> {
  return await detectPayrollErrors(input);
}
