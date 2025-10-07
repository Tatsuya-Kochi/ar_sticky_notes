const noteInput = document.querySelector('#note-input');
const noteColor = document.querySelector('#note-color');
const updateButton = document.querySelector('#update-note');
const noteText = document.querySelector('#note-text');
const notePlane = document.querySelector('#note-plane');
const loadingOverlay = document.querySelector('#loading');
const mindarElement = document.querySelector('#mindar');
const charCountLabel = document.querySelector('#note-char-count');

if (!noteInput || !noteColor || !noteText || !notePlane) {
  console.error('必要なUI要素が見つかりませんでした。');
} else {
  const STORAGE_KEY = 'mindar-sticky-note';
  const DEFAULT_NOTE = {
    text: 'MindAR Sticky Note',
    color: '#F5EE84',
  };

  const safeParse = (raw) => {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const loadSavedNote = () => {
    if (!window?.localStorage) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = safeParse(raw);
    if (!saved || typeof saved !== 'object') return null;

    const { text, color } = saved;
    if (typeof text !== 'string' || typeof color !== 'string') return null;
    return { text, color };
  };

  const persistNote = (data) => {
    if (!window?.localStorage) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('メモ内容を保存できませんでした', error);
    }
  };

  const savedNote = loadSavedNote() ?? DEFAULT_NOTE;

  const MAX_NOTE_LENGTH = noteInput?.maxLength > 0 ? noteInput.maxLength : 120;

  const clampText = (text) => {
    if (typeof text !== 'string') return '';
    if (!Number.isFinite(MAX_NOTE_LENGTH) || MAX_NOTE_LENGTH <= 0) {
      return text;
    }
    const characters = Array.from(text);
    if (characters.length <= MAX_NOTE_LENGTH) return text;
    return characters.slice(0, MAX_NOTE_LENGTH).join('');
  };

  const updateCharCount = (text) => {
    if (!charCountLabel) return;
    const length = Array.from(text ?? '').length;
    if (Number.isFinite(MAX_NOTE_LENGTH) && MAX_NOTE_LENGTH > 0) {
      charCountLabel.textContent = `${length} / ${MAX_NOTE_LENGTH} 文字`;
      return;
    }
    charCountLabel.textContent = `${length} 文字`;
  };

  const ensureColorOption = (color) => {
    if (!noteColor) return;
    const nextColor = typeof color === 'string' && color ? color : DEFAULT_NOTE.color;
    noteColor.value = nextColor;
    if (noteColor.value === nextColor) return;

    let customOption = noteColor.querySelector('option[data-custom-color="true"]');
    if (!customOption) {
      customOption = document.createElement('option');
      customOption.dataset.customColor = 'true';
      noteColor.appendChild(customOption);
    }

    customOption.value = nextColor;
    customOption.textContent = `カスタムカラー (${nextColor.toUpperCase()})`;
    noteColor.value = nextColor;
  };

  const getReadableTextColor = (hexColor) => {
    const color = hexColor.replace('#', '');
    if (color.length !== 6) {
      return '#333';
    }

    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#333' : '#f9f9f9';
  };

  const applyNoteState = ({ text, color }) => {
    const safeText = text.trim();
    const displayText = safeText || '（メモなし）';
    const textColor = getReadableTextColor(color);

    noteText.setAttribute('value', displayText);
    noteText.setAttribute('color', textColor);
    notePlane.setAttribute('color', color);
    ensureColorOption(color);
    updateCharCount(text);
  };

  const updateAndPersist = (state) => {
    const sanitizedState = {
      text: clampText(state.text ?? ''),
      color:
        typeof state.color === 'string' && state.color ? state.color : DEFAULT_NOTE.color,
    };

    applyNoteState(sanitizedState);
    if (noteInput && noteInput.value !== sanitizedState.text) {
      noteInput.value = sanitizedState.text;
    }
    persistNote(sanitizedState);
  };

  const initialState = {
    text: clampText(savedNote.text),
    color:
      typeof savedNote.color === 'string' && savedNote.color ? savedNote.color : DEFAULT_NOTE.color,
  };

  applyNoteState(initialState);

  if (noteInput && noteInput.value !== initialState.text) {
    noteInput.value = initialState.text;
  }

  if (savedNote.text !== initialState.text) {
    persistNote(initialState);
  }

  updateButton?.addEventListener('click', () => {
    const value = noteInput.value;
    const color = noteColor.value;
    const nextState = { text: value, color };

    updateAndPersist(nextState);
  });

  noteInput?.addEventListener('input', () => {
    const value = noteInput.value;
    const color = noteColor.value;
    const nextState = { text: value, color };

    updateAndPersist(nextState);
    if (updateButton) {
      updateButton.classList.remove('pulse');
      // Reflow to allow the animation to restart
      void updateButton.offsetWidth;
      updateButton.classList.add('pulse');
    }
  });

  noteColor?.addEventListener('change', () => {
    const value = noteInput.value;
    const color = noteColor.value;
    const nextState = { text: value, color };

    updateAndPersist(nextState);
    if (updateButton) {
      updateButton.classList.remove('pulse');
      void updateButton.offsetWidth;
      updateButton.classList.add('pulse');
    }
  });

  updateButton?.addEventListener('animationend', () => {
    updateButton.classList.remove('pulse');
  });
}

const startMindAR = async () => {
  try {
    const mindarComponent = document.querySelector('a-scene').systems['mindar-image-system'];
    if (!mindarComponent) return;

    await mindarComponent.start();
    loadingOverlay?.classList.add('hidden');
  } catch (error) {
    console.error('MindARの起動に失敗しました', error);
    loadingOverlay.textContent = 'カメラの初期化に失敗しました。ページを再読み込みしてください。';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const sceneEl = document.querySelector('a-scene');
  if (!sceneEl) return;

  sceneEl.addEventListener('loaded', startMindAR);
});

mindarElement?.addEventListener('arReady', () => {
  loadingOverlay?.classList.add('hidden');
});

mindarElement?.addEventListener('arError', (event) => {
  console.error(event.detail);
  if (loadingOverlay) {
    loadingOverlay.textContent = 'ARを開始できませんでした。HTTPS接続とカメラ権限を確認してください。';
  }
});
