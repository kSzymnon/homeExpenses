import { useState } from "react"
import { useStore } from "@/store/useStore"
import { calculateFinancials } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users, PiggyBank } from "lucide-react"
import { TransactionDialog } from "./TransactionDialog"
import { ExpensesChart } from "./ExpensesChart"
import { RecentTransactions } from "./RecentTransactions"
import { DailySpendingChart } from "./DailySpendingChart"

export function Dashboard() {
    const { users, incomes, expenses, goals } = useStore()
    const financials = calculateFinancials(users, incomes, expenses, goals)

    const householdExpenses = expenses.filter(e => e.is_shared).reduce((sum, e) => sum + e.amount, 0)
    const totalGoalContribution = goals.reduce((sum, g) => sum + g.monthly_contribution, 0)

    const [currentMonth, setCurrentMonth] = useState(new Date())

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    {/* Top Row: Individual Safe-to-Spend */}
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

                    {/* Household Stats & Quick Recents */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                        <div className="md:col-span-1 lg:col-span-4 grid gap-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Household Fixed</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">${householdExpenses}</div>
                                        <p className="text-xs text-muted-foreground">Bills & Rent</p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
                                        <PiggyBank className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">${totalGoalContribution}</div>
                                        <p className="text-xs text-muted-foreground">Goal Commit</p>
                                    </CardContent>
                                </Card>
                            </div>
                            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 p-6">
                                <h3 className="font-semibold mb-4">Quick Actions</h3>
                                <p className="text-sm text-muted-foreground">Use the + button below to add transactions.</p>
                            </Card>
                        </div>
                        <div className="md:col-span-1 lg:col-span-3">
                            <RecentTransactions limit={5} />
                        </div>
                    </div>
                </TabsContent>

                {/* ANALYTICS TAB */}
                <TabsContent value="analytics" className="space-y-6">
                    <div className="grid gap-6">
                        <DailySpendingChart currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
                        <div className="grid md:grid-cols-2 gap-6">
                            <ExpensesChart currentMonth={currentMonth} />
                        </div>
                    </div>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history">
                    <RecentTransactions />
                </TabsContent>

                {/* GOALS TAB */}
                <TabsContent value="goals" className="space-y-6">
                    <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" /> Shared Goals
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {goals.map(goal => {
                            const progress = (goal.current_amount / goal.target_amount) * 100
                            return (
                                <Card key={goal.id} className="bg-gradient-to-br from-card to-secondary/10 border-border/60">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{goal.title}</CardTitle>
                                        <CardDescription className="text-xs">Target: ${goal.target_amount}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Progress value={progress} className="h-2 mb-2" />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>${goal.current_amount} saved</span>
                                            <span>{Math.round(progress)}%</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                        {goals.length === 0 && (
                            <div className="col-span-full text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
                                No goals found.
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            <TransactionDialog />
        </div>
    )
}
