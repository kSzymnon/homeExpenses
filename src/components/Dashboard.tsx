import { useState } from "react"
import { useStore } from "@/store/useStore"
import { calculateFinancials } from "@/lib/calculations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Users } from "lucide-react"
import { TransactionDialog } from "./TransactionDialog"
import { ExpensesChart } from "./ExpensesChart"
import { RecentTransactions } from "./RecentTransactions"
import { DailySpendingChart } from "./DailySpendingChart"

export function Dashboard() {
    const { users, incomes, expenses, goals } = useStore()
    const financials = calculateFinancials(users, incomes, expenses, goals)

    const totalGoalContribution = goals.reduce((sum, g) => sum + g.monthly_contribution, 0)

    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [activeTab, setActiveTab] = useState("overview")

    // Household Totals Calculation
    const totalHouseholdIncome = financials.reduce((sum, f) => sum + f.totalIncome, 0)
    // householdExpenses is already defined above
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0) // Total money out
    const householdLeftover = totalHouseholdIncome - totalSpent - totalGoalContribution

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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

                    {/* Household Overview & Recent Activity */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Household Overview */}
                        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 md:col-span-2 lg:col-span-1">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" /> Household Overview
                                </CardTitle>
                                <CardDescription>Combined financials for this month</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground mb-1">Total Leftover</div>
                                    <div className="text-4xl font-bold tracking-tight">${householdLeftover.toFixed(2)}</div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total Income</span>
                                        <span className="font-medium text-green-500">+${totalHouseholdIncome}</span>
                                    </div>
                                    <Progress value={100} className="h-1 bg-green-500/20" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total Spent</span>
                                        <span className="font-medium text-red-500">-${totalSpent}</span>
                                    </div>
                                    <Progress value={(totalSpent / totalHouseholdIncome) * 100} className="h-1 bg-red-500/20" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">Total Savings</span>
                                        <span className="font-medium text-blue-500">-${totalGoalContribution}</span>
                                    </div>
                                    <Progress value={(totalGoalContribution / totalHouseholdIncome) * 100} className="h-1 bg-blue-500/20" />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <div className="md:col-span-2 lg:col-span-1">
                            <RecentTransactions limit={4} onViewHistory={() => setActiveTab("history")} />
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
