const SiteFooter = () => {
  return (
    <footer className="mt-32">
      <div className="mx-auto max-w-[760px] px-6">
        <hr className="border-0 border-t border-[hsl(var(--border))]/50" />
        <div className="py-12 text-[14px] leading-relaxed text-foreground/70">
          <p className="italic">Made by Zach Z. Made for friends &amp; family.</p>
          <p className="mt-4">
            If you know someone whose business or team would benefit from a proper AI setup, send them my way:
          </p>
          <p className="mt-2">
            <a
              href="mailto:zach@chromeconsulting.xyz"
              className="text-navy hover:underline"
            >
              zach@chromeconsulting.xyz
            </a>{" "}
            <span className="text-foreground/40">|</span>{" "}
            <a
              href="https://instagram.com/chrome.zach"
              className="text-navy hover:underline"
            >
              @chrome.zach
            </a>
          </p>
          <p className="mt-8 text-[12px] text-foreground/50">
            No affiliate links. No sponsored placements. Updated regularly.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
