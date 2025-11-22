
export interface BudgetPeriod {
  month: string; // Ex: "Outubro 2024"
  goal: string;  // Ex: "Economizar 20%", "Pagar dívidas"
  startDate: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  receipt?: string; // Base64 encoded image
}

export interface BudgetRecord {
  id: number;
  budget: BudgetPeriod;
  expenses: Expense[];
  total: number;
}
