import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import SocialButtons from "@/components/auth/SocialButtons";
import Divider from "@/components/auth/Divider";
import { useAuth } from "@/contexts/AuthContext";

const inputCls =
  "w-full rounded-[8px] border border-[hsl(var(--border))] bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy";
const labelCls = "block text-[13px] font-medium text-navy mb-1.5";
const primaryBtn =
  "w-full inline-flex items-center justify-center bg-navy text-primary-foreground px-4 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

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
      subtitle="Free. Yours to keep updated."
      footer={<>Already have an account? <Link to="/login" className="text-navy underline underline-offset-2 hover:opacity-80">Log in</Link></>}
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
          <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          <p className="mt-1.5 text-[12px] text-foreground/60">At least 8 characters.</p>
        </div>
        {error && <p className="text-[13px] text-destructive">{error}</p>}
        {info && <p className="text-[13px] text-navy/85">{info}</p>}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthCard>
  );
};

export default Signup;
