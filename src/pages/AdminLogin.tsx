import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { dbService, isSupabaseConfigured } from "../lib/supabase";
import { ShieldAlert, Mail, Lock, LogIn, ArrowLeft, Info, HelpCircle } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("admin@dayynime.store");
  const [password, setPassword] = useState<string>("password123");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // If already logged in, redirect directly to admin panel
  useEffect(() => {
    const checkSession = async () => {
      const user = await dbService.getCurrentUser();
      if (user) {
        navigate("/admin");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await dbService.login(email, password);
      if (result.success) {
        navigate("/admin");
      } else {
        setError(result.error || "Authentication failed.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err?.message || "An unexpected error occurred during sign-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24" id="login-page">
      {/* Return to Portal Link */}
      <div className="mb-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-accent-indigo transition-all"
        >
          <ArrowLeft size={13} />
          Back to Portal Storefront
        </Link>
      </div>

      <div className="bg-bg-surface border border-bg-surface/50 rounded-lg p-6 sm:p-8">
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-accent-indigo/10 text-accent-indigo p-3 rounded-full mb-3 border border-accent-indigo/20">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-xl font-bold font-display text-text-primary">Admin Gateway</h2>
          <p className="text-xs text-text-secondary mt-1 font-mono">
            Dayynime Store Control Room
          </p>
        </div>

        {/* Demo instructions when in Sandbox mode */}
        {!isSupabaseConfigured ? (
          <div className="bg-bg-base/50 border border-bg-surface p-3.5 rounded mb-6 text-xs text-text-secondary leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-text-primary mb-1.5 font-display">
              <Info size={13} className="text-accent-indigo" />
              Sandbox Session Active
            </div>
            <p className="mb-2">Any admin username and password of 6+ characters will grant access, or use these standard demo keys:</p>
            <div className="font-mono bg-bg-base/80 p-2 rounded border border-bg-surface/40 space-y-1">
              <div><span className="text-text-primary">Email:</span> admin@dayynime.store</div>
              <div><span className="text-text-primary">Pass:</span> password123</div>
            </div>
          </div>
        ) : (
          <div className="bg-bg-base/30 border border-accent-indigo/20 p-3.5 rounded mb-6 text-xs text-text-secondary leading-normal flex gap-2">
            <HelpCircle size={14} className="text-accent-indigo shrink-0 mt-0.5" />
            <p>
              Supabase Authentication is active. Enter the administrator credentials registered in your database Auth table.
            </p>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs p-3.5 rounded mb-6 flex items-center gap-2">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none pl-9 pr-4 py-2.5 rounded-md transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-text-secondary uppercase block mb-1.5">
              Secure Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-base border border-bg-surface focus:border-accent-indigo text-text-primary text-xs outline-none pl-9 pr-4 py-2.5 rounded-md transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent-indigo text-text-primary font-semibold text-xs py-3 rounded-md flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none mt-6"
            id="btn-login-submit"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-text-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={14} />
                Access Dashboard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
