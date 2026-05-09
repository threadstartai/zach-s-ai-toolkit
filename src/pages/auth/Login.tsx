import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import SocialButtons from "@/components/auth/SocialButtons";
import Divider from "@/components/auth/Divider";
import { useAuth } from "@/contexts/AuthContext";

const inputCls =
  "w-full h-11 rounded-[10px] border border-[hsl(var(--border))] bg-background px-4 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-150";
const labelCls = "block text-[13px] font-medium text-navy mb-1.5";
const primaryBtn =
  "w-full inline-flex items-center justify-center h-12 bg-navy text-primary-foreground rounded-[10px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
const errorCls = "text-[13px] text-destructive bg-destructive/10 rounded-[8px] px-3 py-2 mt-1";

const Login = () => {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!loading && user) return <Navigate to={location.state?.from ?? "/dashboard"} replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    navigate(location.state?.from ?? "/dashboard", { replace: true });
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to your AI Stack."
      footer={<>Don't have an account? <Link to="/signup" className="text-navy underline underline-offset-2 hover:opacity-80">Sign up</Link></>}
    >
      <SocialButtons />
      <Divider />
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className={labelCls}>Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
        </div>
        {error && <p className="text-[13px] text-destructive">{error}</p>}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
        <div className="text-right">
          <Link to="/forgot-password" className="text-[13px] text-navy/80 hover:text-navy hover:underline">Forgot password?</Link>
        </div>
      </form>
    </AuthCard>
  );
};

export default Login;
