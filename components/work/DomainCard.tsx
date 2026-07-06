type Domain = {
  slug: string;
  name: string;
  summary: string;
  keywords: string[];
};

export function DomainCard({ domain, index }: { domain: Domain; index: number }) {
  return (
    <div className="border-t border-border py-8 first:border-t-0 md:grid md:grid-cols-[80px_1fr] md:gap-8">
      <span className="font-mono text-xs text-text-faint">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div>
        <h3 className="font-display text-2xl text-text">{domain.name}</h3>
        <p className="mt-2 max-w-xl text-text-muted">{domain.summary}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {domain.keywords.map((kw) => (
            <li
              key={kw}
              className="rounded-full border border-border px-3 py-1 font-mono text-[11px] text-text-faint"
            >
              {kw}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
