import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

const inputCls =
  "w-full h-11 rounded-[10px] border border-[hsl(var(--border))] bg-background px-4 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-150";
const labelCls = "block text-[13px] font-medium text-navy mb-1.5";
const primaryBtn =
  "w-full inline-flex items-center justify-center h-12 bg-navy text-primary-foreground rounded-[10px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
const errorCls = "text-[13px] text-destructive bg-destructive/10 rounded-[8px] px-3 py-2 mt-1";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="I'll email you a link to set a new one."
      footer={<><Link to="/login" className="text-navy underline underline-offset-2 hover:opacity-80">Back to log in</Link></>}
    >
      {done ? (
        <p className="text-[14px] text-navy/85 leading-[1.6]">
          If an account exists for <span className="font-medium">{email}</span>, you'll get a reset link in the next minute or two. Check your spam folder if it doesn't arrive.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          {error && <p className="text-[13px] text-destructive">{error}</p>}
          <button type="submit" disabled={submitting} className={primaryBtn}>
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
