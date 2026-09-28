/**
 * GitHub only renders Markdown inside an HTML block when it is
 * surrounded by blank lines.
 */
export function alignWrap(content, align) {
  if (!align || align === 'left') return content;
  return `<div align="${align}">\n\n${content}\n\n</div>`;
}

export function fence(code, language = '') {
  const longestRun = Math.max(2, ...(code.match(/`+/g) ?? []).map((run) => run.length));
  const ticks = '`'.repeat(longestRun + 1);
  return `${ticks}${language}\n${code}\n${ticks}`;
}

export function prefixLines(text, prefix) {
  return text
    .split('\n')
    .map((line) => (line ? `${prefix}${line}` : prefix.trimEnd()))
    .join('\n');
}
