import './styles/main.css';

import { mountEditor } from './ui/editor.js';
import { mountLibrary } from './ui/library.js';
import { mountPreview } from './ui/preview.js';
import { mountToolbar } from './ui/toolbar.js';

mountToolbar(document.getElementById('toolbar'));
mountLibrary(document.getElementById('library'));
mountEditor(document.getElementById('editor'));
mountPreview(document.getElementById('preview'));
