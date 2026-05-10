import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const Settings = () => {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  const options: { value: "light" | "dark" | "system"; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="max-w-[720px] mx-auto px-5 sm:px-8 py-8 md:py-10">
      <h1 className="text-[32px] font-bold">Settings</h1>

      <section className="mt-8">
        <h2 className="text-[20px] font-bold mb-4">Account</h2>
        <div className="bg-card border border-[hsl(var(--border))] rounded-[12px] divide-y divide-[hsl(var(--border))]">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-foreground/70">Email</span>
            <span className="text-navy truncate ml-4">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-foreground/70">Sign out of this device</span>
            <button
              onClick={() => { void signOut(); window.location.assign("/"); }}
              className="text-navy hover:underline transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 rounded-sm"
            >
              Sign out
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-bold mb-4">Appearance</h2>
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => {
            const selected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={
                  selected
                    ? "px-5 py-2.5 rounded-[8px] bg-navy text-primary-foreground transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                    : "px-5 py-2.5 rounded-[8px] bg-background border border-[hsl(var(--border))] text-navy hover:border-navy/40 transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-foreground/65">
          System follows your device preference.
        </p>
      </section>
    </div>
  );
};

export default Settings;
