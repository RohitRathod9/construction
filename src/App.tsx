import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { useAuth } from "./hooks/useAuth"; // We will create this hook next
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Sites from "./pages/Sites";
import SiteDetail from "./pages/SiteDetail";
import Payroll from "./pages/Payroll";
import Reports from "./pages/Reports";
import AuditLogPage from "./pages/AuditLog";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can replace this with a proper loading spinner component
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="crb-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner position="bottom-right" />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route 
                path="/*" 
                element={user ? <MainApp /> : <Navigate to="/login" />} 
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// A new component to hold the main application layout and routes
const MainApp = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<Sites />} />
      <Route path="/sites" element={<Sites />} />
      <Route path="/sites/:siteId" element={<SiteDetail />} />
      <Route path="/payroll" element={<Payroll />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/audit" element={<AuditLogPage />} />
      <Route path="/settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
