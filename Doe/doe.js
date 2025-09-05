document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'adopet_doe_filters';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const grid = $('#gridInst');
  const cols = $$('#gridInst .col');
  const cards = cols.map(col => ({ col, card: col.querySelector('.inst-card') }));

  const searchInput = $('#donateSearch');
  const filterBtn = $('#btnFilters');
  const filtersForm = $('#filtersForm');
  const distanceInput = $('#donateDistance');
  const distanceOut = $('#distanceOutput');
  const btnApply = $('#btnApplyFilters');
  const btnReset = $('#btnResetFilters');
  const offcanvasEl = $('#filtersOffcanvas');

  // Defaults
  const defaults = {
    causes: [],       // vazio = todas
    modalities: [],   // vazio = qualquer modalidade
    distance: 100
  };

  // Estado
  let state = loadFilters();

  hydrateForm(state);
  updateDistanceOutput();
  applyAll(); // primeira renderização

  // Busca
  searchInput?.addEventListener('input', () => applyAll());

  // Distância preview
  distanceInput?.addEventListener('input', updateDistanceOutput);

  // Aplicar filtros
  btnApply?.addEventListener('click', () => {
    state = readForm();
    saveFilters(state);
    applyAll();
    toggleFilterButtonActive(isAnyFilterActive(state));
    hideOffcanvas(offcanvasEl);
  });

  // Limpar filtros
  btnReset?.addEventListener('click', () => {
    state = { ...defaults };
    hydrateForm(state);
    saveFilters(state);
    applyAll();
    toggleFilterButtonActive(false);
  });

  // ===== Funções =====
  function applyAll() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach(({ col, card }) => {
      const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();

      const ds = card.dataset;

      // Busca por texto
      const matchesText = !term || title.includes(term);

      // Causas (a instituição pode ter múltiplas: "cao gato")
      const cardCauses = (ds.causes || '').split(/\s+/).filter(Boolean);
      const hasCause = state.causes.length === 0 || state.causes.some(c => cardCauses.includes(c));

      // Modalidades (a instituição pode aceitar várias)
      const cardModalities = (ds.modalities || '').split(/\s+/).filter(Boolean);
      const hasModality = state.modalities.length === 0 || state.modalities.some(m => cardModalities.includes(m));

      // Distância
      const dist = Number(ds.distance || 9999);
      const matchDist = dist <= (state.distance || defaults.distance);

      const show = matchesText && hasCause && hasModality && matchDist;

      col.classList.toggle('d-none', !show);
      if (show) visible++;
    });

    toggleFilterButtonActive(isAnyFilterActive(state));
    // Você pode exibir uma mensagem "Nenhum resultado" se visible === 0, se desejar.

    return visible;
  }

  function readForm() {
    const getChecked = (name) => $$( `input[name="${name}"]:checked`, filtersForm).map(i => i.value);
    return {
      causes: getChecked('causes'),
      modalities: getChecked('modalities'),
      distance: Number(distanceInput?.value || defaults.distance),
    };
  }

  function hydrateForm(values) {
    ['causes', 'modalities'].forEach((name) => {
      const checked = new Set(values[name] || []);
      $$(`input[name="${name}"]`, filtersForm).forEach((i) => { i.checked = checked.has(i.value); });
    });
    if (distanceInput) distanceInput.value = values.distance ?? defaults.distance;
    updateDistanceOutput();
  }

  function updateDistanceOutput() {
    if (distanceOut && distanceInput) distanceOut.textContent = `${distanceInput.value} km`;
  }

  function isAnyFilterActive(values) {
    const selectedBoxes = (values.causes?.length || values.modalities?.length) > 0;
    const distanceActive = (values.distance ?? defaults.distance) < defaults.distance;
    const hasTerm = (searchInput?.value?.trim()?.length || 0) > 0;
    return selectedBoxes || distanceActive || hasTerm;
  }

  function toggleFilterButtonActive(active) {
    filterBtn?.classList.toggle('active', !!active);
  }

  function saveFilters(values) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch {}
  }

  function loadFilters() {
    try { return { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) }; }
    catch { return { ...defaults }; }
  }

  function hideOffcanvas(el) {
    if (!el || !window.bootstrap?.Offcanvas) return;
    bootstrap.Offcanvas.getOrCreateInstance(el).hide();
  }
});