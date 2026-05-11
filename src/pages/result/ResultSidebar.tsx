import { NavLink, useLocation } from "react-router-dom";

type Item = { label: string; path: string; end?: boolean; count?: number };
type Group = { label?: string; items: Item[] };

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
  savedCount?: number;
};

export const ResultSidebar = ({
  mode = "dashboard",
  currentStackId = null,
  currentStackLabel = null,
  currentStackCreatedAt = null,
  savedCount = 0,
}: Props) => {
  const { pathname } = useLocation();

  const groups: Group[] = (() => {
    if (mode === "public" && currentStackId) {
      const base = `/stack/result/${currentStackId}`;
      return [{ items: [{ label: "My Stack", path: `${base}/my-stack` }] }];
    }
    if (!currentStackId) {
      return [{ items: [
        { label: "Home", path: "/dashboard", end: true },
        { label: "Notes", path: "/dashboard/notes" },
      ] }];
    }
    const base = `/dashboard/stacks/${currentStackId}`;
    return [
      { items: [
        { label: "Home", path: "/dashboard", end: true },
        { label: "Notes", path: "/dashboard/notes" },
      ] },
      {
        label: "Progress",
        items: [
          { label: "Tonight", path: `${base}/tonight` },
          { label: "My Stack", path: `${base}/my-stack` },
          { label: "Saved", path: `${base}/saved`, count: savedCount },
          { label: "All tools", path: `${base}/all-tools` },
        ],
      },
      {
        label: "Method",
        items: [
          { label: "Briefing method", path: `${base}/briefing-method` },
          { label: "Check before trust", path: `${base}/check-before-trust` },
          { label: "Relay map", path: `${base}/relay-map` },
        ],
      },
      {
        label: "Library",
        items: [
          { label: "Foundations", path: `${base}/foundations` },
          { label: "Work with Zach", path: `${base}/work-with-zach` },
        ],
      },
    ];
  })();

  const indicatorLabel =
    currentStackLabel ||
    (currentStackCreatedAt ? `Stack from ${formatDate(currentStackCreatedAt)}` : null);

  const isItemActive = (item: Item) =>
    item.end ? pathname === item.path : pathname === item.path || pathname.startsWith(item.path + "/");

  const navLinkCls = (active: boolean, desktop: boolean) => {
    if (desktop) {
      return active
        ? "block py-2.5 pl-2.5 pr-3 rounded-[8px] text-[14px] font-medium border-l-2 border-navy bg-navy-light/60 text-navy whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        : "block py-2.5 px-3 rounded-[8px] text-[14px] border-l-2 border-transparent text-navy/70 hover:text-navy hover:bg-navy-light/30 whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
    }
    return active
      ? "block px-3 py-2.5 rounded-[8px] text-[13px] font-medium bg-navy-light/60 text-navy whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
      : "block px-3 py-2.5 rounded-[8px] text-[13px] text-navy/70 hover:text-navy hover:bg-navy-light/30 whitespace-nowrap transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2";
  };

  const flatItems = groups.flatMap((g) => g.items);

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

      {/* Mobile: single horizontal scroll, flat */}
      <ul
        className="md:hidden flex flex-row gap-1 overflow-x-auto px-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {flatItems.map((item) => {
          const active = isItemActive(item);
          return (
            <li key={item.path} className="shrink-0">
              <NavLink to={item.path} end={item.end} className={navLinkCls(active, false)}>
                {item.label}
              </NavLink>
            </li>
          );
        })}
      </ul>

      {/* Desktop: grouped vertical layout */}
      <div className="hidden md:block">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className={groupIdx === 0 ? "" : "mt-5"}>
            {group.label && (
              <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-navy/55 px-3 mb-1.5">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-y-0.5">
              {group.items.map((item) => {
                const active = isItemActive(item);
                return (
                  <li key={item.path}>
                    <NavLink to={item.path} end={item.end} className={navLinkCls(active, true)}>
                      <span className="flex items-center justify-between w-full gap-2">
                        <span>{item.label}</span>
                        {typeof item.count === "number" && item.count > 0 && (
                          <span className="text-[11px] font-mono text-navy/55 tabular-nums">
                            {item.count}
                          </span>
                        )}
                      </span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
};
