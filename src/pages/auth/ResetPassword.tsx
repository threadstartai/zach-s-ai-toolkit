import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import { supabase } from "@/integrations/supabase/client";

const inputCls =
  "w-full rounded-[8px] border border-[hsl(var(--border))] bg-background px-3 py-2.5 text-[14px] text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-navy/30 focus:border-navy";
const labelCls = "block text-[13px] font-medium text-navy mb-1.5";
const primaryBtn =
  "w-full inline-flex items-center justify-center bg-navy text-primary-foreground px-4 py-2.5 rounded-[8px] text-[14px] font-medium hover:bg-navy/90 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

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
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div>
          <label htmlFor="password" className={labelCls}>New password</label>
          <input id="password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          <p className="mt-1.5 text-[12px] text-foreground/60">At least 8 characters.</p>
        </div>
        {error && <p className="text-[13px] text-destructive">{error}</p>}
        <button type="submit" disabled={submitting} className={primaryBtn}>
          {submitting ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPassword;
