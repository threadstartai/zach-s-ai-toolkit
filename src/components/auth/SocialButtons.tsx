import { useState } from "react";
import { lovable } from "@/integrations/lovable";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.67-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.67 2.84C6.72 7.31 9.14 5.38 12 5.38Z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.37 12.6c-.03-2.62 2.14-3.88 2.24-3.94-1.22-1.79-3.12-2.03-3.8-2.06-1.62-.16-3.16.95-3.98.95-.83 0-2.1-.93-3.45-.9-1.77.02-3.4 1.03-4.31 2.61-1.84 3.19-.47 7.9 1.32 10.5.88 1.27 1.92 2.69 3.27 2.64 1.32-.05 1.81-.85 3.4-.85 1.59 0 2.04.85 3.42.83 1.42-.02 2.31-1.28 3.17-2.56 1-1.47 1.41-2.9 1.43-2.97-.03-.01-2.74-1.05-2.77-4.16Zm-2.6-7.65c.73-.88 1.22-2.11 1.08-3.33-1.05.04-2.31.7-3.06 1.58-.67.78-1.26 2.03-1.1 3.23 1.17.09 2.36-.6 3.08-1.48Z" />
  </svg>
);

const SocialButtons = () => {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handle = async (provider: "google" | "apple") => {
    setLoading(provider);
    setError(null);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: `${window.location.origin}/dashboard`,
      });
      if (result.error) {
        setError("Couldn't sign in. Please try again.");
        setLoading(null);
        return;
      }
      // If redirected, browser handles it. Otherwise tokens set.
      if (!result.redirected) {
        window.location.assign("/dashboard");
      }
    } catch {
      setError("Couldn't sign in. Please try again.");
      setLoading(null);
    }
  };

  const btn =
    "w-full inline-flex items-center justify-center gap-3 border border-[hsl(var(--border))] rounded-[8px] px-4 py-2.5 text-[14px] font-medium text-navy hover:bg-navy-light transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col gap-2.5">
      <button onClick={() => handle("google")} disabled={loading !== null} className={btn}>
        <GoogleIcon />
        {loading === "google" ? "Opening Google…" : "Continue with Google"}
      </button>
      <button onClick={() => handle("apple")} disabled={loading !== null} className={btn}>
        <AppleIcon />
        {loading === "apple" ? "Opening Apple…" : "Continue with Apple"}
      </button>
      {error && <p className="text-[13px] text-destructive">{error}</p>}
    </div>
  );
};

export default SocialButtons;
