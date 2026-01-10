import { useStore } from "@/store/useStore"
import { calculateFinancials } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, PiggyBank } from "lucide-react"
import { TransactionDialog } from "./TransactionDialog"
import { ExpensesChart } from "./ExpensesChart"

export function Dashboard() {
    const { users, incomes, expenses, goals } = useStore()
    const financials = calculateFinancials(users, incomes, expenses, goals)

    const householdExpenses = expenses.filter(e => e.is_shared).reduce((sum, e) => sum + e.amount, 0)
    const totalGoalContribution = goals.reduce((sum, g) => sum + g.monthly_contribution, 0)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Household Fixed Costs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${householdExpenses}</div>
                        <p className="text-xs text-muted-foreground">Shared bills & rent</p>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Goal Commit</CardTitle>
                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalGoalContribution}</div>
                        <p className="text-xs text-muted-foreground">Saving per month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Individual Safe-to-Spend */}
            <div className="grid gap-6 md:grid-cols-2">
                {financials.map(f => {
                    const user = users.find(u => u.id === f.userId)
                    return (
                        <Card key={f.userId} className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${f.disposableIncome > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {user?.name}'s Leftover
                                </CardTitle>
                                <CardDescription>Safe to spend this month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-4xl font-extrabold tracking-tighter ${f.disposableIncome < 0 ? 'text-destructive' : 'text-primary'}`}>
                                    ${f.disposableIncome.toFixed(2)}
                                </div>
                                <div className="mt-6 text-sm space-y-2 p-4 bg-muted/30 rounded-lg">
                                    <div className="flex justify-between">
                                        <span>Income</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">+${f.totalIncome}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shared Expenses (50%)</span>
                                        <span className="text-muted-foreground">-${f.shareOfSharedExpenses}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Individual Expenses</span>
                                        <span className="text-muted-foreground">-${f.individualExpenses}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Goal Contribution</span>
                                        <span className="text-muted-foreground">-${f.shareOfGoals}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Goals & Chart Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    <h2 className="text-2xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" /> Shared Goals
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {goals.map(goal => {
                            const progress = (goal.current_amount / goal.target_amount) * 100
                            return (
                                <Card key={goal.id} className="bg-gradient-to-br from-card to-secondary/10 border-border/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                                        <CardDescription>Target: ${goal.target_amount}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress value={progress} className="h-2 mb-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>${goal.current_amount} saved</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                        <p className="mt-2 text-xs text-green-500">
                                            +${goal.monthly_contribution}/mo
                                        </p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                    <ExpensesChart />
                </div>
            </div>
            <TransactionDialog />
        </div>
    )
}
