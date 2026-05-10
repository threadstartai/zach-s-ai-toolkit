import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
};

export const EmptyState = ({ children, action, className = "" }: Props) => (
  <div className={`mt-10 max-w-[480px] ${className}`}>
    <p className="italic text-[15px] text-foreground/65 leading-[1.6]">{children}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);
