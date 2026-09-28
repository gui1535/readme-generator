<div align="center">
  <a href="https://gui1535.github.io/readme-generator/"><img src="public/favicon.svg" alt="README Builder" width="96"></a>
  <h1>README Builder</h1>
  <p>Monte READMEs profissionais para seus projetos do GitHub, bloco por bloco, com preview fiel ao GitHub.</p>
</div>

<div align="center">

[![version](https://img.shields.io/badge/version-0.1.0-blue?style=flat)](https://github.com/gui1535/readme-generator/commits/main) [![deploy](https://img.shields.io/badge/deploy-GitHub_Pages-222222?style=flat&logo=github&logoColor=white)](https://gui1535.github.io/readme-generator/) ![JavaScript](https://img.shields.io/badge/JavaScript-puro-F7DF1E?style=flat&logo=javascript&logoColor=black) [![PRs](https://img.shields.io/badge/PRs-welcome-orange?style=flat)](https://github.com/gui1535/readme-generator/pulls)

</div>

<div align="center">

[**Abrir o app**](https://gui1535.github.io/readme-generator/) · [Reportar bug](https://github.com/gui1535/readme-generator/issues/new?labels=bug) · [Sugerir funcionalidade](https://github.com/gui1535/readme-generator/issues/new?labels=enhancement)

</div>

<p align="center">
  <img src="docs/screenshot.png" alt="Tela do README Builder com a biblioteca de componentes, o editor de blocos e o preview" width="800">
</p>

<details>
<summary><b>Sumário</b></summary>

1. [Sobre o projeto](#sobre-o-projeto)
   - [Construído com](#construído-com)
1. [Funcionalidades](#funcionalidades)
1. [Começando](#começando)
   - [Pré-requisitos](#pré-requisitos)
   - [Instalação](#instalação)
1. [Uso](#uso)
   - [Scripts disponíveis](#scripts-disponíveis)
   - [Deploy](#deploy)
1. [Roadmap](#roadmap)
1. [Contribuindo](#contribuindo)
1. [Contato](#contato)
1. [Agradecimentos](#agradecimentos)

</details>

## Sobre o projeto

O **README Builder** é um editor visual para criar o `README.md` de repositórios do GitHub. Em vez de escrever Markdown na mão, você monta o documento com componentes (títulos, badges, imagens, tabelas, alertas, diagramas…), edita cada um num formulário e vê o resultado renderizado como o GitHub vai mostrar.

Tudo roda no navegador: não há servidor, conta nem banco de dados. O Markdown gerado é limpo, usa só o que o GitHub aceita e pode ser copiado ou baixado a qualquer momento.

### Construído com

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Marked](https://img.shields.io/badge/Marked-000000?style=for-the-badge&logo=markdown&logoColor=white) ![Mermaid](https://img.shields.io/badge/Mermaid-FF3670?style=for-the-badge&logo=mermaid&logoColor=white) ![KaTeX](https://img.shields.io/badge/KaTeX-008080?style=for-the-badge&logo=latex&logoColor=white)

## Funcionalidades

- **Editor por blocos**: adicione componentes pela biblioteca, reordene arrastando, duplique, oculte ou recolha.
- **Preview fiel ao GitHub**: mesmo CSS, mesmas regras de HTML permitido, âncoras iguais e temas claro e escuro.
- **Recursos do GitHub renderizados**: alertas, notas de rodapé, emojis `:shortcode:`, destaque de sintaxe, diagramas Mermaid e fórmulas matemáticas.
- **Componentes prontos**: Hero, badges do Shields.io, imagem por tema, sumário automático, checklist, tabela, accordion, terminal e mais.
- **Importação sem perdas**: cole um README, envie um arquivo ou informe um repositório do GitHub; o que não vira componente é mantido como Markdown livre.
- **Verificação antes de exportar**: aponta links internos quebrados, HTML que o GitHub remove, imagens sem texto alternativo e pulos de nível nos títulos.
- **Barra de formatação**: negrito, itálico, código, links, teclas, emojis e notas de rodapé sem precisar saber Markdown.

## Começando

Para usar, basta abrir o [app publicado](https://gui1535.github.io/readme-generator/). Para rodar uma cópia na sua máquina, siga os passos abaixo.

### Pré-requisitos

- [Node.js](https://nodejs.org) 20.19+ ou 22.12+
- npm 10 ou superior

### Instalação

```bash
git clone https://github.com/gui1535/readme-generator.git
cd readme-generator
npm install
npm run dev
```

> [!NOTE]
> O servidor de desenvolvimento abre em `http://localhost:5173`. O app não salva o projeto: ao recarregar a página, ele volta ao README de exemplo.

## Uso

1. Clique em um componente na barra lateral (ou arraste-o) para adicioná-lo à estrutura.
1. Abra o bloco e preencha os campos; o preview à direita atualiza na hora.
1. Use **Importar** para começar a partir de um README existente.
1. Clique em **Verificar** para revisar a compatibilidade com o GitHub.
1. Use **Copiar** ou **Baixar** para levar o `README.md` para o seu repositório.

### Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão de produção |

### Deploy

Cada push na branch `main` publica o site no GitHub Pages pelo workflow [`deploy.yml`](.github/workflows/deploy.yml). Em um fork, ative o Pages em **Settings → Pages → Source: GitHub Actions**.

## Roadmap

- [x] Editor por blocos com preview fiel ao GitHub
- [x] Importação de README (texto, arquivo ou repositório)
- [x] Mermaid, matemática, emojis e destaque de sintaxe no preview
- [x] Verificação de compatibilidade com o GitHub
- [ ] Desfazer e refazer
- [ ] Biblioteca de seções prontas
- [ ] Badges dinâmicos (stars, versão do npm, CI)
- [ ] Dados do repositório preenchidos automaticamente

Veja as [issues abertas](https://github.com/gui1535/readme-generator/issues) para a lista completa de propostas e problemas conhecidos.

## Contribuindo

Contribuições são o que fazem a comunidade open source incrível. Qualquer ajuda é **muito bem-vinda**.

1. Faça um fork do projeto
1. Crie uma branch para a sua alteração (`git checkout -b feature/minha-feature`)
1. Faça commit das mudanças (`git commit -m 'feat: adiciona minha feature'`)
1. Envie a branch (`git push origin feature/minha-feature`)
1. Abra um Pull Request

## Contato

Guilherme · [@gui1535](https://github.com/gui1535)

Link do projeto: [https://github.com/gui1535/readme-generator](https://github.com/gui1535/readme-generator)

## Agradecimentos

- [Shields.io](https://shields.io)
- [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)
- [Marked](https://marked.js.org)
- [Mermaid](https://mermaid.js.org)
- [KaTeX](https://katex.org)
- [highlight.js](https://highlightjs.org)
- [Octicons](https://primer.style/octicons)
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

---

<div align="center">

Feito com ❤️ por [Guilherme](https://github.com/gui1535)

</div>
