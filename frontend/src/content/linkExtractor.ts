export function extractLinks(): string[] {
  const links = Array.from(document.querySelectorAll("a"));

  return links
    .map(link => link.href)
    .filter(Boolean);
}
