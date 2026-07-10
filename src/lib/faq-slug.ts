export function faqItemAnchorId(categoryId: string, question: string): string {
  const slug = question
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${categoryId}-${slug}`;
}

export function faqItemUrl(categoryId: string, question: string): string {
  return `/faq#${faqItemAnchorId(categoryId, question)}`;
}
