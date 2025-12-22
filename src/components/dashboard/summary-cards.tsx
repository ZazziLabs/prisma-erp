import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface SummaryCardsProps {
  balance: number;
  income: number;
  expenses: number;
}

export function SummaryCards({ balance, income, expenses }: SummaryCardsProps) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline">{formatCurrency(balance)}</div>
          <p className="text-xs text-muted-foreground">Saldo total em caixa</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          <TrendingUp className="h-4 w-4 text-success-DEFAULT" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-success-DEFAULT">{formatCurrency(income)}</div>
          <p className="text-xs text-muted-foreground">Entradas no período</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-headline text-destructive">{formatCurrency(expenses)}</div>
          <p className="text-xs text-muted-foreground">Saídas no período</p>
        </CardContent>
      </Card>
    </>
  );
}
