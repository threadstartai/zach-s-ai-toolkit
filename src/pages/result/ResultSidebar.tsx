import { NavLink, useLocation } from "react-router-dom";

type Item = { label: string; path: string; end?: boolean };

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
};

type Props = {
  mode?: "dashboard" | "public";
  currentStackId?: string | null;
  currentStackLabel?: string | null;
  currentStackCreatedAt?: string | null;
};

export const ResultSidebar = ({
  mode = "dashboard",
  currentStackId = null,
  currentStackLabel = null,
  currentStackCreatedAt = null,
}: Props) => {
  const { pathname } = useLocation();

  const items: Item[] = (() => {
    if (mode === "public" && currentStackId) {
      const base = `/stack/result/${currentStackId}`;
      return [{ label: "My Stack", path: `${base}/my-stack` }];
    }
    const out: Item[] = [{ label: "Home", path: "/dashboard", end: true }];
    if (currentStackId) {
      const base = `/dashboard/stacks/${currentStackId}`;
      out.push(
        { label: "Tonight", path: `${base}/tonight` },
        { label: "My Stack", path: `${base}/my-stack` },
        { label: "Saved", path: `${base}/saved` },
        { label: "All tools", path: `${base}/all-tools` },
        { label: "Briefing method", path: `${base}/briefing-method` },
        { label: "Check before trust", path: `${base}/check-before-trust` },
        { label: "Foundations", path: `${base}/foundations` },
        { label: "Work with Zach", path: `${base}/work-with-zach` },
      );
    }
    return out;
  })();

  const indicatorLabel =
    currentStackLabel ||
    (currentStackCreatedAt ? `Stack from ${formatDate(currentStackCreatedAt)}` : null);

  return (
    <nav
      aria-label="Dashboard sections"
      className="
        sticky top-16 z-30 bg-background
        border-b border-[hsl(var(--border))]
        md:border-b-0 md:border-r md:border-[hsl(var(--border))]
        md:w-[220px] md:shrink-0 md:self-start md:h-[calc(100vh-4rem)]
        md:py-8 md:px-4
      "
    >
      {mode === "dashboard" && indicatorLabel && (
        <div className="hidden md:block px-3 mb-4">
          <p className="text-[11px] uppercase tracking-wider text-navy/50 font-medium">
            Current stack
          </p>
          <p className="mt-1 text-[13px] text-navy font-medium truncate">
            {indicatorLabel}
          </p>
        </div>
      )}
      <ul
        className="
          flex flex-row md:flex-col gap-1 md:gap-y-0.5
          overflow-x-auto md:overflow-visible
          px-4 py-2 md:p-0
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        "
      >
        {items.map((item) => {
          const isActive = item.end ? pathname === item.path : pathname === item.path || pathname.startsWith(item.path + "/");
          return (
            <li key={item.label} className="shrink-0 md:shrink">
              <NavLink
                to={item.path}
                end={item.end}
                className={
                  isActive
                    ? "block px-3 py-1.5 md:py-2.5 md:pl-2.5 md:pr-3 rounded-[8px] text-[13px] md:text-[14px] font-medium md:border-l-2 md:border-navy bg-navy-light/60 text-navy whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                    : "block px-3 py-1.5 md:py-2.5 md:px-3 rounded-[8px] text-[13px] md:text-[14px] md:border-l-2 md:border-transparent text-navy/70 hover:text-navy hover:bg-navy-light/30 whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
                }
              >
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
