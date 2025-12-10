import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WorkoutLog from "./pages/WorkoutLog";
import WeeklyWorkoutAssignment from "./pages/WeeklyWorkoutAssignment";
import WorkoutPlanning from "./pages/WorkoutPlanning";
import WeeklyWorkoutPlan from "./pages/WeeklyWorkoutPlan";
import ProgressGraph from "./pages/ProgressGraph";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout-log" element={<WorkoutLog />} />
          <Route path="/weekly-setup" element={<WeeklyWorkoutAssignment />} />
          <Route path="/weekly-plan" element={<WeeklyWorkoutPlan />} />
          <Route path="/workout-planning" element={<WorkoutPlanning />} />
          <Route path="/progress" element={<ProgressGraph />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;