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

const baseLink =
  "block px-4 py-2 text-[14px] border-l-2 transition-colors duration-150 rounded-r-[6px]";

export const ResultSidebar = () => {
  return (
    <nav aria-label="Result sections" className="md:bg-background md:border md:border-[hsl(var(--border))] md:rounded-[12px] md:py-3 md:px-1.5">
      <ul className="flex md:flex-col gap-x-2 gap-y-0.5 flex-wrap">
        {items.map((item) => (
          <li key={item.label}>
            {item.disabled || !item.to ? (
              <span
                aria-disabled="true"
                className={`${baseLink} border-transparent text-navy/30 cursor-not-allowed select-none`}
              >
                {item.label}
              </span>
            ) : (
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `${baseLink} ${
                    isActive
                      ? "border-navy bg-navy-light text-navy font-medium"
                      : "border-transparent text-navy/70 hover:text-navy hover:bg-navy-light/40"
                  }`
                }
              >
                {item.label}
              </NavLink>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
