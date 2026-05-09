import { NavLink } from "react-router-dom";

type Item = { label: string; to?: string; disabled?: boolean };

const items: Item[] = [
  { label: "Tonight", disabled: true },
  { label: "My Stack", to: "my-stack" },
  { label: "Saved", disabled: true },
  { label: "All tools", disabled: true },
  { label: "Foundations", disabled: true },
  { label: "Work with Zach", disabled: true },
];

export const ResultSidebar = () => {
  return (
    <nav
      aria-label="Dashboard sections"
      className="w-full md:w-[220px] md:shrink-0 md:sticky md:top-14 md:self-start md:h-[calc(100vh-3.5rem)] md:border-r md:border-[hsl(var(--border))] bg-background py-6 md:py-8 px-3 md:px-4"
    >
      <p className="text-[11px] uppercase tracking-wider text-navy/50 font-medium px-3 mb-2">
        Your Stack
      </p>
      <ul className="flex md:flex-col gap-x-1 gap-y-0.5 flex-wrap">
        {items.map((item) => {
          const inactiveBase =
            "block w-full py-2.5 px-3 rounded-[8px] text-[14px] transition-colors duration-150 border-l-2";
          if (item.disabled || !item.to) {
            return (
              <li key={item.label}>
                <span
                  aria-disabled="true"
                  title="Coming soon"
                  className={`${inactiveBase} border-transparent text-navy/30 cursor-not-allowed select-none`}
                >
                  {item.label}
                </span>
              </li>
            );
          }
          return (
            <li key={item.label}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  isActive
                    ? `block w-full py-2.5 pl-2.5 pr-3 rounded-[8px] text-[14px] font-medium border-l-2 border-navy bg-navy-light/60 text-navy transition-colors duration-150`
                    : `${inactiveBase} border-transparent text-navy/70 hover:text-navy hover:bg-navy-light/30`
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
