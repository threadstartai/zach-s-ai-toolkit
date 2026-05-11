import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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

const Signup = () => {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setInfo(null);
    const { error: err } = await signUp(email.trim(), password);
    if (err) {
      setError(err);
      setSubmitting(false);
      return;
    }
    // If email confirmation is on, no session yet — show info. If off, AuthContext picks up session and redirect happens via guard.
    setInfo("Check your inbox to verify your email, then come back and log in.");
    setSubmitting(false);
    setTimeout(() => navigate("/onboarding", { replace: true }), 600);
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Three tools. One starting plan. I'll save it so you can come back to it."
      footer={<>Already have an account? <Link to="/login" className="text-navy hover:underline">Log in</Link></>}
    >
      <SocialButtons />
      <Divider />
      <p className="text-[13px] text-foreground/60 italic leading-[1.55] -mt-2 mb-1">
        No marketing emails. No upsells. Just your Stack saved for next time.
      </p>
      <form onSubmit={onSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="password" className={labelCls}>Password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          <p className="mt-1.5 text-[12px] text-foreground/60">At least 8 characters.</p>
        </div>
        {error && <p className={errorCls}>{error}</p>}
        {info && <p className="text-[13px] text-navy/85">{info}</p>}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Signup;
