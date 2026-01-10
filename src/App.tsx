import { ThemeProvider } from "@/components/theme-provider"
import { Layout } from "@/components/Layout"
import { Dashboard } from "@/components/Dashboard"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout>
        <Dashboard />
      </Layout>
    </ThemeProvider>
  )
}

export default App
