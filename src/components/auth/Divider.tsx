const Divider = ({ label = "or" }: { label?: string }) => (
  <div className="my-5 flex items-center">
    <div className="flex-1 h-px bg-[hsl(var(--border))]" />
    <span className="text-[13px] text-foreground/55 mx-3">{label}</span>
    <div className="flex-1 h-px bg-[hsl(var(--border))]" />
  </div>
);

export default Divider;
