# README Builder

Monte READMEs profissionais para seus projetos do GitHub, bloco por bloco, com preview fiel ao GitHub.



[version](https://github.com/gui1535/readme-generator/commits/main) [deploy](https://gui1535.github.io/readme-generator/) JavaScript [PRs](https://github.com/gui1535/readme-generator/pulls)





**[Abrir o app](https://gui1535.github.io/readme-generator/)** · [Reportar bug](https://github.com/gui1535/readme-generator/issues/new?labels=bug) · [Sugerir funcionalidade](https://github.com/gui1535/readme-generator/issues/new?labels=enhancement)





**Sumário**

1. [Sobre o projeto](#sobre-o-projeto)
  - [Construído com](#construído-com)
2. [Funcionalidades](#funcionalidades)
3. [Começando](#começando)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
4. [Uso](#uso)
  - [Scripts disponíveis](#scripts-disponíveis)
  - [Deploy](#deploy)
5. [Roadmap](#roadmap)
6. [Contribuindo](#contribuindo)
7. [Contato](#contato)
8. [Agradecimentos](#agradecimentos)



## Sobre o projeto

O **README Builder** é um editor visual para criar o `README.md` de repositórios do GitHub. Em vez de escrever Markdown na mão, você monta o documento com componentes (títulos, badges, imagens, tabelas, alertas, diagramas…), edita cada um num formulário e vê o resultado renderizado como o GitHub vai mostrar.

Tudo roda no navegador: não há servidor, conta nem banco de dados. O Markdown gerado é limpo, usa só o que o GitHub aceita e pode ser copiado ou baixado a qualquer momento.

### Construído com

JavaScript Vite Marked Mermaid KaTeX

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
2. Abra o bloco e preencha os campos; o preview à direita atualiza na hora.
3. Use **Importar** para começar a partir de um README existente.
4. Clique em **Verificar** para revisar a compatibilidade com o GitHub.
5. Use **Copiar** ou **Baixar** para levar o `README.md` para o seu repositório.



### Scripts disponíveis


| Comando           | Descrição                             |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento  |
| `npm run build`   | Gera a versão de produção em `dist/`  |
| `npm run preview` | Serve localmente a versão de produção |




### Deploy

Cada push na branch `main` publica o site no GitHub Pages pelo workflow `[deploy.yml](.github/workflows/deploy.yml)`. Em um fork, ative o Pages em **Settings → Pages → Source: GitHub Actions**.

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
2. Crie uma branch para a sua alteração (`git checkout -b feature/minha-feature`)
3. Faça commit das mudanças (`git commit -m 'feat: adiciona minha feature'`)
4. Envie a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request



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



Feito por [Guilherme](https://github.com/gui1535)

