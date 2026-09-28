# O que falta no README Builder

## Visão geral

O suporte atual já cobre praticamente toda a base importante de GitHub Flavored Markdown e uma boa parte do HTML aceito pelo GitHub.

O próximo passo não deveria ser simplesmente adicionar mais sintaxes raras. O foco deve ser transformar recursos que hoje dependem de **Markdown livre** em componentes visuais e melhorar a fidelidade do preview.

## Status da implementação

Legenda: ✅ feito · 🟡 parcial · ⬜ pendente

| # | Item | Status | Onde está |
| --- | --- | --- | --- |
| 1 | Syntax highlighting | ✅ | Preview (highlight.js, ~30 linguagens, cores claras e escuras do GitHub) |
| 2 | Preview de Mermaid | ✅ | Componente **Diagrama (Mermaid)** com modelos dos 10 tipos; renderizado no preview |
| 3 | Preview de matemática | ✅ | `$...$`, `$$...$$` e ` ```math ` com KaTeX |
| 4 | Emoji shortcodes | ✅ | `:rocket:` vira 🚀 no preview; seletor de emoji na toolbar |
| 5 | Picture / Theme Image | ✅ | Componente **Imagem por tema**; o preview troca a imagem com o tema |
| 6 | Footnote Builder | ✅ | Componente **Notas de rodapé** + botão **Nota** na toolbar |
| 7 | Reference Link Manager | ✅ | Componente **Links de referência**; o botão **Link** aceita o ID |
| 8 | HTML Table avançada | ⬜ | |
| 9 | Definition List | ⬜ | |
| 10 | Figure + Figcaption | ⬜ | |
| 11 | Abbreviation | ⬜ | |
| 12 | Toolbar de formatação inline | ✅ | Todos os campos de texto Markdown; atalhos Ctrl+B, I, K, E |
| 13 | Slash Commands | ⬜ | |
| 14 | Validador de compatibilidade | ✅ | Botão **Verificar** (com contador) e checagem antes de baixar |
| 15 | Compatibility Badge por componente | ⬜ | |
| 16 | Sanitization Preview | ✅ | O preview sempre aplica as regras do GitHub (não há modo "Builder") |
| 17 | Accessibility Check | 🟡 | Alt de imagens, links vagos e hierarquia de títulos; falta tabelas e excesso de emojis |
| 18 | Broken Link Checker | 🟡 | Âncoras internas e referências verificadas; URLs externas não (bloqueio de CORS) |
| 19 | Anchor Preview | ✅ | Âncora exibida no card do título (com `-1`, `-2`), clique copia o link |
| 20 | TOC inteligente | ✅ | Componente **Sumário**: H2/H3/H4, ignorar, numerado ou lista, recolhível |
| 21–36 | | ⬜ | |
| 37 | Duplicate Section | ✅ | Botão duplicar em todos os blocos |
| 38–46 | | ⬜ | |

---

# PRIORIDADE 1 — Preview realmente próximo do GitHub

## 1. Syntax Highlighting nos blocos de código

Hoje o Code Block funciona, mas o preview não mostra as cores de sintaxe.

Adicionar highlighting para linguagens como:

- JavaScript
- TypeScript
- TSX / JSX
- Python
- PHP
- Java
- Kotlin
- Swift
- Go
- Rust
- C / C++ / C#
- Bash / Shell
- PowerShell
- SQL
- JSON
- YAML
- Dockerfile
- Markdown
- Diff

Objetivo:

> O bloco visualizado no builder deve ficar muito próximo do bloco exibido pelo GitHub.

---

## 2. Preview de Mermaid

Hoje `mermaid` é preservado como Code Block, mas aparece apenas como código no preview.

Adicionar renderização real de:

- Flowchart
- Sequence Diagram
- Class Diagram
- State Diagram
- ER Diagram
- Gantt
- Pie
- Git Graph
- Mindmap
- Timeline

Adicionar opção no componente:

```text
Mermaid

[ Code ] [ Diagram ]
```

Assim o usuário pode editar o código e visualizar o resultado.

---

## 3. Preview de matemática

Renderizar expressões matemáticas em vez de mostrar apenas LaTeX.

Suportar:

````text
$...$
$$...$$
```math
...
```
````

Usar KaTeX ou MathJax no preview.

---

## 4. Emoji shortcodes

Hoje emojis Unicode funcionam, mas códigos como:

```text
:rocket:
:tada:
:bug:
:sparkles:
```

não são convertidos no preview.

Adicionar parser de shortcodes para aproximar o comportamento do GitHub.

---

# PRIORIDADE 2 — Componentes que ainda dependem de Markdown livre

## 5. Picture / Theme Image

Criar componente próprio para imagens diferentes em dark/light mode.

Interface:

```text
Theme Image

Light image: [ ... ]
Dark image:  [ ... ]
Alt:         [ ... ]
Width:       [ ... ]
Alignment:   [ center ]
```

Gerar automaticamente `<picture>` + `<source>`.

Isso é especialmente útil para logos, screenshots e diagramas que precisam funcionar nos dois temas do GitHub.

---

## 6. Footnote Builder

Hoje referências e definições de notas ficam divididas entre texto e Markdown livre.

Criar componente:

```text
Footnote

ID: 1
Text: Explicação da informação.
```

E permitir inserir uma referência pelo editor inline:

```text
Insert Footnote → [1]
```

O generator organiza automaticamente as definições no README.

---

## 7. Reference Link Manager

Criar gerenciamento de links reutilizáveis.

Exemplo:

```text
References

ID       URL

docs     https://...
website  https://...
api      https://...
```

Depois o usuário poderia inserir:

```text
[Documentação][docs]
```

sem precisar escrever a definição manualmente.

---

## 8. HTML Table avançada

A tabela Markdown atende a maioria dos casos, mas não suporta coisas como `rowspan` e `colspan`.

Criar um modo avançado:

```text
Table

○ Markdown
● Advanced HTML
```

No modo avançado permitir:

- colspan
- rowspan
- caption
- alinhamento
- header
- footer

---

## 9. Definition List

Adicionar suporte visual para:

```html
<dl>
  <dt>React</dt>
  <dd>Biblioteca utilizada no frontend.</dd>
</dl>
```

Componente:

```text
Definition List

React
→ Biblioteca frontend

Firebase
→ Backend do projeto
```

---

## 10. Figure + Figcaption

Criar componente para imagem com legenda sem o usuário precisar montar HTML.

```text
Figure

Image
Caption
Alt
Width
Alignment
```

Gerar `<figure>` / `<figcaption>` quando apropriado.

---

## 11. Abbreviation

Adicionar opção inline para `<abbr>`.

Exemplo:

```html
<abbr title="Application Programming Interface">API</abbr>
```

Interface:

```text
Abbreviation

Text: API
Meaning: Application Programming Interface
```

---

# PRIORIDADE 3 — Recursos que tornam o gerador realmente melhor

## 12. Toolbar de formatação inline

Não obrigar o usuário a saber Markdown para escrever dentro de parágrafos.

Adicionar toolbar:

```text
B  I  S  <>  Link  KBD  Sub  Sup  Emoji
```

Selecionou um texto → clicou em Bold → o builder gera `**texto**`.

Isso também deve funcionar em:

- Paragraph
- Lists
- Tables
- Alerts
- Quotes
- Accordions
- Checklists

---

## 13. Slash Commands

Dentro do editor:

```text
/
```

Abrir menu:

```text
/heading
/text
/image
/badge
/code
/table
/alert
/mermaid
/features
/install
/roadmap
```

Isso deixa o builder muito mais rápido.

---

## 14. Validador de compatibilidade com GitHub

Esse pode ser um dos melhores diferenciais do projeto.

Antes de exportar, analisar o README e mostrar problemas.

Exemplo:

```text
README Check

✓ Markdown válido
✓ Images possuem alt
✓ Links válidos
✓ Headings válidos
✓ Table of Contents sincronizado

⚠ atributo style não funciona no GitHub
⚠ imagem sem alt text
⚠ link relativo pode estar quebrado
⚠ heading duplicado gera âncora -1
```

---

## 15. GitHub Compatibility Badge no editor

Cada componente pode mostrar:

```text
GitHub Compatible ✓
```

ou:

```text
Partial Support ⚠
```

Ao passar o mouse, explicar a limitação.

---

## 16. Sanitization Preview

O preview atual pode aceitar atributos que o GitHub posteriormente remove.

Criar dois modos:

```text
Preview

○ Builder
● GitHub Safe
```

`GitHub Safe` remove/sinaliza elementos e atributos que não sobreviveriam à sanitização do GitHub.

Isso evita o pior cenário do produto: o README parecer correto no builder e diferente depois do commit.

---

## 17. Accessibility Check

Analisar automaticamente:

- imagens sem `alt`
- links com textos ruins como "clique aqui"
- hierarquia incorreta de headings
- tabelas sem cabeçalhos
- excesso de emojis decorativos

Mostrar sugestões antes da exportação.

---

## 18. Broken Link Checker

Quando possível, verificar URLs externas.

Mostrar:

```text
Links

✓ Documentation
✓ Website
✕ Demo
⚠ Screenshot URL
```

Também verificar referências internas como:

```text
#installation
#getting-started
```

contra os headings existentes.

---

## 19. Anchor Preview

Ao criar um heading, mostrar sua âncora automaticamente.

Exemplo:

```text
Heading

Como começar

Anchor:
#como-começar
```

Para headings repetidos:

```text
#installation
#installation-1
#installation-2
```

---

## 20. Table of Contents inteligente

O TOC deve ser um componente real, não apenas texto gerado uma vez.

Configurações:

```text
Table of Contents

Include H2 ✓
Include H3 ✓
Include H4 ☐

Ignore:
[ License ]
```

Ao mover ou renomear headings, atualizar automaticamente.

---

# PRIORIDADE 4 — Componentes prontos para READMEs profissionais

## 21. Repository Header / Hero completo

Evoluir o Hero para permitir:

```text
Logo
Project Name
Tagline
Badges
Links
```

Exemplo visual:

```text
             [LOGO]

           Project Name

     Build something amazing.

 [npm] [license] [build] [stars]

 Documentation · Demo · Report Bug
```

---

## 22. Quick Links

Componente para criar grupos de links:

```text
Documentation · Demo · API · Issues
```

Com alinhamento configurável.

---

## 23. Installation Wizard

O componente Installation pode ser mais inteligente.

Usuário escolhe:

```text
Package Manager

npm
yarn
pnpm
bun
composer
pip
cargo
go
```

E etapas:

```text
Clone
Install
Configure
Run
Build
Test
```

O README é gerado automaticamente.

---

## 24. Multi-package-manager Tabs simuladas

GitHub README não possui tabs reais, mas o builder pode gerar alternativas organizadas para múltiplos gerenciadores.

Exemplo:

```text
npm
npm install

yarn
yarn install

pnpm
pnpm install
```

Oferecer layouts diferentes para isso.

---

## 25. Environment Variables Builder

Criar tabela visual:

```text
Name          Required   Default   Description
DATABASE_URL  Yes        —         Database URL
PORT          No         3000      Server port
```

E opcionalmente gerar também:

```env
DATABASE_URL=
PORT=3000
```

---

## 26. Project Tree Builder

Criar árvore de arquivos visualmente:

```text
src
├── components
├── pages
├── services
└── app.tsx
```

Permitir:

```text
+ File
+ Folder
Rename
Move
Delete
```

Gerar automaticamente o bloco de texto.

---

## 27. API Endpoint Builder

Componente especializado:

```text
GET /users/:id

Description
Parameters
Headers
Request
Response
```

Com suporte visual aos métodos:

```text
GET
POST
PUT
PATCH
DELETE
```

---

## 28. Changelog / Releases

Componente para READMEs que mostram releases recentes.

```text
v2.0.0

Added
Changed
Fixed
```

---

## 29. Contributing Section Builder

Gerar automaticamente uma seção de contribuição com opções como:

```text
Fork repository
Create branch
Commit changes
Push branch
Open Pull Request
```

---

## 30. Support / Contact Builder

Permitir adicionar:

- GitHub Issues
- Discussions
- Discord
- Website
- Documentation
- Email

sem escrever os links manualmente.

---

# PRIORIDADE 5 — GitHub Integration

## 31. Dados dinâmicos do repositório

Ao conectar um repositório, preencher automaticamente:

- nome
- descrição
- homepage
- topics
- linguagem principal
- licença
- stars
- forks
- issues
- releases

Esses dados podem alimentar componentes do README.

---

## 32. Badge Builder dinâmico

O suporte atual reconhece bem badges estáticos, mas badges dinâmicos merecem componente próprio.

Categorias:

```text
GitHub Stars
GitHub Forks
GitHub Issues
GitHub License
GitHub Release
GitHub Last Commit
GitHub Actions
npm Version
npm Downloads
Docker Pulls
Coverage
```

O usuário não deveria precisar conhecer a URL do Shields.io.

---

## 33. GitHub Actions Badge

Selecionar workflow:

```text
CI
Tests
Build
Deploy
```

Gerar o badge correspondente automaticamente.

---

## 34. Repository File Picker

Para links e imagens relativos, permitir selecionar arquivos do próprio repositório.

Exemplo:

```text
Choose image

/docs/logo.png
/docs/demo.gif
/assets/banner.png
```

Evita erros digitando caminhos manualmente.

---

# PRIORIDADE 6 — Qualidade de edição

## 35. Raw Markdown sincronizado

Ter modo:

```text
Visual | Raw | Split
```

Alterações feitas no Raw devem atualizar os blocos quando a sintaxe puder ser reconhecida.

Quando não puder:

```text
Custom Markdown Block
```

Nunca descartar conteúdo.

---

## 36. Undo / Redo completo

Suportar histórico para:

- texto
- adicionar bloco
- excluir bloco
- mover bloco
- alterar propriedades
- importar README

Atalhos:

```text
Ctrl + Z
Ctrl + Shift + Z
```

---

## 37. Duplicate Section

Qualquer bloco deve ter:

```text
Duplicate
```

Especialmente útil para:

- screenshots
- API endpoints
- FAQ
- feature groups
- installation steps

---

## 38. Multi-select

Selecionar vários componentes para:

```text
Move
Delete
Duplicate
Group
```

---

## 39. Component Groups

Permitir agrupar blocos:

```text
Installation

  Paragraph
  Terminal
  Alert
```

O grupo pode ser movido como uma única unidade.

---

## 40. Search / Command Palette

`Ctrl + K` deve permitir pesquisar tanto ações quanto componentes.

Exemplo:

```text
> table

Add Table
Add Table of Contents
Open Table settings
```

---

# PRIORIDADE 7 — Templates e biblioteca

## 41. Section Templates

Não oferecer apenas README completo.

Criar biblioteca de seções:

```text
Heroes
Tech Stacks
Installations
Feature Lists
Roadmaps
Screenshots
Contributors
Footers
```

Usuário escolhe uma seção e adiciona ao README atual.

---

## 42. Variantes de componentes

Exemplo para Tech Stack:

```text
Badges
Icons
Table
Simple List
Centered
```

Para Features:

```text
Simple
Emoji
Table
Checklist
Detailed
```

Isso aumenta muito a variedade visual sem precisar criar novos tipos de Markdown.

---

## 43. Template Variables

Templates devem possuir campos substituíveis:

```text
{{PROJECT_NAME}}
{{DESCRIPTION}}
{{REPOSITORY}}
{{AUTHOR}}
{{LICENSE}}
```

Ao selecionar um template, abrir um formulário rápido para preencher tudo.

---

# PRIORIDADE 8 — Recursos avançados

## 44. GeoJSON Preview

Se quiser fidelidade máxima ao GitHub, futuramente renderizar `geojson` em mapa no preview.

Prioridade menor que Mermaid.

---

## 45. TopoJSON Preview

Mesmo conceito do GeoJSON.

Baixa prioridade para o MVP.

---

## 46. STL Preview

Visualização 3D de blocos `stl`.

É um recurso interessante, mas de nicho. Deve ficar para uma versão avançada.

---

# O que NÃO precisa virar componente próprio

Algumas sintaxes já estão suficientemente bem atendidas como formatação inline ou Markdown livre.

Não é necessário criar blocos separados para cada uma:

```text
Bold
Italic
Strikethrough
Inline code
Subscript
Superscript
Underline
Mark
Small
Escape characters
HTML comments
```

Melhor solução: oferecer tudo isso na toolbar inline.

---

# Ordem recomendada de implementação

## Agora ✅ concluído

1. ✅ Syntax highlighting
2. ✅ Mermaid Preview
3. ✅ Math Preview
4. ✅ Emoji shortcodes
5. ✅ Theme Image / Picture component
6. ✅ Footnote Builder
7. ✅ Reference Link Manager
8. ✅ Toolbar inline
9. ✅ TOC inteligente
10. ✅ GitHub Compatibility Checker
11. ✅ GitHub Safe Preview
12. ✅ Anchor Preview

## Depois

13. Environment Variables
14. Project Tree
15. API Endpoint Builder
16. Dynamic Badge Builder
17. Repository integration
18. Repository File Picker
19. Section Templates
20. Template Variables
21. 🟡 Accessibility Check (parte já está no verificador)
22. 🟡 Broken Link Checker (links internos já verificados)

## Futuro

23. GeoJSON Preview
24. TopoJSON Preview
25. STL Preview
26. Template Marketplace
27. Community Components

---

# Principal diferencial recomendado

Não tente competir apenas como **"mais um gerador de README"**.

A direção mais forte é transformar o projeto em:

```text
GitHub README Studio

Visual Builder
+
Component Library
+
GitHub-accurate Preview
+
Compatibility Checker
+
Templates
+
Repository Integration
```

O recurso mais interessante seria o usuário montar qualquer README visualmente e o sistema garantir:

```text
✓ Funciona no GitHub
✓ Preview fiel
✓ Markdown limpo
✓ Sem HTML inválido
✓ Links internos corretos
✓ Imagens configuradas corretamente
✓ README responsivo aos temas dark/light quando possível
```

Isso diferencia bastante o produto de um gerador que apenas faz perguntas e cospe um template pronto.

---

# Resumo

O suporte de sintaxe atual já é suficiente para um MVP forte.

O que mais falta agora não é quantidade de Markdown. É transformar os casos avançados em uma experiência visual melhor e garantir que o que aparece no builder seja realmente o que aparecerá no GitHub.

A prioridade deve ser:

```text
Fidelidade do Preview
        ↓
Componentes visuais avançados
        ↓
Validação GitHub
        ↓
Integração com repositórios
        ↓
Biblioteca de templates/componentes
```