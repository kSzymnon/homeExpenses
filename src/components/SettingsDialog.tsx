import { Button } from "./ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"
import { Settings, Users, Copy, Check } from "lucide-react"
import { useStore } from "@/store/useStore"
import { useState } from "react"

export function SettingsDialog() {
    const { currentHousehold } = useStore()
    const [copied, setCopied] = useState(false)

    const copyCode = () => {
        if (currentHousehold?.code) {
            navigator.clipboard.writeText(currentHousehold.code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
                    <Settings className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">Settings</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                    <DialogDescription>
                        Manage your household and application preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium leading-none flex items-center gap-2">
                            <Users className="h-4 w-4" /> Household
                        </h3>
                        {currentHousehold ? (
                            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <span className="font-medium">{currentHousehold.name}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-border/50">
                                    <span className="text-sm text-muted-foreground">Join Code</span>
                                    <div className="flex items-center gap-2">
                                        <code className="relative rounded bg-muted px-[0.5rem] py-[0.3rem] font-mono text-lg font-semibold tracking-widest text-primary">
                                            {currentHousehold.code}
                                        </code>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={copyCode}
                                        >
                                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground">No household detected.</div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-sm font-medium leading-none text-muted-foreground">Application</h3>
                        <p className="text-xs text-muted-foreground">Version 0.1.0 • Royal Neon Theme</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
