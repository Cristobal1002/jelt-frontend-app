import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Zap, Brain, User } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await register({
        name: name.trim(),
        email,
        password,
      });

      toast({
        title: "Account created!",
        description: "You have successfully signed in.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign up error",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Sign in error",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden ai-background">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(var(--primary))] opacity-10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[hsl(var(--accent))] opacity-10 rounded-full blur-3xl" style={{ animation: 'float 4s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[hsl(var(--primary-light))] opacity-5 rounded-full blur-3xl" style={{ animation: 'float 5s ease-in-out infinite' }} />
      </div>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="card-ai-glass p-8 space-y-8">
            <div className="ai-panel-glow" />
            
            {/* Logo & Brand */}
            <div className="text-center space-y-4 relative z-10">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-ai flex items-center justify-center shadow-2xl">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <span className="ai-spark absolute -top-2 -right-2" />
                </div>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold bg-gradient-ai bg-clip-text text-transparent mb-2">
                  Jelt Inventory
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? "Create your account to access" : "Intelligent Inventory Management"}
                </p>
              </div>

              {/* AI Status Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--success-glow))] border border-[hsl(var(--success))]/20">
                <span className="ai-spark scale-75" />
                <span className="text-xs font-medium text-[hsl(var(--success))]">
                  AI Active · Real-time Prediction
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-5 relative z-10">
              {/* Name Input - Only for Sign Up */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-card-foreground">Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-12 h-12 border-[hsl(var(--input-border))] focus:border-[hsl(var(--primary))] bg-background/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="pl-12 h-12 border-[hsl(var(--input-border))] focus:border-[hsl(var(--primary))] bg-background/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pl-12 pr-12 h-12 border-[hsl(var(--input-border))] focus:border-[hsl(var(--primary))] bg-background/50 backdrop-blur-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link - Only show on login */}
              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-light))] transition-colors font-medium"
                    onClick={() => {
                      setShowRecoveryDialog(true);
                      setRecoveryEmail(email); // Pre-fill with current email if any
                    }}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-ai text-white hover:opacity-90 shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isSignUp ? "Create Account" : "Sign In"}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Toggle between Login/Signup */}
            <div className="text-center text-sm relative z-10 pt-4 border-t border-[hsl(var(--border))]">
              <span className="text-muted-foreground">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setName("");
                  setEmail("");
                  setPassword("");
                }}
                className="text-[hsl(var(--primary))] font-semibold hover:text-[hsl(var(--primary-light))] transition-colors"
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - AI Features Showcase */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative z-10">
        <div className="max-w-lg space-y-8">
          {/* Hero Text */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--card-glass))] backdrop-blur-xl border border-[hsl(var(--border))]">
              <Brain className="w-4 h-4 text-[hsl(var(--primary))]" />
              <span className="text-sm font-medium text-card-foreground">Powered by AI</span>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight text-card-foreground">
              Manage your inventory with{" "}
              <span className="bg-gradient-ai bg-clip-text text-transparent">
                Artificial Intelligence
              </span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              Platform designed to optimize operations and maximize efficiency with real-time predictions.
            </p>
          </div>

          {/* AI Features */}
          <div className="space-y-4">
            {[
              {
                icon: TrendingUp,
                title: "Demand Forecasting",
                description: "AI algorithms analyze historical patterns to predict future needs"
              },
              {
                icon: Zap,
                title: "Smart Automation",
                description: "Automatic stock control with real-time reorder recommendations"
              },
              {
                icon: Sparkles,
                title: "Predictive Insights",
                description: "Advanced supplier analysis and cost optimization with AI"
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="card-ai-glass p-5 ai-hover-lift cursor-pointer group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="p-3 rounded-xl bg-gradient-ai">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="ai-spark absolute -top-1 -right-1 scale-75" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-card-foreground group-hover:text-[hsl(var(--primary))] transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-3 pt-6">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background bg-gradient-ai flex items-center justify-center text-white text-xs font-bold"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <p className="font-semibold text-card-foreground">+500 clinics trust us</p>
              <p className="text-muted-foreground">to manage their medical inventory</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recover Password</DialogTitle>
            <DialogDescription>
              {recoverySent
                ? "If the email exists, a temporary code has been sent to your inbox. Use this code as your password to log in."
                : "Enter your email address and we'll send you a temporary code to reset your password."}
            </DialogDescription>
          </DialogHeader>
          
          {!recoverySent ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!recoveryEmail.trim()) {
                  toast({
                    title: "Email required",
                    description: "Please enter your email address.",
                    variant: "destructive",
                  });
                  return;
                }

                setRecoveryLoading(true);
                try {
                  await apiClient.requestRecovery(recoveryEmail.trim());
                  setRecoverySent(true);
                  toast({
                    title: "Recovery code sent",
                    description: "Check your email for a temporary code. Use it as your password to log in.",
                  });
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message || "Failed to send recovery code. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setRecoveryLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="recovery-email" className="text-sm font-medium">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="you@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    disabled={recoveryLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRecoveryDialog(false);
                    setRecoveryEmail("");
                    setRecoverySent(false);
                  }}
                  disabled={recoveryLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={recoveryLoading}>
                  {recoveryLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Recovery Code"
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">
                  <strong>Next steps:</strong>
                </p>
                <ol className="mt-2 text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Check your email for the temporary code</li>
                  <li>Return to the login form</li>
                  <li>Use the code as your password</li>
                </ol>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => {
                    setShowRecoveryDialog(false);
                    setRecoveryEmail("");
                    setRecoverySent(false);
                    setEmail(recoveryEmail); // Pre-fill email in login form
                  }}
                >
                  Got it
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
