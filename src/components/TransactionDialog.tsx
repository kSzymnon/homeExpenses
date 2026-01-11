import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { useStore } from "@/store/useStore"
import type { ExpenseCategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Schemas
const expenseSchema = z.object({
    title: z.string().min(2, "Title is too short"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be positive"),
    payer_id: z.string().min(1, "Select a payer"),
    category: z.string().min(1, "Select a category"),
    type: z.enum(["shared", "personal"]),
    linked_goal_id: z.string().optional(),
}).refine((data) => {
    if (data.category === 'savings' && !data.linked_goal_id) {
        return false
    }
    return true
}, {
    message: "Select a goal for savings",
    path: ["linked_goal_id"],
})

const incomeSchema = z.object({
    title: z.string().min(2, "Title is too short"),
    amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be positive"),
    user_id: z.string().min(1, "Select a user"),
})

const goalSchema = z.object({
    title: z.string().min(2, "Title is too short"),
    target_amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Target must be positive"),
    monthly_contribution: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Contribution must be positive"),
})

export function TransactionDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="fixed bottom-0 left-0 right-0 p-8 z-50 pointer-events-none flex justify-center">
                <div className="w-full max-w-screen-xl flex justify-end px-4 sm:px-8">
                    <DialogTrigger asChild>
                        <Button
                            size="icon"
                            className="pointer-events-auto h-14 w-14 rounded-full shadow-2xl hover:scale-105 transition-all bg-primary text-primary-foreground animate-in zoom-in duration-300"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    </DialogTrigger>
                </div>
            </div>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Log a new financial item.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="expense" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="expense">Expense</TabsTrigger>
                        <TabsTrigger value="income">Income</TabsTrigger>
                        <TabsTrigger value="goal">Goal</TabsTrigger>
                    </TabsList>
                    <TabsContent value="expense">
                        <ExpenseForm onSuccess={() => setOpen(false)} />
                    </TabsContent>
                    <TabsContent value="income">
                        <IncomeForm onSuccess={() => setOpen(false)} />
                    </TabsContent>
                    <TabsContent value="goal">
                        <GoalForm onSuccess={() => setOpen(false)} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

function ExpenseForm({ onSuccess }: { onSuccess: () => void }) {
    const { addExpense, users, goals } = useStore()
    const form = useForm<z.infer<typeof expenseSchema>>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            title: "",
            amount: "",
            payer_id: users[0]?.id || "",
            category: "other",
            type: "shared",
            linked_goal_id: "",
        }
    })

    function onSubmit(values: z.infer<typeof expenseSchema>) {
        addExpense({
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            title: values.title,
            amount: Number(values.amount),
            payer_id: values.payer_id,
            category: values.category as ExpenseCategory,
            is_shared: values.type === "shared",
            linked_goal_id: values.category === 'savings' ? values.linked_goal_id : undefined,
        })
        onSuccess()
        form.reset()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input placeholder="Groceries, Rent..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="payer_id"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Paid By</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="savings" className="font-semibold text-green-600">Savings (Transfer to Goal)</SelectItem>
                                        {['housing', 'food', 'transport', 'entertainment', 'utilities', 'other'].map(c => (
                                            <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {form.watch("category") === "savings" && (
                    <FormField
                        control={form.control}
                        name="linked_goal_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Target Goal</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a goal" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {goals.map(g => (
                                            <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                            <FormLabel>Type</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                >
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="shared" /></FormControl>
                                        <FormLabel className="font-normal">Shared (Split 50/50)</FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-3 space-y-0">
                                        <FormControl><RadioGroupItem value="personal" /></FormControl>
                                        <FormLabel className="font-normal">Personal (Individual)</FormLabel>
                                    </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Add Expense</Button>
            </form>
        </Form>
    )
}

function IncomeForm({ onSuccess }: { onSuccess: () => void }) {
    const { addIncome, users } = useStore()
    const form = useForm<z.infer<typeof incomeSchema>>({
        resolver: zodResolver(incomeSchema),
        defaultValues: { title: "", amount: "", user_id: users[0]?.id || "" }
    })
    function onSubmit(values: z.infer<typeof incomeSchema>) {
        addIncome({
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            title: values.title,
            amount: Number(values.amount),
            user_id: values.user_id,
            is_recurring: false // default false for manual entry
        })
        onSuccess()
        form.reset()
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Source</FormLabel>
                            <FormControl><Input placeholder="Bonus, Freelance..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Amount ($)</FormLabel>
                            <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Earner</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Add Income</Button>
            </form>
        </Form>
    )
}

function GoalForm({ onSuccess }: { onSuccess: () => void }) {
    const { addGoal } = useStore()
    const form = useForm<z.infer<typeof goalSchema>>({
        resolver: zodResolver(goalSchema),
        defaultValues: { title: "", target_amount: "", monthly_contribution: "" }
    })
    function onSubmit(values: z.infer<typeof goalSchema>) {
        addGoal({
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            title: values.title,
            target_amount: Number(values.target_amount),
            current_amount: 0,
            monthly_contribution: Number(values.monthly_contribution)
        })
        onSuccess()
        form.reset()
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Goal Name</FormLabel>
                            <FormControl><Input placeholder="New House..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="target_amount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Target Amount ($)</FormLabel>
                            <FormControl><Input type="number" step="100" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="monthly_contribution"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Contribution ($)</FormLabel>
                            <FormControl><Input type="number" step="50" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">Create Goal</Button>
            </form>
        </Form>
    )
}
