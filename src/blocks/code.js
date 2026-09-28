import { fence } from '../markdown/helpers.js';
import { CODE_LANGUAGES } from './options.js';

export const code = {
  type: 'code',
  label: 'Code Block',
  category: 'Código',
  description: 'Bloco de código com destaque de sintaxe.',
  defaults: () => ({ language: 'javascript', code: "console.log('Hello, world!');" }),
  summary: (data) => data.language,
  fields: [
    { key: 'language', label: 'Linguagem', type: 'text', suggestions: CODE_LANGUAGES },
    { key: 'code', label: 'Código', type: 'textarea', rows: 8, monospace: true },
  ],
  toMarkdown: ({ language, code: source }) => (source.trim() ? fence(source.replace(/\s+$/, ''), language.trim()) : ''),
};

export const terminal = {
  type: 'terminal',
  label: 'Terminal',
  category: 'Código',
  description: 'Sequência de comandos de terminal, um por linha.',
  defaults: () => ({
    commands: [
      { command: 'git clone https://github.com/usuario/projeto.git' },
      { command: 'cd projeto' },
      { command: 'npm install' },
      { command: 'npm run dev' },
    ],
  }),
  summary: (data) => `${data.commands.length} comando(s)`,
  fields: [
    {
      key: 'commands',
      label: 'Comandos',
      type: 'repeater',
      itemName: 'Comando',
      addLabel: '+ Comando',
      newItem: () => ({ command: '' }),
      fields: [{ key: 'command', label: 'Comando', type: 'text', monospace: true }],
    },
  ],
  toMarkdown({ commands }) {
    const lines = commands.map((item) => item.command.trim()).filter(Boolean);
    return lines.length ? fence(lines.join('\n'), 'bash') : '';
  },
};

const MERMAID_PRESETS = [
  {
    value: 'flowchart',
    label: 'Fluxograma',
    code: `flowchart LR
  A[Usuário] --> B{Autenticado?}
  B -->|Sim| C[Dashboard]
  B -->|Não| D[Login]`,
  },
  {
    value: 'sequence',
    label: 'Sequência',
    code: `sequenceDiagram
  participant U as Usuário
  participant A as API
  participant D as Banco
  U->>A: POST /login
  A->>D: Busca usuário
  D-->>A: Dados
  A-->>U: Token JWT`,
  },
  {
    value: 'class',
    label: 'Classes',
    code: `classDiagram
  class Usuario {
    +String nome
    +String email
    +login() bool
  }
  class Pedido {
    +int id
    +total() float
  }
  Usuario "1" --> "*" Pedido : faz`,
  },
  {
    value: 'state',
    label: 'Estados',
    code: `stateDiagram-v2
  [*] --> Rascunho
  Rascunho --> EmRevisao : enviar
  EmRevisao --> Publicado : aprovar
  EmRevisao --> Rascunho : rejeitar
  Publicado --> [*]`,
  },
  {
    value: 'er',
    label: 'Entidade-relacionamento',
    code: `erDiagram
  USUARIO ||--o{ PEDIDO : faz
  PEDIDO ||--|{ ITEM : contem
  PRODUTO ||--o{ ITEM : aparece_em`,
  },
  {
    value: 'gantt',
    label: 'Gantt',
    code: `gantt
  title Roadmap
  dateFormat YYYY-MM-DD
  section MVP
  Builder visual :done, a1, 2026-01-05, 30d
  Importação :active, a2, after a1, 20d
  section Próximos
  Templates : a3, after a2, 25d`,
  },
  {
    value: 'pie',
    label: 'Pizza',
    code: `pie title Linguagens
  "JavaScript" : 60
  "CSS" : 25
  "HTML" : 15`,
  },
  {
    value: 'gitgraph',
    label: 'Git graph',
    code: `gitGraph
  commit
  branch feature
  checkout feature
  commit
  commit
  checkout main
  merge feature
  commit`,
  },
  {
    value: 'mindmap',
    label: 'Mapa mental',
    code: `mindmap
  root((Meu Projeto))
    Frontend
      React
      Vite
    Backend
      Node.js
      PostgreSQL`,
  },
  {
    value: 'timeline',
    label: 'Linha do tempo',
    code: `timeline
  title Histórico
  2024 : Ideia inicial
  2025 : Primeira versão
       : 1.000 usuários
  2026 : Versão 2.0`,
  },
];

export const mermaid = {
  type: 'mermaid',
  label: 'Diagrama (Mermaid)',
  category: 'Código',
  description: 'Fluxogramas, sequência, classes, Gantt, pizza e outros diagramas que o GitHub desenha.',
  defaults: () => ({ code: MERMAID_PRESETS[0].code }),
  summary: (data) => data.code.trim().split(/\s/)[0] ?? '',
  fields: [
    { key: 'preset', label: 'Modelo', type: 'presets', target: 'code', placeholder: 'Carregar modelo…', presets: MERMAID_PRESETS },
    {
      key: 'code',
      label: 'Código',
      type: 'textarea',
      rows: 10,
      monospace: true,
      help: 'O diagrama aparece desenhado no preview. Sintaxe em mermaid.js.org.',
    },
  ],
  toMarkdown: ({ code: source }) => (source.trim() ? fence(source.replace(/\s+$/, ''), 'mermaid') : ''),
};
