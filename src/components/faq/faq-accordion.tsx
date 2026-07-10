import type { FaqItem } from "@/lib/faq-content";
import { faqItemAnchorId } from "@/lib/faq-slug";

type FaqAccordionProps = {
  categoryId: string;
  items: FaqItem[];
  /**
   * Shared name that turns the items into an exclusive accordion — opening one
   * closes the rest. Must be unique per accordion group on the page.
   */
  name: string;
};

export function FaqAccordion({ categoryId, items, name }: FaqAccordionProps) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white">
      {items.map((item) => (
        <details
          key={item.question}
          id={faqItemAnchorId(categoryId, item.question)}
          name={name}
          className="group scroll-mt-24"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left font-semibold text-ink transition-colors hover:bg-sand sm:px-6">
            <span>{item.question}</span>
            <span
              aria-hidden
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-soft transition-transform duration-200 group-open:rotate-45 group-open:border-brand-200 group-open:bg-brand-50 group-open:text-brand-600"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M7 1v12M1 7h12" />
              </svg>
            </span>
          </summary>
          <div className="px-5 pb-5 text-ink-soft sm:px-6">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
