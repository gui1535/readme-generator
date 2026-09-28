import { createBlock } from '../blocks/registry.js';

const REPO = 'https://github.com/usuario/meu-projeto';

const badge = (overrides) => ({ label: '', color: 'blue', logo: '', logoColor: 'white', link: '', ...overrides });

/**
 * Example README following the section order used by large open source
 * projects: header, quick links, table of contents, about, getting started,
 * usage, roadmap, contributing, license, contact and acknowledgments.
 */
export function createStarterBlocks() {
  return [
    createBlock('hero', {
      name: 'Meu Projeto',
      description: 'Uma frase curta e marcante que explica o que o projeto faz e para quem.',
    }),
    createBlock('badges', {
      style: 'flat',
      align: 'center',
      items: [
        badge({ label: 'version', message: '1.0.0', color: 'blue', link: `${REPO}/releases` }),
        badge({ label: 'build', message: 'passing', color: 'brightgreen', logo: 'githubactions', link: `${REPO}/actions` }),
        badge({ label: 'license', message: 'MIT', color: 'green', link: `${REPO}/blob/main/LICENSE` }),
        badge({ label: 'PRs', message: 'welcome', color: 'orange', link: `${REPO}/pulls` }),
      ],
    }),
    createBlock('paragraph', {
      align: 'center',
      text: [
        `[**Documentação**](${REPO}/wiki)`,
        '[Demo](https://usuario.github.io/meu-projeto)',
        `[Reportar bug](${REPO}/issues/new?labels=bug)`,
        `[Sugerir funcionalidade](${REPO}/issues/new?labels=enhancement)`,
      ].join(' · '),
    }),
    createBlock('image', {
      url: 'https://placehold.co/1200x600/png?text=Screenshot+do+projeto',
      alt: 'Screenshot do projeto',
      width: '800',
      align: 'center',
    }),
    createBlock('toc', { title: 'Sumário', collapsible: true, style: 'numbered', h2: true, h3: true }),

    createBlock('heading', { text: 'Sobre o projeto', level: '2' }),
    createBlock('paragraph', {
      text:
        'O **Meu Projeto** resolve _[problema]_ para _[público]_. Explique em poucas linhas a motivação, ' +
        'o que o torna diferente das alternativas e em que estágio o desenvolvimento está.',
    }),
    createBlock('heading', { text: 'Construído com', level: '3' }),
    createBlock('badges', {
      style: 'for-the-badge',
      align: 'left',
      items: [
        badge({ message: 'React', color: '20232A', logo: 'react', logoColor: '61DAFB' }),
        badge({ message: 'TypeScript', color: '3178C6', logo: 'typescript' }),
        badge({ message: 'Vite', color: '646CFF', logo: 'vite' }),
        badge({ message: 'Node.js', color: '339933', logo: 'nodedotjs' }),
      ],
    }),

    createBlock('heading', { text: 'Funcionalidades', level: '2' }),
    createBlock('list', {
      style: 'bullet',
      items: [
        '**Rápido**: descreva o principal benefício de desempenho.',
        '**Simples**: explique como o projeto facilita a vida de quem usa.',
        '**Extensível**: cite integrações, plugins ou APIs disponíveis.',
        '**Acessível**: mencione suporte a temas, idiomas ou dispositivos.',
      ].join('\n'),
    }),

    createBlock('heading', { text: 'Começando', level: '2' }),
    createBlock('paragraph', { text: 'Siga os passos abaixo para rodar uma cópia do projeto na sua máquina.' }),
    createBlock('heading', { text: 'Pré-requisitos', level: '3' }),
    createBlock('list', {
      style: 'bullet',
      items: ['[Node.js](https://nodejs.org) 20 ou superior', 'npm 10 ou superior (ou pnpm / yarn)'].join('\n'),
    }),
    createBlock('heading', { text: 'Instalação', level: '3' }),
    createBlock('terminal', {
      commands: [
        { command: `git clone ${REPO}.git` },
        { command: 'cd meu-projeto' },
        { command: 'npm install' },
        { command: 'cp .env.example .env' },
        { command: 'npm run dev' },
      ],
    }),
    createBlock('alert', {
      kind: 'IMPORTANT',
      text: 'Preencha as variáveis do arquivo `.env` antes de iniciar. Nunca faça commit desse arquivo.',
    }),

    createBlock('heading', { text: 'Uso', level: '2' }),
    createBlock('paragraph', { text: 'Um exemplo mínimo de como usar o projeto:' }),
    createBlock('code', {
      language: 'javascript',
      code: ["import { createApp } from 'meu-projeto';", '', 'const app = createApp({ debug: true });', 'app.start();'].join('\n'),
    }),
    createBlock('paragraph', { text: `Para mais exemplos, consulte a [documentação](${REPO}/wiki).` }),
    createBlock('heading', { text: 'Scripts disponíveis', level: '3' }),
    createBlock('table', {
      table: {
        columns: [
          { name: 'Comando', align: 'left' },
          { name: 'Descrição', align: 'left' },
        ],
        rows: [
          ['`npm run dev`', 'Inicia o servidor de desenvolvimento'],
          ['`npm run build`', 'Gera a versão de produção'],
          ['`npm run test`', 'Executa os testes automatizados'],
          ['`npm run lint`', 'Verifica o padrão de código'],
        ],
      },
    }),

    createBlock('heading', { text: 'Roadmap', level: '2' }),
    createBlock('checklist', {
      items: [
        { done: true, text: 'Versão inicial' },
        { done: true, text: 'Documentação básica' },
        { done: false, text: 'Tema escuro' },
        { done: false, text: 'Internacionalização (i18n)' },
        { done: false, text: 'Aplicativo mobile' },
      ],
    }),
    createBlock('paragraph', {
      text: `Veja as [issues abertas](${REPO}/issues) para a lista completa de propostas e problemas conhecidos.`,
    }),

    createBlock('heading', { text: 'Contribuindo', level: '2' }),
    createBlock('paragraph', {
      text: 'Contribuições são o que fazem a comunidade open source incrível. Qualquer ajuda é **muito bem-vinda**.',
    }),
    createBlock('list', {
      style: 'numbered',
      items: [
        'Faça um fork do projeto',
        'Crie uma branch para a sua alteração (`git checkout -b feature/minha-feature`)',
        "Faça commit das mudanças (`git commit -m 'feat: adiciona minha feature'`)",
        'Envie a branch (`git push origin feature/minha-feature`)',
        'Abra um Pull Request',
      ].join('\n'),
    }),

    createBlock('heading', { text: 'Licença', level: '2' }),
    createBlock('paragraph', { text: 'Distribuído sob a licença MIT. Veja [`LICENSE`](LICENSE) para mais informações.' }),

    createBlock('heading', { text: 'Contato', level: '2' }),
    createBlock('paragraph', {
      text: `Seu Nome · [@seu_usuario](https://x.com/seu_usuario) · email@exemplo.com\n\nLink do projeto: [${REPO}](${REPO})`,
    }),

    createBlock('heading', { text: 'Agradecimentos', level: '2' }),
    createBlock('list', {
      style: 'bullet',
      items: [
        '[Shields.io](https://shields.io)',
        '[Choose an Open Source License](https://choosealicense.com)',
        '[Best-README-Template](https://github.com/othneildrew/Best-README-Template)',
      ].join('\n'),
    }),

    createBlock('divider'),
    createBlock('paragraph', {
      align: 'center',
      text: 'Feito com ❤️ por [Seu Nome](https://github.com/usuario)',
    }),
  ].map((block) => ({ ...block, collapsed: true }));
}
