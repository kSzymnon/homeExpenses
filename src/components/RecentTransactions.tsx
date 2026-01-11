import { useStore } from "@/store/useStore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowDownRight, ArrowUpRight, History, Target } from "lucide-react"

export function RecentTransactions({ limit }: { limit?: number }) {
    const { expenses, incomes, goals } = useStore()

    // Combine and sort transactions
    const transactions = [
        ...expenses.map(e => ({ ...e, type: 'expense' as const, date: new Date(e.created_at) })),
        ...incomes.map(i => ({ ...i, type: 'income' as const, date: new Date(i.created_at) })),
        ...goals.map(g => ({ ...g, type: 'goal' as const, date: new Date(g.created_at) }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, limit || 50) // Default to 50 if no limit

    return (
        <Card className="h-full bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <History className="h-5 w-5 text-primary" /> Recent Activity
                </CardTitle>
                <CardDescription> Latest financial moves </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {transactions.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-4">No recent activity</div>
                )}
                {transactions.map((item) => {
                    let icon = <ArrowDownRight className="h-4 w-4 text-red-500" />
                    let amountClass = "text-red-500"
                    let label = item.title

                    if (item.type === 'income') {
                        icon = <ArrowUpRight className="h-4 w-4 text-green-500" />
                        amountClass = "text-green-500"
                    } else if (item.type === 'goal') {
                        icon = <Target className="h-4 w-4 text-yellow-500" />
                        amountClass = "text-yellow-500"
                    }

                    // Format date relative or short
                    const dateStr = item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

                    return (
                        <div key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b border-border/40 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full bg-background/50 border border-border/50`}>
                                    {icon}
                                </div>
                                <div className="grid gap-0.5">
                                    <span className="text-sm font-medium leading-none">{label}</span>
                                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                                </div>
                            </div>
                            <div className={`font-bold text-sm ${amountClass}`}>
                                {item.type === 'income' ? '+' : item.type === 'goal' ? '' : '-'}${ // Goal creation doesn't necessarily mean money spent yet, but usually implies 'target'. Let's show target amount? Or maybe monthly contribution? 
                                    // Actually for 'goal' item in this list, it's the goal creation. Maybe show target amount.
                                    item.type === 'goal' ? 'Target: ' : ''
                                }${'amount' in item ? item.amount : (item as any).target_amount}
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
