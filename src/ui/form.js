import { el, iconButton, moveItem } from '../utils.js';
import { ALIGN_OPTIONS } from '../blocks/options.js';
import { attachShortcuts, renderFormatToolbar } from './format-toolbar.js';

let fieldSequence = 0;
const nextFieldId = () => `field-${++fieldSequence}`;

const normalizeOption = (option) => (typeof option === 'string' ? { value: option, label: option } : option);

/**
 * Renders the form of a block. `data` is mutated in place and `onChange`
 * is called after every edit. Structural edits (adding or removing items)
 * redraw the form itself, keeping the rest of the editor untouched.
 *
 * Every control gets `data-field` with its path inside `data`, so the
 * editor can restore focus after re-rendering.
 */
export function renderForm(fields, data, onChange) {
  const root = el('div', { class: 'form' });
  const redraw = () =>
    root.replaceChildren(...fields.map((field) => renderField(field, data, { onChange, redraw, path: '' })));
  redraw();
  return root;
}

function renderField(field, data, ctx) {
  const id = nextFieldId();
  const path = `${ctx.path}${field.key}`;
  const control = CONTROLS[field.type](field, data, { ...ctx, id, path });

  if (field.type === 'checkbox') {
    return el('label', { class: 'field field--checkbox' }, control, el('span', {}, field.label));
  }

  const isGroup = field.type === 'repeater' || field.type === 'table';
  return el(
    'div',
    { class: `field field--${field.type}` },
    el(isGroup ? 'span' : 'label', { class: 'field__label', for: isGroup ? null : id }, field.label),
    control,
    field.help && el('small', { class: 'field__help' }, field.help),
  );
}

function inputControl(type) {
  return (field, data, { onChange, id, path }) => {
    const input = el('input', {
      id,
      type,
      class: field.monospace ? 'mono' : null,
      min: type === 'number' ? '0' : null,
      placeholder: field.placeholder,
      dataset: { field: path },
      value: data[field.key] ?? '',
      oninput: (event) => {
        data[field.key] = event.target.value;
        onChange();
      },
    });
    if (field.markdown) attachShortcuts(input);
    if (!field.suggestions) return input;

    const listId = `${id}-suggestions`;
    input.setAttribute('list', listId);
    return el('div', {}, input, el('datalist', { id: listId }, field.suggestions.map((value) => el('option', { value }))));
  };
}

const CONTROLS = {
  text: inputControl('text'),
  number: inputControl('number'),

  textarea: (field, data, { onChange, id, path }) => {
    const textarea = el('textarea', {
      id,
      rows: field.rows ?? 4,
      class: field.monospace ? 'mono' : null,
      spellcheck: field.monospace ? 'false' : null,
      dataset: { field: path },
      value: data[field.key] ?? '',
      oninput: (event) => {
        data[field.key] = event.target.value;
        onChange();
      },
    });
    if (!field.markdown) return textarea;
    attachShortcuts(textarea);
    return el('div', { class: 'markdown-field' }, renderFormatToolbar(textarea), textarea);
  },

  select: (field, data, { onChange, id, path }) =>
    el(
      'select',
      {
        id,
        dataset: { field: path },
        value: data[field.key],
        onchange: (event) => {
          data[field.key] = event.target.value;
          onChange();
        },
      },
      field.options.map(normalizeOption).map((option) => el('option', { value: option.value }, option.label)),
    ),

  checkbox: (field, data, { onChange, id, path }) =>
    el('input', {
      id,
      type: 'checkbox',
      dataset: { field: path },
      checked: Boolean(data[field.key]),
      onchange: (event) => {
        data[field.key] = event.target.checked;
        onChange();
      },
    }),

  /** A select that fills another field with a ready-made example. */
  presets: (field, data, { onChange, redraw, id }) =>
    el(
      'select',
      {
        id,
        onchange: (event) => {
          const preset = field.presets.find((item) => item.value === event.target.value);
          event.target.value = '';
          if (!preset) return;
          const current = (data[field.target] ?? '').trim();
          const isUntouched = !current || field.presets.some((item) => item.code.trim() === current);
          if (!isUntouched && !confirm('Substituir o conteúdo atual pelo modelo?')) return;
          data[field.target] = preset.code;
          onChange();
          redraw();
        },
      },
      el('option', { value: '' }, field.placeholder ?? 'Escolher…'),
      field.presets.map((preset) => el('option', { value: preset.value }, preset.label)),
    ),

  repeater: renderRepeater,
  table: renderTableBuilder,
};

function renderRepeater(field, data, ctx) {
  const items = (data[field.key] ??= []);
  const structuralChange = () => {
    ctx.onChange();
    ctx.redraw();
  };

  return el(
    'div',
    { class: 'repeater' },
    items.map((item, index) =>
      el(
        'div',
        { class: 'repeater__item' },
        el(
          'div',
          { class: 'repeater__head' },
          el('span', {}, `${field.itemName ?? 'Item'} ${index + 1}`),
          el(
            'div',
            { class: 'repeater__actions' },
            iconButton('↑', 'Mover para cima', () => {
              moveItem(items, index, index - 1);
              structuralChange();
            }, { disabled: index === 0 }),
            iconButton('↓', 'Mover para baixo', () => {
              moveItem(items, index, index + 1);
              structuralChange();
            }, { disabled: index === items.length - 1 }),
            iconButton('✕', 'Remover', () => {
              items.splice(index, 1);
              structuralChange();
            }, { variant: 'danger' }),
          ),
        ),
        el(
          'div',
          { class: 'repeater__fields' },
          field.fields.map((subfield) => renderField(subfield, item, { ...ctx, path: `${ctx.path}.${index}.` })),
        ),
      ),
    ),
    el(
      'button',
      {
        type: 'button',
        class: 'btn btn--dashed btn--small',
        onclick: () => {
          items.push(field.newItem());
          structuralChange();
        },
      },
      field.addLabel ?? '+ Item',
    ),
  );
}

function renderTableBuilder(field, data, ctx) {
  const { columns, rows } = data[field.key];
  const { onChange, path } = ctx;
  const structuralChange = () => {
    onChange();
    ctx.redraw();
  };

  const addColumn = () => {
    columns.push({ name: `Coluna ${columns.length + 1}`, align: 'left' });
    rows.forEach((row) => row.push(''));
    structuralChange();
  };
  const removeColumn = (index) => {
    columns.splice(index, 1);
    rows.forEach((row) => row.splice(index, 1));
    structuralChange();
  };
  const addRow = () => {
    rows.push(columns.map(() => ''));
    structuralChange();
  };
  const removeRow = (index) => {
    rows.splice(index, 1);
    structuralChange();
  };

  const cellInput = (props) => {
    const input = el('input', { type: 'text', ...props });
    attachShortcuts(input);
    return input;
  };

  const headerRow = el(
    'tr',
    {},
    columns.map((column, index) =>
      el(
        'th',
        {},
        cellInput({
          value: column.name,
          'aria-label': `Nome da coluna ${index + 1}`,
          dataset: { field: `${path}.head.${index}` },
          oninput: (event) => {
            column.name = event.target.value;
            onChange();
          },
        }),
        el(
          'div',
          { class: 'table-builder__column-tools' },
          el(
            'select',
            {
              value: column.align,
              'aria-label': `Alinhamento da coluna ${index + 1}`,
              onchange: (event) => {
                column.align = event.target.value;
                onChange();
              },
            },
            ALIGN_OPTIONS.map((option) => el('option', { value: option.value }, option.label)),
          ),
          iconButton('✕', 'Remover coluna', () => removeColumn(index), {
            disabled: columns.length === 1,
            variant: 'danger',
          }),
        ),
      ),
    ),
    el('th', {}),
  );

  const bodyRows = rows.map((row, rowIndex) =>
    el(
      'tr',
      {},
      columns.map((_, columnIndex) =>
        el(
          'td',
          {},
          cellInput({
            value: row[columnIndex] ?? '',
            'aria-label': `Linha ${rowIndex + 1}, coluna ${columnIndex + 1}`,
            dataset: { field: `${path}.${rowIndex}.${columnIndex}` },
            oninput: (event) => {
              row[columnIndex] = event.target.value;
              onChange();
            },
          }),
        ),
      ),
      el('td', {}, iconButton('✕', 'Remover linha', () => removeRow(rowIndex), { variant: 'danger' })),
    ),
  );

  return el(
    'div',
    { class: 'table-builder' },
    el('div', { class: 'table-builder__scroll' }, el('table', {}, el('thead', {}, headerRow), el('tbody', {}, bodyRows))),
    el(
      'div',
      { class: 'table-builder__actions' },
      el('button', { type: 'button', class: 'btn btn--dashed btn--small', onclick: addColumn }, '+ Coluna'),
      el('button', { type: 'button', class: 'btn btn--dashed btn--small', onclick: addRow }, '+ Linha'),
    ),
  );
}
