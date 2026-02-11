import { create } from 'zustand'
import type { User, Income, Expense, Goal, Household } from '../lib/types'
import { supabase } from '../lib/supabase'

interface StoreState {
    users: User[]
    incomes: Income[]
    expenses: Expense[]
    goals: Goal[]
    currentHousehold: Household | null
    isLoading: boolean
    error: string | null

    // Actions
    fetchData: (householdId: string) => Promise<void>
    createHousehold: (name: string, userId: string) => Promise<void>
    joinHousehold: (code: string, userId: string) => Promise<void>
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
    currentHousehold: null,
    isLoading: false,
    error: null,

    // Actions
    fetchData: async (householdId: string) => {
        set({ isLoading: true, error: null })
        try {
            const [usersRes, incomesRes, expensesRes, goalsRes, householdRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('household_id', householdId),
                supabase.from('incomes').select('*').eq('household_id', householdId),
                supabase.from('expenses').select('*').eq('household_id', householdId),
                supabase.from('goals').select('*').eq('household_id', householdId),
                supabase.from('households').select('*').eq('id', householdId).single()
            ])

            if (usersRes.error) throw usersRes.error
            if (incomesRes.error) throw incomesRes.error
            if (expensesRes.error) throw expensesRes.error
            if (goalsRes.error) throw goalsRes.error
            if (householdRes.error) throw householdRes.error

            set({
                users: usersRes.data as User[],
                incomes: incomesRes.data as Income[],
                expenses: expensesRes.data as Expense[],
                goals: goalsRes.data as Goal[],
                currentHousehold: householdRes.data as Household,
                isLoading: false
            })
        } catch (error: any) {
            console.error('Error fetching data:', error)
            set({ error: error.message, isLoading: false })
            if (error.code === 'PGRST116') {
                localStorage.removeItem('homeExpenses_householdId')
                set({ currentHousehold: null })
            }
        }
    },

    createHousehold: async (name: string, userId: string) => {
        set({ isLoading: true, error: null })
        try {
            // Generate a simple 4-digit code
            const code = Math.floor(1000 + Math.random() * 9000).toString();

            const { data: household, error: hhError } = await supabase
                .from('households')
                .insert({ name, code })
                .select()
                .single()

            if (hhError) throw hhError

            // Update user to belong to this household
            const { error: userError } = await supabase
                .from('profiles')
                .update({ household_id: household.id })
                .eq('id', userId)

            if (userError) throw userError

            localStorage.setItem('homeExpenses_householdId', household.id)

            set({ currentHousehold: household })
            // Refresh data (will be empty effectively, but syncs state)
            await useStore.getState().fetchData(household.id)

        } catch (error: any) {
            console.error('Error creating household:', error)
            set({ error: error.message, isLoading: false })
        }
    },

    joinHousehold: async (code: string, userId: string) => {
        set({ isLoading: true, error: null })
        try {
            const { data: household, error: hhError } = await supabase
                .from('households')
                .select()
                .eq('code', code)
                .single()

            if (hhError) throw new Error('Household found with this code')

            // Update user
            const { error: userError } = await supabase
                .from('profiles')
                .update({ household_id: household.id })
                .eq('id', userId)

            if (userError) throw userError

            localStorage.setItem('homeExpenses_householdId', household.id)

            set({ currentHousehold: household })
            await useStore.getState().fetchData(household.id)

        } catch (error: any) {
            console.error('Error joining household:', error)
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
            // Ensure household_id is attached
            const household_id = useStore.getState().currentHousehold?.id
            if (!household_id) throw new Error("No household selected")

            const incomeWithHousehold = { ...income, household_id }

            const { error } = await supabase.from('incomes').insert(incomeWithHousehold)
            if (error) throw error
            set((state) => ({ incomes: [...state.incomes, incomeWithHousehold] }))
        } catch (error) {
            console.error('Error adding income:', error)
        }
    },

    addExpense: async (expense) => {
        try {
            const household_id = useStore.getState().currentHousehold?.id
            if (!household_id) throw new Error("No household selected")

            const expenseWithHousehold = { ...expense, household_id }

            const { error } = await supabase.from('expenses').insert(expenseWithHousehold)
            if (error) throw error

            set((state) => ({
                expenses: [...state.expenses, expenseWithHousehold]
            }))

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
            const household_id = useStore.getState().currentHousehold?.id
            if (!household_id) throw new Error("No household selected")

            const goalWithHousehold = { ...goal, household_id }

            const { error } = await supabase.from('goals').insert(goalWithHousehold)
            if (error) throw error
            set((state) => ({ goals: [...state.goals, goalWithHousehold] }))
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
