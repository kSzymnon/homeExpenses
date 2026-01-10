import { create } from 'zustand'
import type { User, Income, Expense, Goal } from '../lib/types'

interface StoreState {
    users: User[]
    incomes: Income[]
    expenses: Expense[]
    goals: Goal[]

    // Actions
    addUser: (user: User) => void
    addIncome: (income: Income) => void
    addExpense: (expense: Expense) => void
    addGoal: (goal: Goal) => void
    updateGoal: (id: string, amount: number) => void
}

export const useStore = create<StoreState>((set) => ({
    users: [
        { id: '1', name: 'Alex', email: 'alex@example.com', avatar_url: 'https://github.com/shadcn.png' },
        { id: '2', name: 'Sam', email: 'sam@example.com', avatar_url: '' },
    ],
    incomes: [
        { id: '1', created_at: new Date().toISOString(), title: 'Salary', amount: 5000, user_id: '1', is_recurring: true },
        { id: '2', created_at: new Date().toISOString(), title: 'Salary', amount: 4200, user_id: '2', is_recurring: true },
    ],
    expenses: [
        { id: '1', created_at: new Date().toISOString(), title: 'Rent', amount: 2000, payer_id: '1', is_shared: true, category: 'housing' },
        { id: '2', created_at: new Date().toISOString(), title: 'Groceries', amount: 600, payer_id: '2', is_shared: true, category: 'food' },
        { id: '3', created_at: new Date().toISOString(), title: 'Netflix', amount: 15, payer_id: '1', is_shared: true, category: 'entertainment' },
        { id: '4', created_at: new Date().toISOString(), title: 'Gym', amount: 50, payer_id: '1', is_shared: false, category: 'other' },
        { id: '5', created_at: new Date().toISOString(), title: 'Books', amount: 30, payer_id: '2', is_shared: false, category: 'other' },
    ],
    goals: [
        { id: '1', created_at: new Date().toISOString(), title: 'New Car', target_amount: 15000, current_amount: 5000, monthly_contribution: 400 },
        { id: '2', created_at: new Date().toISOString(), title: 'Summer Trip', target_amount: 3000, current_amount: 1200, monthly_contribution: 200 },
    ],

    addUser: (user) => set((state) => ({ users: [...state.users, user] })),
    addIncome: (income) => set((state) => ({ incomes: [...state.incomes, income] })),
    addExpense: (expense) => set((state) => {
        let newGoals = state.goals;
        // If this expense is a transfer to a goal, update that goal's current amount
        if (expense.category === 'savings' && expense.linked_goal_id) {
            newGoals = state.goals.map(g =>
                g.id === expense.linked_goal_id
                    ? { ...g, current_amount: g.current_amount + expense.amount }
                    : g
            );
        }
        return {
            expenses: [...state.expenses, expense],
            goals: newGoals
        };
    }),
    addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
    updateGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, current_amount: amount } : g)
    })),
}))
