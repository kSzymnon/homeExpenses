import { create } from 'zustand'
import type { User, Income, Expense, Goal } from '../lib/types'
import { supabase } from '../lib/supabase'

interface StoreState {
    users: User[]
    incomes: Income[]
    expenses: Expense[]
    goals: Goal[]
    isLoading: boolean
    error: string | null

    // Actions
    fetchData: () => Promise<void>
    addUser: (user: User) => void
    addIncome: (income: Income) => Promise<void>
    addExpense: (expense: Expense) => Promise<void>
    addGoal: (goal: Goal) => Promise<void>
    updateGoal: (id: string, amount: number) => Promise<void>
}

export const useStore = create<StoreState>((set) => ({
    users: [],
    incomes: [],
    expenses: [],
    goals: [],
    isLoading: false,
    error: null,

    // Actions
    fetchData: async () => {
        set({ isLoading: true, error: null })
        try {
            const [usersRes, incomesRes, expensesRes, goalsRes] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('incomes').select('*'),
                supabase.from('expenses').select('*'),
                supabase.from('goals').select('*')
            ])

            if (usersRes.error) throw usersRes.error
            if (incomesRes.error) throw incomesRes.error
            if (expensesRes.error) throw expensesRes.error
            if (goalsRes.error) throw goalsRes.error

            set({
                users: usersRes.data as User[],
                incomes: incomesRes.data as Income[],
                expenses: expensesRes.data as Expense[],
                goals: goalsRes.data as Goal[],
                isLoading: false
            })
        } catch (error: any) {
            console.error('Error fetching data:', error)
            set({ error: error.message, isLoading: false })
        }
    },

    addUser: async (user) => {
        try {
            const { error } = await supabase.from('profiles').insert(user)
            if (error) throw error
            set((state) => ({ users: [...state.users, user] }))
        } catch (error) {
            console.error('Error adding user:', error)
        }
    },

    addIncome: async (income) => {
        try {
            const { error } = await supabase.from('incomes').insert(income)
            if (error) throw error
            set((state) => ({ incomes: [...state.incomes, income] }))
        } catch (error) {
            console.error('Error adding income:', error)
            // Optionally set error state
        }
    },

    addExpense: async (expense) => {
        try {
            const { error } = await supabase.from('expenses').insert(expense)
            if (error) throw error

            set((state) => ({
                expenses: [...state.expenses, expense]
            }))

            // Handle linked goal update if necessary
            if (expense.category === 'savings' && expense.linked_goal_id) {
                const goal = useStore.getState().goals.find(g => g.id === expense.linked_goal_id)
                if (goal) {
                    const newAmount = goal.current_amount + expense.amount
                    await useStore.getState().updateGoal(goal.id, newAmount)
                }
            }

        } catch (error) {
            console.error('Error adding expense:', error)
        }
    },

    addGoal: async (goal) => {
        try {
            const { error } = await supabase.from('goals').insert(goal)
            if (error) throw error
            set((state) => ({ goals: [...state.goals, goal] }))
        } catch (error) {
            console.error('Error adding goal:', error)
        }
    },

    updateGoal: async (id, amount) => {
        try {
            const { error } = await supabase.from('goals').update({ current_amount: amount }).eq('id', id)
            if (error) throw error
            set((state) => ({
                goals: state.goals.map(g => g.id === id ? { ...g, current_amount: amount } : g)
            }))
        } catch (error) {
            console.error('Error updating goal:', error)
        }
    },
}))
