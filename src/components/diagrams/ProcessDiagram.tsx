export const ProcessDiagram = () => (
  <div className="my-2">
    <div className="mb-3">
      <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-navy/65">The Process</p>
      <p className="mt-1 text-[15px] italic text-foreground/65">How I actually use AI.</p>
    </div>

    <svg
      viewBox="0 0 800 320"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="The Process: a four-step loop — Dump, ChatGPT, Claude, Audit, then back to Dump"
    >
      <path d="M 720 70 Q 400 18 80 70" stroke="hsl(var(--navy))" strokeWidth="1.5" fill="none" />
      <polygon points="78,70 90,64 90,76" fill="hsl(var(--navy))" />
      <text x="400" y="22" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fontStyle="italic" fill="hsl(var(--foreground))" opacity="0.55">
        and again.
      </text>

      <g>
        <rect x="20" y="100" width="160" height="180" rx="12" ry="12" stroke="hsl(var(--navy))" strokeWidth="1.5" fill="hsl(var(--card))" />
        <text x="100" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="hsl(var(--foreground))" opacity="0.65">I.</text>
        <text x="100" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="700" fill="hsl(var(--foreground))">Dump</text>
        <line x1="60" y1="195" x2="140" y2="195" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x="100" y="218" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="hsl(var(--foreground))" opacity="0.78">
          <tspan x="100" dy="0">Everything you</tspan>
          <tspan x="100" dy="18">know about the</tspan>
          <tspan x="100" dy="18">problem, unfiltered.</tspan>
        </text>
      </g>

      <line x1="182" y1="190" x2="198" y2="190" stroke="hsl(var(--navy))" strokeWidth="1.5" />
      <polygon points="196,185 206,190 196,195" fill="hsl(var(--navy))" />

      <g>
        <rect x="200" y="100" width="160" height="180" rx="12" ry="12" stroke="hsl(var(--navy))" strokeWidth="1.5" fill="hsl(var(--card))" />
        <text x="280" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="hsl(var(--foreground))" opacity="0.65">II.</text>
        <text x="280" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="700" fill="hsl(var(--foreground))">ChatGPT</text>
        <line x1="240" y1="195" x2="320" y2="195" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x="280" y="218" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="hsl(var(--foreground))" opacity="0.78">
          <tspan x="280" dy="0">Compress and</tspan>
          <tspan x="280" dy="18">shape into a</tspan>
          <tspan x="280" dy="18">structured brief.</tspan>
        </text>
      </g>

      <line x1="362" y1="190" x2="378" y2="190" stroke="hsl(var(--navy))" strokeWidth="1.5" />
      <polygon points="376,185 386,190 376,195" fill="hsl(var(--navy))" />

      <g>
        <rect x="380" y="100" width="160" height="180" rx="12" ry="12" stroke="hsl(var(--navy))" strokeWidth="1.5" fill="hsl(var(--card))" />
        <text x="460" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="hsl(var(--foreground))" opacity="0.65">III.</text>
        <text x="460" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="700" fill="hsl(var(--foreground))">Claude</text>
        <line x1="420" y1="195" x2="500" y2="195" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x="460" y="218" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="hsl(var(--foreground))" opacity="0.78">
          <tspan x="460" dy="0">Run the brief, get</tspan>
          <tspan x="460" dy="18">the proper output.</tspan>
        </text>
      </g>

      <line x1="542" y1="190" x2="558" y2="190" stroke="hsl(var(--navy))" strokeWidth="1.5" />
      <polygon points="556,185 566,190 556,195" fill="hsl(var(--navy))" />

      <g>
        <rect x="560" y="100" width="160" height="180" rx="12" ry="12" stroke="hsl(var(--navy))" strokeWidth="1.5" fill="hsl(var(--card))" />
        <text x="640" y="135" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="14" fill="hsl(var(--foreground))" opacity="0.65">IV.</text>
        <text x="640" y="170" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="22" fontWeight="700" fill="hsl(var(--foreground))">Audit</text>
        <line x1="600" y1="195" x2="680" y2="195" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x="640" y="218" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fill="hsl(var(--foreground))" opacity="0.78">
          <tspan x="640" dy="0">Check it against</tspan>
          <tspan x="640" dy="18">what you actually</tspan>
          <tspan x="640" dy="18">asked for.</tspan>
        </text>
      </g>
    </svg>

    <p className="mt-4 text-[13px] italic text-foreground/55 leading-[1.55]">
      A four-step loop. Briefing method lives in steps II and III. Check before trust lives in step IV.
    </p>
  </div>
);
