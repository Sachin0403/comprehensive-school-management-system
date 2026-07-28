import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginPage from "@/pages/LoginPage";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import StudentsPage from "@/pages/StudentsPage";
import AttendancePage from "@/pages/AttendancePage";
import GradebookPage from "@/pages/GradebookPage";
import MessagesPage from "@/pages/MessagesPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={signIn} />;
  }

  return (
    <Routes>
      <Route element={<AppLayout user={user} onSignOut={signOut} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/gradebook" element={<GradebookPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
