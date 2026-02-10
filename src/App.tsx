import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/components/Dashboard"
import { OnboardingWizard } from "@/components/OnboardingWizard"
import { useStore } from "@/store/useStore"

function App() {
  const { fetchData, users, isLoading } = useStore()

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Show onboarding if no users exist (First Run)
  if (!isLoading && users.length === 0) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <OnboardingWizard />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <Dashboard />
      </Layout>
    </ThemeProvider>
  )
}

export default App
