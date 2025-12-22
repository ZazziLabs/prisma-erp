"use client";

import { useMemo } from "react";
import type { Transaction } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { format, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ReportsAndTransactionsProps {
  transactions: Transaction[];
}

const chartConfig = {
  income: {
    label: "Entradas",
    color: "hsl(var(--chart-2))",
  },
  expenses: {
    label: "Saídas",
    color: "hsl(var(--destructive))",
  },
} satisfies ChartConfig;

const processDataForChart = (transactions: Transaction[], interval: 'daily' | 'weekly' | 'monthly') => {
    const now = startOfToday();
    let dateInterval: Interval;

    if (interval === 'weekly') {
        dateInterval = { start: startOfWeek(now), end: endOfWeek(now) };
    } else if (interval === 'monthly') {
        dateInterval = { start: startOfMonth(now), end: endOfMonth(now) };
    } else {
        dateInterval = { start: now, end: now };
    }

    const filtered = transactions.filter(t => isWithinInterval(t.date, dateInterval));
    
    const grouped = filtered.reduce((acc, t) => {
        const day = format(t.date, "dd/MM");
        if (!acc[day]) {
            acc[day] = { date: day, income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
            acc[day].income += t.amount;
        } else {
            acc[day].expenses += t.amount;
        }
        return acc;
    }, {} as Record<string, { date: string, income: number, expenses: number }>);

    return Object.values(grouped);
};


export function ReportsAndTransactions({ transactions }: ReportsAndTransactionsProps) {
  const weeklyData = useMemo(() => processDataForChart(transactions, 'weekly'), [transactions]);
  const monthlyData = useMemo(() => processDataForChart(transactions, 'monthly'), [transactions]);

  const sortedTransactions = useMemo(() => [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime()), [transactions]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Visão Geral</CardTitle>
        <CardDescription>Analise suas movimentações e relatórios de caixa.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="reports">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reports">Resumos e Relatórios</TabsTrigger>
            <TabsTrigger value="all">Organização Diária</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="space-y-6 pt-4">
              <Tabs defaultValue="weekly">
                  <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="weekly">Semanal</TabsTrigger>
                      <TabsTrigger value="monthly">Mensal</TabsTrigger>
                  </TabsList>
                  <TabsContent value="weekly">
                    <ChartCard data={weeklyData} description="Resumo das movimentações da semana." />
                  </TabsContent>
                  <TabsContent value="monthly">
                    <ChartCard data={monthlyData} description="Resumo das movimentações do mês." />
                  </TabsContent>
              </Tabs>
          </TabsContent>

          <TabsContent value="all" className="pt-4">
            <TransactionsTable transactions={sortedTransactions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function ChartCard({ data, description }: { data: any[], description: string }) {
    if (data.length === 0) {
        return <div className="flex items-center justify-center text-center text-muted-foreground py-16">{description}<br />Nenhuma transação encontrada para este período.</div>
    }
    return (
        <Card>
            <CardHeader>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <BarChart data={data}>
                            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                            <YAxis tickFormatter={(value) => formatCurrency(value as number).replace('R$', '')} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return <div className="flex items-center justify-center text-center text-muted-foreground py-16">Nenhuma transação registrada ainda.</div>
  }
  return (
    <div className="relative max-h-[400px] overflow-auto">
        <Table>
        <TableHeader>
            <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {transactions.map((t) => (
            <TableRow key={t.id}>
                <TableCell className="font-medium">{t.description}</TableCell>
                <TableCell>
                <Badge variant={t.type === "income" ? "secondary" : "destructive"} className={t.type === 'income' ? 'bg-success-light/50 text-success-DEFAULT border-success-light' : ''}>
                    {t.type === "income" ? "Entrada" : "Saída"}
                </Badge>
                </TableCell>
                <TableCell>{format(t.date, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                <TableCell className={`text-right font-medium ${t.type === "income" ? "text-success-DEFAULT" : "text-destructive"}`}>
                {t.type === "income" ? "+ " : "- "}
                {formatCurrency(t.amount)}
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}
