"use client";

import { useState } from "react";
import type { Transaction } from "@/lib/types";
import { detectCashFlowAnomaly, type CashFlowAnomalyOutput } from "@/ai/flows/cash-flow-anomaly-detection";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrainCircuit, Loader, AlertTriangle, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AiAnalysisCardProps {
  transactions: Transaction[];
}

export function AiAnalysisCard({ transactions }: AiAnalysisCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CashFlowAnomalyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      // 1. Process transactions into daily summaries
      const dailySummary = transactions.reduce((acc, t) => {
        const date = t.date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = { date, income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          acc[date].income += t.amount;
        } else {
          acc[date].expenses += t.amount;
        }
        return acc;
      }, {} as Record<string, { date: string, income: number, expenses: number }>);

      const cashFlowData = Object.values(dailySummary);

      if (cashFlowData.length < 3) {
          setError("É necessário ter pelo menos 3 dias de transações para uma análise eficaz.");
          setIsLoading(false);
          return;
      }

      // 2. Call the GenAI flow
      const result = await detectCashFlowAnomaly({ cashFlowData });
      setAnalysisResult(result);

    } catch (e) {
      console.error(e);
      setError("Ocorreu um erro ao conectar com o serviço de IA. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            Alertas Inteligentes
        </CardTitle>
        <CardDescription>
          Use IA para monitorar os padrões de fluxo de caixa e receber alertas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleAnalysis} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Analisando...
            </>
          ) : (
            "Analisar Fluxo de Caixa"
          )}
        </Button>
        
        {isLoading && (
            <div className="space-y-2 pt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        )}

        {error && (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Erro na Análise</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {analysisResult && (
          <Alert variant={analysisResult.isAnomalyDetected ? "destructive" : "default"} className={!analysisResult.isAnomalyDetected ? "border-success-light bg-success-light/20" : ""}>
            {analysisResult.isAnomalyDetected ? (
                <AlertTriangle className="h-4 w-4" />
            ) : (
                <CheckCircle className="h-4 w-4 text-success-DEFAULT" />
            )}
            <AlertTitle className={!analysisResult.isAnomalyDetected ? "text-success-DEFAULT" : ""}>
              {analysisResult.isAnomalyDetected ? "Alerta de Anomalia" : "Análise Concluída"}
            </AlertTitle>
            <AlertDescription>
              {analysisResult.alertMessage}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
