import { useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/components/Dashboard"
import { OnboardingWizard } from "@/components/OnboardingWizard"
import { useStore } from "@/store/useStore"

function App() {
  const { fetchData, users, isLoading, currentHousehold } = useStore()

  useEffect(() => {
    const storedHouseholdId = localStorage.getItem('homeExpenses_householdId')
    if (storedHouseholdId) {
      fetchData(storedHouseholdId)
    }
  }, [fetchData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Show onboarding if no users exist OR no household is selected
  // We check for currentHousehold too because we need it for everything to work
  // If we have a stored household ID but users are empty (e.g. fetch failed or empty DB), we might still show onboarding or handle error.
  // But strictly: if no currentHousehold in store (and we tried to fetch), show onboarding.
  if (!isLoading && !currentHousehold) {
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
