// Section eyebrow: an 8px Vermilion square + a graphite mono label.
export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-graphite ${className}`}>
      <span aria-hidden className="inline-block size-2 shrink-0 bg-vermilion" />
      {children}
    </p>
  );
}
