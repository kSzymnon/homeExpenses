import type { User, Income, Expense, Goal } from './types'

export interface UserFinancials {
    userId: string;
    totalIncome: number;
    shareOfSharedExpenses: number;
    individualExpenses: number;
    shareOfGoals: number;
    disposableIncome: number;
}

export function calculateFinancials(
    users: User[],
    incomes: Income[],
    expenses: Expense[],
    goals: Goal[]
): UserFinancials[] {
    const sharedExpensesTotal = expenses
        .filter(e => e.is_shared)
        .reduce((sum, e) => sum + e.amount, 0);

    const totalGoalContribution = goals.reduce((sum, g) => sum + g.monthly_contribution, 0);

    // Assuming equal split for shared items (expenses + goals)
    // This could be parametrized later (e.g. proportional to income)

    return users.map(user => {
        const userIncome = incomes
            .filter(i => i.user_id === user.id)
            .reduce((sum, i) => sum + i.amount, 0);

        const userIndividualExpenses = expenses
            .filter(e => !e.is_shared && e.payer_id === user.id)
            .reduce((sum, e) => sum + e.amount, 0);

        const shareOfShared = sharedExpensesTotal / 2;
        const shareOfGoals = totalGoalContribution / 2;

        // The formula: Income - (Shared/2) - Individual - (Goals/2)
        const disposableIncome = userIncome - shareOfShared - userIndividualExpenses - shareOfGoals;

        return {
            userId: user.id,
            totalIncome: userIncome,
            shareOfSharedExpenses: shareOfShared,
            individualExpenses: userIndividualExpenses,
            shareOfGoals: shareOfGoals,
            disposableIncome,
        };
    });
}
