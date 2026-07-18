export function extractEmailData() {
  return {
    title: document.title,
    bodyText: document.body.innerText,
    links: Array.from(document.querySelectorAll("a")).map(
      link => link.href
    )
  };
}
