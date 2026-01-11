"use client"

import { useMemo } from "react"
import { Pie, PieChart as RechartsPieChart, ResponsiveContainer, Cell, Tooltip } from "recharts"
import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TrendingDown } from "lucide-react"

interface ExpensesChartProps {
    currentMonth?: Date
}

export function ExpensesChart({ currentMonth }: ExpensesChartProps) {
    const { expenses } = useStore()

    const chartData = useMemo(() => {
        const categoryTotals: Record<string, number> = {}

        expenses.forEach(expense => {
            // If currentMonth is provided, filter by it
            if (currentMonth) {
                const expenseDate = new Date(expense.created_at)
                if (
                    expenseDate.getFullYear() !== currentMonth.getFullYear() ||
                    expenseDate.getMonth() !== currentMonth.getMonth()
                ) {
                    return
                }
            }

            const cat = expense.category
            categoryTotals[cat] = (categoryTotals[cat] || 0) + expense.amount
        })

        return Object.entries(categoryTotals).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        })).sort((a, b) => b.value - a.value)
    }, [expenses, currentMonth])

    const COLORS = [
        "hsl(var(--chart-1))",
        "hsl(var(--chart-2))",
        "hsl(var(--chart-3))",
        "hsl(var(--chart-4))",
        "hsl(var(--chart-5))",
        "hsl(var(--muted))"
    ];

    const total = chartData.reduce((sum, item) => sum + item.value, 0)

    if (chartData.length === 0) {
        return (
            <Card className="col-span-1 md:col-span-2 lg:col-span-1 bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingDown className="h-5 w-5 text-primary" /> Spending Breakdown
                    </CardTitle>
                    <CardDescription>No expenses recorded yet.</CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <Card className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col bg-card/50 backdrop-blur-sm border-primary/20 min-h-[350px]">
            <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingDown className="h-5 w-5 text-primary" /> Spending Breakdown
                </CardTitle>
                <CardDescription>Expenses by Category</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="w-full relative">
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-3xl font-bold">${total}</span>
                        <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <RechartsPieChart>
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                stroke="none"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number | undefined) => [`$${value}`, "Amount"]}
                                contentStyle={{ borderRadius: "8px", border: "none", backgroundColor: "hsl(var(--popover))", color: "hsl(var(--popover-foreground))", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                                itemStyle={{ color: "hsl(var(--foreground))" }}
                            />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
            <div className="p-6 pt-0 grid grid-cols-2 gap-2 text-sm">
                {chartData.slice(0, 4).map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <div className="flex justify-between w-full">
                            <span>{item.name}</span>
                            <span className="font-medium text-foreground">${item.value}</span>
                        </div>
                    </div>
                ))}
                {chartData.length > 4 && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-muted" />
                        <div className="flex justify-between w-full">
                            <span>Others</span>
                            <span>${chartData.slice(4).reduce((acc, curr) => acc + curr.value, 0)}</span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    )
}
