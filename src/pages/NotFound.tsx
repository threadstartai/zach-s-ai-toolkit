import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

const primaryBtn =
  "inline-flex items-center justify-center bg-navy text-primary-foreground px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy/90 transition-colors duration-150";
const outlineBtn =
  "inline-flex items-center justify-center border border-navy text-navy px-5 py-3 rounded-[8px] text-[15px] font-medium hover:bg-navy-light transition-colors duration-150";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full">
        <p className="font-mono text-[13px] text-navy/60">404</p>
        <h1 className="mt-3 text-3xl font-bold text-navy tracking-tight">Page not found</h1>
        <p className="mt-4 text-base text-foreground/75 leading-[1.65]">
          I either got the URL wrong or the page moved. Either way, here are the bits that are working.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 items-start">
          <Link to="/" className={primaryBtn}>Home →</Link>
          <Link to="/stack" className={outlineBtn}>Browse the 17 tools →</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
