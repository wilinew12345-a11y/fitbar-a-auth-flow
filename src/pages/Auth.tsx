import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import SignUpForm from '@/components/auth/SignUpForm';
import LoginForm from '@/components/auth/LoginForm';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Dumbbell } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') as AuthMode || 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-barca flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-foreground border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-barca flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center pt-12 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary-foreground/20 p-3 rounded-xl backdrop-blur-sm">
            <Dumbbell className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-primary-foreground tracking-tight">
              Fit<span className="text-barca-gold">Barça</span>
            </h1>
            <p className="text-primary-foreground/70 text-sm font-medium">
              Train Like a Champion
            </p>
          </div>
        </div>
      </div>

      {/* Auth Card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-2xl p-8 animate-pulse-glow">
            {mode === 'signup' && (
              <SignUpForm onSwitchToLogin={() => setMode('login')} />
            )}
            {mode === 'login' && (
              <LoginForm 
                onSwitchToSignup={() => setMode('signup')}
                onForgotPassword={() => setMode('forgot')}
              />
            )}
            {mode === 'forgot' && (
              <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;