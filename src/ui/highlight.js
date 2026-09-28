import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
import diff from 'highlight.js/lib/languages/diff';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import go from 'highlight.js/lib/languages/go';
import graphql from 'highlight.js/lib/languages/graphql';
import ini from 'highlight.js/lib/languages/ini';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import kotlin from 'highlight.js/lib/languages/kotlin';
import markdown from 'highlight.js/lib/languages/markdown';
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import python from 'highlight.js/lib/languages/python';
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
import scss from 'highlight.js/lib/languages/scss';
import shell from 'highlight.js/lib/languages/shell';
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

const LANGUAGES = {
  bash, c, cpp, csharp, css, dart, diff, dockerfile, go, graphql, ini, java, javascript, json, kotlin,
  markdown, php, plaintext, powershell, python, ruby, rust, scss, shell, sql, swift, typescript, xml, yaml,
};

for (const [name, language] of Object.entries(LANGUAGES)) hljs.registerLanguage(name, language);
hljs.registerAliases(['dotenv', 'env', 'properties'], { languageName: 'ini' });
hljs.registerAliases(['jsonc', 'json5'], { languageName: 'json' });
hljs.registerAliases(['vue', 'svelte'], { languageName: 'xml' });

const DIAGRAM_LANGUAGES = new Set(['mermaid', 'math', 'geojson', 'topojson', 'stl']);

export function highlightCode(root) {
  for (const code of root.querySelectorAll('pre > code[class*="language-"]')) {
    const language = [...code.classList].find((name) => name.startsWith('language-'))?.slice('language-'.length);
    if (!language || DIAGRAM_LANGUAGES.has(language) || !hljs.getLanguage(language)) continue;
    code.innerHTML = hljs.highlight(code.textContent, { language, ignoreIllegals: true }).value;
    code.classList.add('hljs');
  }
}
