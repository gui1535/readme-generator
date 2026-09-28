/**
 * HTML that survives GitHub's sanitization in Markdown files.
 * Used by the preview (to look like GitHub) and by the README check
 * (to warn about what GitHub will remove).
 */
export const GITHUB_TAGS = new Set([
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'div', 'span', 'br', 'hr', 'wbr',
  'b', 'strong', 'i', 'em', 'ins', 'del', 's', 'strike', 'sub', 'sup', 'mark', 'small',
  'abbr', 'bdo', 'cite', 'dfn', 'q', 'samp', 'var', 'tt', 'kbd', 'code', 'pre', 'time',
  'a', 'img', 'picture', 'source',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'blockquote', 'details', 'summary', 'figure', 'figcaption', 'ruby', 'rt', 'rp',
]);

export const GITHUB_ATTRIBUTES = new Set([
  'abbr', 'align', 'alt', 'aria-describedby', 'aria-hidden', 'aria-label', 'aria-labelledby',
  'border', 'cellpadding', 'cellspacing', 'cite', 'clear', 'color', 'cols', 'colspan', 'compact',
  'datetime', 'dir', 'headers', 'height', 'href', 'hreflang', 'hspace', 'id', 'itemprop', 'lang',
  'media', 'name', 'nowrap', 'open', 'rel', 'rev', 'role', 'rows', 'rowspan', 'rules', 'scope',
  'span', 'src', 'srcset', 'start', 'summary', 'tabindex', 'title', 'type', 'valign', 'vspace', 'width',
]);
