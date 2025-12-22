"use client";

import { useState, useMemo, useCallback } from "react";
import type { Transaction } from "@/lib/types";
import { PlusCircle, Wallet, BrainCircuit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { SummaryCards } from "./summary-cards";
import { TransactionDialog } from "./transaction-dialog";
import { ReportsAndTransactions } from "./reports-and-transactions";
import { AiAnalysisCard } from "./ai-analysis-card";
import { subDays, startOfToday } from "date-fns";

const initialTransactions: Transaction[] = [
  { id: "1", type: "income", description: "Salário", amount: 5000, date: subDays(startOfToday(), 2) },
  { id: "2", type: "expense", description: "Aluguel", amount: 1500, date: subDays(startOfToday(), 2) },
  { id: "3", type: "expense", description: "Supermercado", amount: 450, date: subDays(startOfToday(), 1) },
  { id: "4", type: "income", description: "Venda de produto", amount: 300, date: startOfToday() },
  { id: "5", type: "expense", description: "Restaurante", amount: 85, date: startOfToday() },
];


export function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"income" | "expense">("income");

  const { totalIncome, totalExpenses, currentBalance } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === "income") {
          acc.totalIncome += t.amount;
        } else {
          acc.totalExpenses += t.amount;
        }
        acc.currentBalance = acc.totalIncome - acc.totalExpenses;
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, currentBalance: 0 }
    );
  }, [transactions]);

  const handleAddTransaction = useCallback((data: { description: string; amount: number }) => {
    const newTransaction: Transaction = {
      id: new Date().getTime().toString(),
      date: new Date(),
      type: dialogType,
      ...data,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  }, [dialogType]);
  
  const openDialog = (type: "income" | "expense") => {
    setDialogType(type);
    setDialogOpen(true);
  }

  return (
    <div className="flex min-h-screen w-full flex-col font-body">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground">Prisma ERP</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" onClick={() => openDialog("income")}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Nova Entrada
            </Button>
            <Button size="sm" variant="secondary" onClick={() => openDialog("expense")}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Nova Saída
            </Button>
        </div>
      </header>

      <main className="flex-1 flex-col p-4 md:p-6 lg:p-8">
        <div className="mx-auto grid w-full max-w-7xl gap-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <SummaryCards 
                    balance={currentBalance}
                    income={totalIncome}
                    expenses={totalExpenses}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ReportsAndTransactions transactions={transactions} />
                </div>
                <div>
                    <AiAnalysisCard transactions={transactions} />
                </div>
            </div>
        </div>
      </main>
      
      <TransactionDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type={dialogType}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
