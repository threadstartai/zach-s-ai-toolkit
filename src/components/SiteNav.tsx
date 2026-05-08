import { Link, NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/stack", label: "The Stack" },
  { to: "/work-with-me", label: "Work with me" },
];

const SiteNav = () => {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur border-b border-border">
      <nav className="mx-auto max-w-[920px] px-6 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-navy tracking-tight text-[15px]">
          Zach's AI Stack
        </Link>
        <ul className="flex items-center gap-7 text-[14px]">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `transition-colors hover:text-navy ${
                    isActive ? "text-navy font-medium" : "text-foreground/70"
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default SiteNav;
