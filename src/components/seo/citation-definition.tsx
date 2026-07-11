type CitationDefinitionProps = {
  children: React.ReactNode;
  className?: string;
};

export function CitationDefinition({ children, className = "" }: CitationDefinitionProps) {
  return (
    <section
      aria-label="About TribeTip"
      className={`border-y border-line bg-brand-50/60 ${className}`.trim()}
    >
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <p className="text-base leading-relaxed text-ink-soft sm:text-lg">{children}</p>
      </div>
    </section>
  );
}
