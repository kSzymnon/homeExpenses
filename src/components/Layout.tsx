import { ModeToggle } from "./mode-toggle"
import { SettingsDialog } from "./SettingsDialog"

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            {/* Background blobs for glassmorphism vibe */}
            {/* Background blobs for glassmorphism vibe - Royal Neon Edition */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] opacity-40" />
                <div className="absolute top-[40%] left-[40%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ animationDuration: '10s' }} />
            </div>

            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 w-full items-center justify-between px-4 sm:px-8">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            CoupleFunds
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <SettingsDialog />
                        <ModeToggle />
                    </div>
                </div>
            </header>

            <main className="container max-w-screen-xl py-6 px-4 sm:px-8 mx-auto">
                {children}
            </main>
        </div>
    )
}
