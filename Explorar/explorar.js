document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'adopet_explore_filters';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const grid = $('#gridPets');

  // Troque de const para let
  let cards = [];
  rebuildCards();

  const searchInput = $('#exploreSearch');
  const filterBtn = $('#btnFilters');
  const filtersForm = $('#filtersForm');
  const distanceInput = $('#filterDistance');
  const distanceOut = $('#distanceOutput');
  const btnApply = $('#btnApplyFilters');
  const btnReset = $('#btnResetFilters');
  const offcanvasEl = $('#filtersOffcanvas');

  // Quando o script de banco terminar de carregar os cards, atualizamos e reaplicamos filtros
  window.addEventListener('explorar:cardsUpdated', () => {
    rebuildCards();
    applyAll();
  });

  // Defaults
  const defaults = { species: [], sex: [], size: [], distance: 100 };

  // Carregar estado salvo
  let state = loadFilters();

  hydrateForm(state);
  updateDistanceOutput();
  applyAll(); // primeira renderização

  // Busca
  searchInput?.addEventListener('input', () => applyAll());

  // Distância (preview)
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

  // Utils
  function rebuildCards() {
    if (!grid) return;
    cards = $$('.pet-card', grid).map(card => ({
      el: card.closest('.col') || card,
      card
    }));
  }

  function applyAll() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach(({ el, card }) => {
      const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();

      const ds = card.dataset;
      const matchesText = !term || title.includes(term);

      const matchesSpecies = state.species.length === 0 || state.species.includes(ds.species);
      const matchesSex = state.sex.length === 0 || state.sex.includes(ds.sex);
      const matchesSize = state.size.length === 0 || state.size.includes(ds.size);
      const dist = Number(ds.distance || 9999);
      const matchesDistance = dist <= (state.distance || defaults.distance);

      const show = matchesText && matchesSpecies && matchesSex && matchesSize && matchesDistance;

      el.classList.toggle('d-none', !show);
      if (show) visible++;
    });

    toggleFilterButtonActive(isAnyFilterActive(state));
    return visible;
  }

  function readForm() {
    const getChecked = (name) => $$( `input[name="${name}"]:checked`, filtersForm).map(i => i.value);
    return {
      species: getChecked('species'),
      sex: getChecked('sex'),
      size: getChecked('size'),
      distance: Number(distanceInput?.value || defaults.distance),
    };
  }

  function hydrateForm(values) {
    ['species', 'sex', 'size'].forEach((name) => {
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
    const hasBoxes = (values.species?.length || values.sex?.length || values.size?.length) > 0;
    const distActive = (values.distance ?? defaults.distance) < defaults.distance;
    return hasBoxes || distActive || (searchInput?.value?.trim()?.length > 0);
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