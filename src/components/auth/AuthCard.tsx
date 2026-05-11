import { ReactNode } from "react";
import { Link } from "react-router-dom";

const AuthCard = ({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-5 border-b border-[hsl(var(--border))]/60">
        <Link to="/" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-12">
        <div className="w-full max-w-[440px] bg-card border border-[hsl(var(--border))] rounded-[12px] p-10 md:p-12">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-foreground tracking-[-0.02em] leading-[1.15]">{title}</h1>
          {subtitle && <p className="mt-3 text-[15px] text-foreground/70 leading-[1.6]">{subtitle}</p>}
          <div className="mt-9">{children}</div>
        </div>
        {footer && (
          <div className="mt-8 text-sm text-foreground/65 text-center">
            {footer}
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthCard;
