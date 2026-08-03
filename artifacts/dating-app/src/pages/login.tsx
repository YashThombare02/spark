import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin, useGetDemoCredentials, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Mail, Camera, Copy, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DemoCredential } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [loginType, setLoginType] = useState<"gmail" | "instagram" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const { data: credentialsData } = useGetDemoCredentials();
  const loginMutation = useLogin();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginType) return;
    
    loginMutation.mutate({
      data: {
        loginType,
        usernameOrEmail: username,
        password
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
      onError: (err) => {
        toast.error("Login failed", {
          description: err.data?.error || "Invalid credentials"
        });
      }
    });
  };

  const copyCreds = (cred: DemoCredential) => {
    navigator.clipboard.writeText(`User: ${cred.usernameOrEmail}\nPass: ${cred.password}`);
    toast.success("Copied!", {
      description: "Credentials copied to clipboard",
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center px-6 pt-24 pb-12 w-full max-w-md mx-auto relative z-10">
        <div className="flex flex-col items-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-16 h-16 rounded-2xl brand-gradient flex items-center justify-center shadow-xl shadow-primary/25 mb-4">
            <Flame className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight brand-gradient-text">Spark</h1>
          <p className="text-muted-foreground mt-2 text-center">Find the one who matches your energy.</p>
        </div>

        {!loginType ? (
          <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => setLoginType("gmail")}
              className="w-full h-14 bg-white dark:bg-zinc-900 border border-border rounded-xl flex items-center justify-center gap-3 font-semibold text-[15px] hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              <Mail className="w-5 h-5 text-red-500" />
              Continue with Gmail
            </button>
            <button
              onClick={() => setLoginType("instagram")}
              className="w-full h-14 bg-white dark:bg-zinc-900 border border-border rounded-xl flex items-center justify-center gap-3 font-semibold text-[15px] hover:border-primary/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all active:scale-[0.98]"
            >
              <Camera className="w-5 h-5 text-pink-500" />
              Continue with Instagram
            </button>

            {credentialsData && (
              <div className="mt-12 w-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-[1px] flex-1 bg-border" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Demo Accounts</span>
                  <div className="h-[1px] flex-1 bg-border" />
                </div>
                
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {[...credentialsData.gmail, ...credentialsData.instagram].map((cred, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-border rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border">
                          <img src={cred.profileImage} alt={cred.fullName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{cred.fullName}</span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            {cred.loginType === "gmail" ? <Mail className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                            {cred.usernameOrEmail}
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyCreds(cred)}
                        className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setLoginType(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                {loginType === "gmail" ? <Mail className="w-5 h-5 text-red-500" /> : <Camera className="w-5 h-5 text-pink-500" />}
                <span className="font-semibold capitalize text-sm">Login with {loginType}</span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Username or Email</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-input bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-input bg-transparent outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-14 mt-4 brand-gradient rounded-xl text-white font-bold text-[15px] shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {loginMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}