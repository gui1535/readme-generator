const REPO_PATTERN = /^(?:https?:\/\/)?(?:www\.)?(?:github\.com\/)?([\w.-]+)\/([\w.-]+)/i;

export function parseRepository(input) {
  const match = input.trim().match(REPO_PATTERN);
  if (!match) return null;
  return { owner: match[1], name: match[2].replace(/\.git$/i, '') };
}

function decodeBase64Utf8(content) {
  const binary = atob(content.replace(/\s/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

/**
 * Fetches the README of a public repository through the GitHub API
 * (60 unauthenticated requests per hour per IP).
 *
 * `assetBase` lets the preview resolve relative image paths:
 * `root` for paths starting with "/", `dir` for paths relative to the README.
 */
export async function fetchGithubReadme(input) {
  const repository = parseRepository(input);
  if (!repository) throw new Error('Informe no formato usuario/repositorio ou cole a URL do GitHub.');

  const response = await fetch(`https://api.github.com/repos/${repository.owner}/${repository.name}/readme`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (response.status === 404) throw new Error('Repositório público ou README não encontrado.');
  if (response.status === 403 || response.status === 429) {
    throw new Error('Limite de requisições da API do GitHub atingido. Tente novamente mais tarde.');
  }
  if (!response.ok) throw new Error(`O GitHub respondeu com erro ${response.status}.`);

  const payload = await response.json();
  const downloadUrl = payload.download_url;
  const assetBase = downloadUrl
    ? {
        root: `${downloadUrl.split('/').slice(0, 6).join('/')}/`,
        dir: downloadUrl.slice(0, downloadUrl.lastIndexOf('/') + 1),
      }
    : null;

  return { markdown: decodeBase64Utf8(payload.content), assetBase, repository };
}
