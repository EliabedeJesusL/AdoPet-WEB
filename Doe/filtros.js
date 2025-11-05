// === SISTEMA DE FILTROS PARA PÁGINA DOE ===
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'adopet_doe_filters';

  // Elementos DOM
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const grid = $('#gridInst');
  const searchInput = $('#donateSearch');
  const filterBtn = $('#btnFilters');
  const filtersForm = $('#filtersForm');
  const distanceInput = $('#donateDistance');
  const distanceOutput = $('#distanceOutput');
  const btnApply = $('#btnApplyFilters');
  const btnReset = $('#btnResetFilters');
  const offcanvasEl = $('#filtersOffcanvas');

  // Estado dos filtros
  const defaults = {
    causes: [],     // cao, gato, silvestre
    modalities: [], // pix, cartao, boleto, itens
    distance: 100
  };

  let state = loadFilters();
  let cards = []; // será populado quando as instituições carregarem

  // === FUNÇÕES PRINCIPAIS ===

  // Coleta todos os cards de instituições
  function updateCards() {
    cards = $$('.inst-card', grid).map(card => ({
      el: card.closest('.col') || card,
      card
    }));
  }

  // Aplica todos os filtros
  function applyAll() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    let visible = 0;

    cards.forEach(({ el, card }) => {
      const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      
      // Dataset do card
      const ds = card.dataset;
      
      // Filtro de texto
      const matchesText = !term || title.includes(term);
      
      // Filtro de causas (animais atendidos)
      const cardCauses = (ds.causes || '').split(' ').filter(Boolean);
      const matchesCauses = state.causes.length === 0 || 
        state.causes.some(cause => cardCauses.includes(cause));
      
      // Filtro de modalidades de doação
      const cardModalities = (ds.modalities || '').split(' ').filter(Boolean);
      const matchesModalities = state.modalities.length === 0 || 
        state.modalities.some(mod => cardModalities.includes(mod));
      
      // Filtro de distância
      const dist = Number(ds.distance || 9999);
      const matchesDistance = dist <= (state.distance || defaults.distance);

      const show = matchesText && matchesCauses && matchesModalities && matchesDistance;

      el.classList.toggle('d-none', !show);
      if (show) visible++;
    });

    // Atualiza aparência do botão de filtro
    toggleFilterButtonActive(isAnyFilterActive(state));
    
    return visible;
  }

  // Lê valores do formulário de filtros
  function readForm() {
    const causes = $$('input[name="causes"]:checked', filtersForm).map(i => i.value);
    const modalities = $$('input[name="modalities"]:checked', filtersForm).map(i => i.value);
    const distance = Number(distanceInput?.value || defaults.distance);
    
    return { causes, modalities, distance };
  }

  // Preenche o formulário com os valores
  function hydrateForm(values) {
    // Limpa seleções anteriores
    $$('input[name="causes"]', filtersForm).forEach(i => i.checked = false);
    $$('input[name="modalities"]', filtersForm).forEach(i => i.checked = false);
    
    // Aplica valores
    values.causes?.forEach(cause => {
      const input = $(`input[name="causes"][value="${cause}"]`, filtersForm);
      if (input) input.checked = true;
    });
    
    values.modalities?.forEach(mod => {
      const input = $(`input[name="modalities"][value="${mod}"]`, filtersForm);
      if (input) input.checked = true;
    });
    
    if (distanceInput) {
      distanceInput.value = values.distance ?? defaults.distance;
    }
  }

  // Atualiza output de distância
  function updateDistanceOutput() {
    if (distanceOutput && distanceInput) {
      distanceOutput.textContent = `${distanceInput.value} km`;
    }
  }

  // Verifica se algum filtro está ativo
  function isAnyFilterActive(values) {
    const hasBoxes = (values.causes?.length || values.modalities?.length) > 0;
    const distActive = (values.distance ?? defaults.distance) < defaults.distance;
    return hasBoxes || distActive || (searchInput?.value?.trim()?.length > 0);
  }

  // Alterna classe active no botão de filtros
  function toggleFilterButtonActive(active) {
    filterBtn?.classList.toggle('active', !!active);
  }

  // Salva filtros no localStorage
  function saveFilters(values) {
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); 
    } catch {}
  }

  // Carrega filtros do localStorage
  function loadFilters() {
    try { 
      return { ...defaults, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')) }; 
    } catch { 
      return { ...defaults }; 
    }
  }

  // Fecha offcanvas
  function hideOffcanvas(el) {
    if (!el || !window.bootstrap?.Offcanvas) return;
    bootstrap.Offcanvas.getOrCreateInstance(el).hide();
  }

  // === EVENTOS ===

  // Inicialização
  hydrateForm(state);
  updateDistanceOutput();

  // Busca em tempo real
  searchInput?.addEventListener('input', () => {
    updateCards();
    applyAll();
  });

  // Preview da distância
  distanceInput?.addEventListener('input', updateDistanceOutput);

  // Aplicar filtros
  btnApply?.addEventListener('click', () => {
    state = readForm();
    saveFilters(state);
    updateCards();
    applyAll();
    toggleFilterButtonActive(isAnyFilterActive(state));
    hideOffcanvas(offcanvasEl);
  });

  // Limpar filtros
  btnReset?.addEventListener('click', () => {
    state = { ...defaults };
    hydrateForm(state);
    saveFilters(state);
    updateCards();
    applyAll();
    toggleFilterButtonActive(false);
  });

  // === EXPOSIÇÃO GLOBAL ===
  // Permite que doe.js e script.js chamem applyAll
  window.applyAll = function() {
    updateCards();
    return applyAll();
  };

  // Primeira execução (caso os cards já existam)
  setTimeout(() => {
    updateCards();
    applyAll();
  }, 100);
});