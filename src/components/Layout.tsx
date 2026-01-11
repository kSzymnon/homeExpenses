import { ModeToggle } from "./mode-toggle"

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground">
            {/* Background blobs for glassmorphism vibe */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30" />
            </div>

            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-xl items-center justify-between px-4 sm:px-8 mx-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            CoupleFunds
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
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
