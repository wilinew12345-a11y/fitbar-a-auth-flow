import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import WorkoutLog from "./pages/WorkoutLog";
import WeeklyWorkoutAssignment from "./pages/WeeklyWorkoutAssignment";
import WorkoutPlanning from "./pages/WorkoutPlanning";
import WeeklyWorkoutPlan from "./pages/WeeklyWorkoutPlan";
import ProgressGraph from "./pages/ProgressGraph";
import ChallengeTracker from "./pages/ChallengeTracker";
import SharedChallengeView from "./pages/SharedChallengeView";
import AICoach from "./pages/AICoach";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/workout-log" element={<WorkoutLog />} />
            <Route path="/weekly-setup" element={<WeeklyWorkoutAssignment />} />
            <Route path="/weekly-plan" element={<WeeklyWorkoutPlan />} />
            <Route path="/workout-planning" element={<WorkoutPlanning />} />
            <Route path="/progress" element={<ProgressGraph />} />
            <Route path="/challenges" element={<ChallengeTracker />} />
            <Route path="/challenges/:id" element={<SharedChallengeView />} />
            <Route path="/ai-coach" element={<AICoach />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;