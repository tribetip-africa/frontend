const CREATORS = [
  {
    name: "Ama Creates",
    handle: "ama_creates",
    role: "Writer · Lagos",
    flag: "🇳🇬",
    raised: "₦840K+",
    emoji: "✍️",
  },
  {
    name: "Kenya Beats",
    handle: "kenya_beats",
    role: "Producer · Nairobi",
    flag: "🇰🇪",
    raised: "KSh 120K+",
    emoji: "🎵",
  },
  {
    name: "Accra Sketches",
    handle: "accra_sketches",
    role: "Illustrator · Accra",
    flag: "🇬🇭",
    raised: "GH₵ 18K+",
    emoji: "🎨",
  },
  {
    name: "Joburg Dev",
    handle: "joburg_dev",
    role: "Educator · Johannesburg",
    flag: "🇿🇦",
    raised: "R 42K+",
    emoji: "💻",
  },
];

export function CreatorShowcase() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-bold text-brand-600">Creators on TribeTip</p>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Join thousands earning from their audience
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink-soft">
            Podcasters, artists, educators, and developers — all with one simple tip link.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CREATORS.map((creator) => (
            <li
              key={creator.handle}
              className="surface-card rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-2xl">
                {creator.emoji}
              </div>
              <p className="mt-4 font-bold text-ink">{creator.name}</p>
              <p className="text-sm text-muted">{creator.role}</p>
              <p className="mt-3 text-xs font-semibold text-brand-600">
                {creator.flag} @{creator.handle}
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{creator.raised} raised</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
