'use server';

/**
 * @fileOverview This file defines a Genkit flow for detecting anomalies in cash flow patterns and alerting users to potential issues.
 *
 * - `detectCashFlowAnomaly`: Detects anomalies in cash flow and provides alerts.
 * - `CashFlowAnomalyInput`: The input type for the `detectCashFlowAnomaly` function.
 * - `CashFlowAnomalyOutput`: The return type for the `detectCashFlowAnomaly` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CashFlowDataSchema = z.object({
  date: z.string().describe('The date of the cash flow record (YYYY-MM-DD).'),
  income: z.number().describe('The total income for the day.'),
  expenses: z.number().describe('The total expenses for the day.'),
});

const CashFlowAnomalyInputSchema = z.object({
  cashFlowData: z.array(CashFlowDataSchema).describe('An array of daily cash flow records.'),
});
export type CashFlowAnomalyInput = z.infer<typeof CashFlowAnomalyInputSchema>;

const CashFlowAnomalyOutputSchema = z.object({
  isAnomalyDetected: z.boolean().describe('Whether an anomaly is detected in the cash flow.'),
  alertMessage: z.string().describe('A message describing the anomaly and suggesting actions.'),
});
export type CashFlowAnomalyOutput = z.infer<typeof CashFlowAnomalyOutputSchema>;

export async function detectCashFlowAnomaly(input: CashFlowAnomalyInput): Promise<CashFlowAnomalyOutput> {
  return detectCashFlowAnomalyFlow(input);
}

const detectCashFlowAnomalyPrompt = ai.definePrompt({
  name: 'detectCashFlowAnomalyPrompt',
  input: {
    schema: CashFlowAnomalyInputSchema,
  },
  output: {
    schema: CashFlowAnomalyOutputSchema,
  },
  prompt: `You are an AI assistant specializing in financial analysis and anomaly detection.
  Your task is to analyze the provided cash flow data and identify any unusual patterns or deviations from expected trends.

  Cash Flow Data:
  {{#each cashFlowData}}
  - Date: {{date}}, Income: {{income}}, Expenses: {{expenses}}
  {{/each}}

  Based on this data, determine if there is an anomaly in the cash flow.
  An anomaly could be a sudden increase in expenses, a significant drop in income, or any other unusual pattern.

  If an anomaly is detected, set isAnomalyDetected to true and provide a detailed alertMessage explaining the anomaly and suggesting actions to take.
  If no anomaly is detected, set isAnomalyDetected to false and provide a message indicating that the cash flow is within expected parameters.
  Make sure that isAnomalyDetected and alertMessage are properly set according to the anomaly detection result.
  Consider recent trends and historical data patterns when performing the analysis.
  The cashFlowData contains all information you need to answer.`,
});

const detectCashFlowAnomalyFlow = ai.defineFlow(
  {
    name: 'detectCashFlowAnomalyFlow',
    inputSchema: CashFlowAnomalyInputSchema,
    outputSchema: CashFlowAnomalyOutputSchema,
  },
  async input => {
    const {output} = await detectCashFlowAnomalyPrompt(input);
    return output!;
  }
);
