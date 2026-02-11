"use client"

import { useMemo } from "react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, BarChart3 } from "lucide-react"

interface DailySpendingChartProps {
    currentMonth: Date
    onMonthChange: (date: Date) => void
}

export function DailySpendingChart({ currentMonth, onMonthChange }: DailySpendingChartProps) {
    const { expenses } = useStore()

    const chartData = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()

        // Get number of days in the month
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        // Initialize all days with 0
        const days = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            amount: 0,
            date: new Date(year, month, i + 1)
        }))

        // Fill with expense data
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.created_at)
            if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
                const dayIndex = expenseDate.getDate() - 1
                if (days[dayIndex]) {
                    days[dayIndex].amount += expense.amount
                }
            }
        })

        return days
    }, [expenses, currentMonth])

    const totalSpending = chartData.reduce((acc, curr) => acc + curr.amount, 0)

    const nextMonth = () => {
        onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const prevMonth = () => {
        onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-4 sm:space-y-0">
                <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BarChart3 className="h-5 w-5 text-primary" /> Daily Spending
                    </CardTitle>
                    <CardDescription>
                        Total: <span className="font-bold text-foreground">${totalSpending.toFixed(2)}</span>
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                    <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-sm font-medium w-32 text-center">
                        {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                    </div>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="day"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload
                                    return (
                                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[0.70rem] uppercase text-muted-foreground">
                                                        {data.date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </span>
                                                    <span className="font-bold text-muted-foreground">
                                                        ${data.amount.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                                return null
                            }}
                        />
                        <Bar
                            dataKey="amount"
                            fill="hsl(var(--primary))"
                            radius={[4, 4, 0, 0]}
                            className="fill-primary"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    )
}
