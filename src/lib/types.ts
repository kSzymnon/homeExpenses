export interface Household {
    id: string;
    name: string;
    code: string;
    created_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    household_id?: string;
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
    linked_goal_id?: string;
    household_id?: string;
}

export interface Income {
    id: string;
    created_at: string;
    title: string;
    amount: number;
    user_id: string;
    is_recurring: boolean;
    household_id?: string;
}

export interface Goal {
    id: string;
    created_at: string;
    title: string;
    target_amount: number;
    current_amount: number;
    monthly_contribution: number;
    deadline?: string;
    household_id?: string;
}
