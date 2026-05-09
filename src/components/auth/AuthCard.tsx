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
    <div className="min-h-screen bg-offwhite flex flex-col">
      <header className="px-6 py-5 border-b border-[hsl(var(--border))]/60">
        <Link to="/" className="font-bold text-navy tracking-tight text-[15px]">
          My AI Stack
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] bg-background border border-[hsl(var(--border))] rounded-[12px] p-8 shadow-sm">
          <h1 className="text-[24px] font-bold text-navy tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-foreground/75">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && (
            <div className="mt-6 pt-6 border-t border-[hsl(var(--border))]/60 text-[14px] text-foreground/75 text-center">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthCard;
