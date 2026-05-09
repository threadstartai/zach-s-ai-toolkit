const Divider = ({ label = "or" }: { label?: string }) => (
  <div className="my-5 flex items-center gap-3">
    <div className="flex-1 h-px bg-[hsl(var(--border))]" />
    <span className="text-[12px] text-foreground/55 uppercase tracking-wider">{label}</span>
    <div className="flex-1 h-px bg-[hsl(var(--border))]" />
  </div>
);

export default Divider;
