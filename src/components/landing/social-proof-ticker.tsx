const ITEMS = [
  "KSh 2,000 tipped to @kenya_creator",
  "₦5,000 to @lagos_podcast",
  "GH₵ 50 to @accra_beats",
  "KSh 500 to @ama_creates",
  "R 200 to @joburg_dev",
  "KSh 10,000 to @nairobi_art",
  "₦1,000 to @abuja_writes",
];

export function SocialProofTicker() {
  const doubled = [...ITEMS, ...ITEMS];

  return (
    <div className="overflow-hidden border-y border-brand-900/10 bg-ink py-3">
      <div className="flex animate-ticker whitespace-nowrap">
        {doubled.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="mx-6 inline-flex items-center gap-2 text-sm text-white/80"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
