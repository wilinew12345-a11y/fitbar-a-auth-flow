import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FitBarcaLogo from "@/components/FitBarcaLogo";
import AuthBackground from "@/components/AuthBackground";
import { Button } from "@/components/ui/button";
import { Settings, Dumbbell, ArrowRight } from "lucide-react";

const WorkoutPlanning = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
      <AuthBackground />
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 left-4 min-w-[40px] min-h-[40px] text-white/70 hover:text-[#A50044] hover:bg-white/10 transition-all duration-200 rounded-full"
        aria-label="חזרה"
      >
        <ArrowRight className="h-5 w-5" />
      </Button>
      
      <div className="w-full max-w-lg relative z-10 text-center">
        <div className="animate-slide-up">
          <FitBarcaLogo size="lg" />
        </div>
        
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 shadow-card border border-border/50 mt-8 animate-slide-up-delay-1">
          <Dumbbell className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            שלב ג׳ - תכנון אימונים
          </h1>
          <p className="text-muted-foreground mb-6">
            מסך זה יכלול את תכנון האימונים המפורט. כרגע הוא בשלבי בנייה.
          </p>
          
          <Button
            variant="outline"
            onClick={() => navigate('/weekly-setup')}
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            חזור להגדרות שבועיות
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanning;
