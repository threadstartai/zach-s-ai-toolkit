import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

const inputCls =
  "w-full h-11 rounded-[10px] border border-[hsl(var(--border))] bg-background px-4 text-[15px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-navy focus:ring-2 focus:ring-navy/20 transition-shadow duration-150";
const labelCls = "block text-[13px] font-medium text-navy mb-1.5";
const primaryBtn =
  "w-full inline-flex items-center justify-center h-12 bg-navy text-primary-foreground rounded-[10px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
const errorCls = "text-[13px] text-destructive bg-destructive/10 rounded-[8px] px-3 py-2 mt-1";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <AuthCard title="Set a new password" subtitle="You're almost back in.">
      <form onSubmit={onSubmit} className="flex flex-col space-y-4">
        <div>
          <label htmlFor="password" className={labelCls}>New password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          <p className="mt-1.5 text-[12px] text-foreground/60">At least 8 characters.</p>
        </div>
        {error && <p className={errorCls}>{error}</p>}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
