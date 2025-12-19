import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import FitBarcaLogo from "@/components/FitBarcaLogo";
import AuthBackground from "@/components/AuthBackground";
import LanguageSelector from "@/components/LanguageSelector";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().trim().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Auth = () => {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear form fields on component mount for security (complete reset, not spread)
  useEffect(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle PASSWORD_RECOVERY event - redirect to update password page
      if (event === "PASSWORD_RECOVERY") {
        navigate("/update-password");
        return;
      }
      
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignUp = async () => {
    try {
      const validatedData = signUpSchema.parse(formData);
      setIsLoading(true);

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({
            title: "User already registered",
            description: "Please login with your existing account.",
            variant: "destructive",
          });
          setIsLogin(true);
        } else {
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome to FitBarça!",
          description: "Your account has been created successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const validatedData = loginSchema.parse(formData);
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        // Clear password but keep email for better UX
        setFormData(prev => ({ ...prev, password: "" }));
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You have logged in successfully.",
        });
        navigate("/dashboard");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    try {
      loginSchema.shape.email.parse(formData.email);
    } catch {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for the reset link.",
      });
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <AuthBackground />
      
      {/* Language Selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 gap-2 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/20"
      >
        <BackIcon className="h-4 w-4" />
        {t('back')}
      </Button>
      
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <FitBarcaLogo size="lg" />
          <p className="mt-6 text-muted-foreground">
            {isLogin ? t('welcomeBack') : t('welcomeNew')}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-sidebar/80 backdrop-blur-sm rounded-2xl p-8 border border-sidebar-border animate-slide-up-delay-1">
          {/* Toggle Tabs */}
          <div className="flex bg-sidebar rounded-lg p-1 mb-6 border border-sidebar-border">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setErrors({});
                setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              }`}
            >
              {t('login')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setErrors({});
                setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                !isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-sidebar-foreground"
              }`}
            >
              {t('signUp')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sign Up Only Fields */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4 animate-slide-up">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-sidebar-foreground">
                    {t('firstName')}
                  </Label>
                  <div className="relative">
                    <User className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={isRtl ? 'pr-10' : 'pl-10'}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-sidebar-foreground">
                    {t('lastName')}
                  </Label>
                  <div className="relative">
                    <User className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={isRtl ? 'pr-10' : 'pl-10'}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-sidebar-foreground">
                {t('emailLabel')}
              </Label>
              <div className="relative">
                <Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  autoComplete="username"
                  className={isRtl ? 'pr-10' : 'pl-10'}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-sidebar-foreground">
                {t('passwordLabel')}
              </Label>
              <div className="relative">
                <Lock className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                <Input
                  key={isLogin ? "login-password" : "signup-password"}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className={isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sidebar-foreground transition-colors`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (Sign Up Only) */}
            {!isLogin && (
              <div className="space-y-2 animate-slide-up">
                <Label htmlFor="confirmPassword" className="text-sm text-sidebar-foreground">
                  {t('confirmPassword')}
                </Label>
                <div className="relative">
                  <Lock className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    autoComplete="new-password"
                    className={isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-sidebar-foreground transition-colors`}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password Link */}
            {isLogin && (
              <div className={isRtl ? 'text-left' : 'text-right'}>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-accent hover:text-accent/80 transition-colors"
                >
                  {t('forgotPassword')}
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="barca-blue"
              size="xl"
              className="w-full mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? t('loginButton') : t('createAccount')}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Bottom Text */}
        <p className="text-center text-sm text-muted-foreground mt-6 animate-slide-up-delay-2">
          {isLogin ? t('noAccount').split('?')[0] + "? " : t('alreadyHaveAccount') + " "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrors({});
              setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
            }}
            className="text-barca-gold hover:underline font-medium"
          >
            {isLogin ? t('signUp') : t('loginHere')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
