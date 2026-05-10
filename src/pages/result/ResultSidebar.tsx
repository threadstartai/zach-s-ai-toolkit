import { NavLink } from "react-router-dom";

type Item = { label: string; to: string };

const items: Item[] = [
  { label: "Tonight", to: "tonight" },
  { label: "My Stack", to: "my-stack" },
  { label: "Saved", to: "saved" },
  { label: "All tools", to: "all-tools" },
  { label: "Foundations", to: "foundations" },
  { label: "Work with Zach", to: "work-with-zach" },
];

export const ResultSidebar = () => {
  return (
    <nav
      aria-label="Dashboard sections"
      className="
        sticky top-14 z-30 bg-background
        border-b border-[hsl(var(--border))]
        md:border-b-0 md:border-r md:border-[hsl(var(--border))]
        md:w-[220px] md:shrink-0 md:self-start md:h-[calc(100vh-3.5rem)]
        md:py-8 md:px-4
      "
    >
      <p className="hidden md:block text-[11px] uppercase tracking-wider text-navy/50 font-medium px-3 mb-2">
        Your Stack
      </p>
      <ul
        className="
          flex flex-row md:flex-col gap-1 md:gap-y-0.5
          overflow-x-auto md:overflow-visible
          px-4 py-2 md:p-0
          [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
        "
      >
        {items.map((item) => (
          <li key={item.label} className="shrink-0 md:shrink">
            <NavLink
              to={item.to}
              end
              className={({ isActive }) =>
                isActive
                  ? "block px-3 py-1.5 md:py-2.5 md:pl-2.5 md:pr-3 rounded-[8px] text-[13px] md:text-[14px] font-medium md:border-l-2 md:border-navy bg-navy-light/60 text-navy whitespace-nowrap transition-colors duration-150"
                  : "block px-3 py-1.5 md:py-2.5 md:px-3 rounded-[8px] text-[13px] md:text-[14px] md:border-l-2 md:border-transparent text-navy/70 hover:text-navy hover:bg-navy-light/30 whitespace-nowrap transition-colors duration-150"
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
