/** Same rules GitHub uses to build heading anchors (github-slugger). */
export function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-');
}

/** Repeated headings get "-1", "-2"… in document order, like on GitHub. */
export function createSlugger() {
  const used = new Map();
  return (text) => {
    const base = slugify(text);
    const count = used.get(base) ?? 0;
    used.set(base, count + 1);
    return count ? `${base}-${count}` : base;
  };
}
