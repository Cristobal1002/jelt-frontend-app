import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, TrendingUp, Zap, Brain } from "lucide-react";
import { JeltLogo } from "@/components/branding/JeltLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { cn } from "@/lib/utils";

/** Contenedor de input + iconos: evita translate-y en SVG (borroso) y backdrop-blur en el campo */
const authInputShell =
  "flex h-12 w-full items-center gap-3 rounded-md border border-[hsl(var(--input-border))] bg-background px-3 shadow-sm transition-colors focus-within:border-[hsl(var(--primary))] focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background";

const authInputField =
  "h-12 min-h-12 flex-1 min-w-0 border-0 bg-transparent px-0 py-0 text-base shadow-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

export default function AuthPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
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
                <JeltLogo className="h-16 sm:h-20 max-h-20 w-auto max-w-[220px] mx-auto" />
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">
                  Jelt Inventory
                </h1>
                <p className="text-sm text-muted-foreground">Intelligent Inventory Management</p>
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
            <form onSubmit={handleSignIn} className="space-y-5 relative z-10">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Email</label>
                <div className={authInputShell}>
                  <Mail className="h-5 w-5 shrink-0 text-muted-foreground pointer-events-none" strokeWidth={2} aria-hidden />
                  <Input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className={authInputField}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">Password</label>
                <div className={cn(authInputShell, "gap-2 pr-1")}>
                  <Lock className="h-5 w-5 shrink-0 text-muted-foreground pointer-events-none" strokeWidth={2} aria-hidden />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className={authInputField}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="inline-flex shrink-0 items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" strokeWidth={2} aria-hidden />
                    ) : (
                      <Eye className="h-5 w-5" strokeWidth={2} aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-light))] transition-colors font-medium"
                  onClick={() => {
                    setShowRecoveryDialog(true);
                    setRecoveryEmail(email);
                  }}
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-medium bg-gradient-ai text-white hover:opacity-90 shadow-lg" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
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
                <div className={authInputShell}>
                  <Mail className="h-5 w-5 shrink-0 text-muted-foreground pointer-events-none" strokeWidth={2} aria-hidden />
                  <Input
                    id="recovery-email"
                    type="email"
                    placeholder="you@email.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    required
                    disabled={recoveryLoading}
                    className={authInputField}
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
