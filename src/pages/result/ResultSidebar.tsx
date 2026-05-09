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
    <nav aria-label="Result sections" className="text-[15px]">
      <ul className="flex md:flex-col gap-x-5 gap-y-1 flex-wrap">
        {items.map((item) => (
          <li key={item.label}>
            {item.disabled || !item.to ? (
              <span
                aria-disabled="true"
                className="block px-3 py-2 border-l-2 border-transparent text-navy/40 cursor-not-allowed select-none"
              >
                {item.label}
              </span>
            ) : (
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  `block px-3 py-2 border-l-2 transition-colors duration-150 ${
                    isActive
                      ? "border-navy text-navy font-medium"
                      : "border-transparent text-navy/80 hover:text-navy"
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
