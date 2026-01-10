export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
}

export type ExpenseCategory = 'housing' | 'food' | 'transport' | 'entertainment' | 'utilities' | 'savings' | 'other';

export interface Expense {
    id: string;
    created_at: string;
    title: string;
    amount: number;
    payer_id: string;
    is_shared: boolean;
    category: ExpenseCategory;
    linked_goal_id?: string; // If category is 'savings', which goal does this fund?
    // If shared, how much does the OTHER person pay? or assumes 50/50?
    // PRD says: "deduct the 50% share from my partner's leftover balance"
    // But strictly, expense amount reduces household pot.
    // Disposable = Income - Share_of_Joint - Individual
}

export interface Income {
    id: string;
    created_at: string;
    title: string;
    amount: number;
    user_id: string;
    is_recurring: boolean;
}

export interface Goal {
    id: string;
    created_at: string;
    title: string;
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    deadline?: string;
}
