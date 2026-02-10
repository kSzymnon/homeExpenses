import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Check, Sparkles, Wallet } from "lucide-react"
import { useStore } from "@/store/useStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"

const onboardingSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    income: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Income must be a positive number"),
})

export function OnboardingWizard() {
    const { addUser, addIncome } = useStore()
    const [step, setStep] = useState(0) // 0: Intro, 1: Name, 2: Income, 3: Success
    const [hasAttemptedNext, setHasAttemptedNext] = useState(false)

    // Form setup
    const form = useForm<z.infer<typeof onboardingSchema>>({
        resolver: zodResolver(onboardingSchema),
        mode: "onBlur",
        reValidateMode: "onBlur",
        defaultValues: {
            name: "",
            email: "",
            income: "",
        },
    })

    const handleNext = async () => {
        setHasAttemptedNext(true)
        const isNameValid = await form.trigger(["name", "email"])
        if (step === 1 && isNameValid) {
            setStep(2)
            setHasAttemptedNext(false)
        } else if (step === 2) {
            const isIncomeValid = await form.trigger("income")
            if (isIncomeValid) {
                await handleSubmit(form.getValues())
            }
        } else {
            setStep(step + 1)
            setHasAttemptedNext(false)
        }
    }

    const handleSubmit = async (values: z.infer<typeof onboardingSchema>) => {
        try {
            const userId = crypto.randomUUID()

            // 1. Create User
            await addUser({
                id: userId,
                name: values.name,
                email: values.email || "",
            })

            // 2. Add Income
            await addIncome({
                id: crypto.randomUUID(),
                created_at: new Date().toISOString(),
                title: 'Monthly Income',
                amount: Number(values.income),
                user_id: userId,
                is_recurring: true
            })

            setStep(3)
        } catch (error) {
            console.error("Onboarding error:", error)
        }
    }

    // Animation variants
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeIn}
                className="relative w-full max-w-lg overflow-hidden glass-card rounded-3xl"
            >
                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-muted/30">
                    <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        animate={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {step === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="text-center space-y-6"
                            >
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                                    <Sparkles className="w-10 h-10 text-primary" />
                                </div>
                                <h1 className="text-4xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                                    Welcome to <br />
                                    <span className="text-gradient">HomeExpenses</span>
                                </h1>
                                <p className="text-lg text-muted-foreground leading-relaxed">
                                    Take control of your finances with a premium, focused experience. Let's get you set up in seconds.
                                </p>
                                <Button
                                    onClick={handleNext}
                                    size="lg"
                                    className="w-full mt-8 text-lg font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 bg-gradient-to-r from-primary to-purple-600 border-none"
                                >
                                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold tracking-tight">Who are you?</h2>
                                    <p className="text-muted-foreground">We'll use this to personalize your dashboard.</p>
                                </div>

                                <Form {...form}>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Input
                                                                placeholder="Your Name"
                                                                className="h-14 px-6 text-lg glass-input rounded-xl border-white/10 focus:border-primary/50"
                                                                {...field}
                                                                onChange={(e) => field.onChange(e)} // Only update value
                                                                onBlur={field.onBlur} // Trigger validation on blur
                                                            />
                                                        </div>
                                                    </FormControl>
                                                    {(fieldState.error && (fieldState.isTouched || hasAttemptedNext)) && <FormMessage />}
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field, fieldState }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            placeholder="Email (Optional)"
                                                            className="h-14 px-6 text-lg glass-input rounded-xl border-white/10 focus:border-primary/50"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e)}
                                                            onBlur={field.onBlur}
                                                        />
                                                    </FormControl>
                                                    {(fieldState.error && (fieldState.isTouched || hasAttemptedNext)) && <FormMessage />}
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </Form>

                                <Button
                                    onClick={handleNext}
                                    size="lg"
                                    className="w-full h-14 text-lg bg-white/10 hover:bg-white/20 border-0 backdrop-blur-md transition-all"
                                >
                                    Next Step
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-primary mb-2">
                                        <Wallet className="w-6 h-6" />
                                        <span className="font-semibold tracking-wide uppercase text-sm">Financial Baseline</span>
                                    </div>
                                    <h2 className="text-3xl font-bold tracking-tight">Monthly Income</h2>
                                    <p className="text-muted-foreground">This sets up your "Safe to Spend" calculation. You can add more later.</p>
                                </div>

                                <Form {...form}>
                                    <FormField
                                        control={form.control}
                                        name="income"
                                        render={({ field, fieldState }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl text-muted-foreground">$</span>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="h-20 pl-12 text-3xl font-bold glass-input rounded-2xl border-white/10 focus:border-primary/50"
                                                            {...field}
                                                            onChange={(e) => field.onChange(e)}
                                                            onBlur={field.onBlur}
                                                        />
                                                    </div>
                                                </FormControl>
                                                {(fieldState.error && (fieldState.isTouched || hasAttemptedNext)) && <FormMessage />}
                                            </FormItem>
                                        )}
                                    />
                                </Form>

                                <Button
                                    onClick={handleNext}
                                    size="lg"
                                    className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 bg-gradient-to-r from-primary to-purple-600 border-none hover:scale-[1.02] transition-transform"
                                >
                                    Complete Setup
                                </Button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-10 space-y-6"
                            >
                                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-4 animate-in zoom-in duration-500">
                                    <Check className="w-12 h-12 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold">All Set!</h2>
                                <p className="text-muted-foreground">Your dashboard has been prepared.</p>
                                <div className="pt-4">
                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                    <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
