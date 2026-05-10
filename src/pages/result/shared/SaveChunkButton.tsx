interface SaveButtonProps {
  saved: boolean;
  onClick: () => void;
}

export const SaveChunkButton = ({ saved, onClick }: SaveButtonProps) => (
  <button
    type="button"
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    aria-label={saved ? "Unsave this chunk" : "Save this chunk"}
    aria-pressed={saved}
    className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-transparent hover:bg-navy-light/30 transition-colors duration-150 ${saved ? "text-navy" : "text-navy/40 hover:text-navy"}`}
  >
    {saved ? (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13l-5-3-5 3V2z" />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13l-5-3-5 3V2z" />
      </svg>
    )}
  </button>
);
