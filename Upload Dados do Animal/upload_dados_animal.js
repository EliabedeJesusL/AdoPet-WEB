(() => {
  const MAX_FILES = 8;
  const MAX_SIZE_MB = 5;
  const BYTES_MB = 1024 * 1024;

  const $ = (s, el = document) => el.querySelector(s);

  // Exposição controlada dos arquivos para o módulo de banco
  window.__adopetUploads = window.__adopetUploads || { animal: [], vacina: [] };

  // Voltar (mobile)
  $('#btnVoltar')?.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = '/Cadastrar/cadastrar-animal.html';
  });

  // Offcanvas (mobile): fechar ao clicar nos links
  const offcanvasEl = $('#menuOffcanvas');
  if (offcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    offcanvasEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => off.hide()));
  }

  // Setup dos dois grupos: animal e vacina
  const animal = setupUploadGroup({
    input: '#inputAnimal',
    box: '#boxAnimal',
    btnPick: '#btnPickAnimal',
    btnShot: '#btnShotAnimal',
    preview: '#previewAnimal',
    counter: '#countAnimal',
    storageKey: 'adopet_upload_animal',
    globalKey: 'animal' // <- adicionamos essa chave
  });

  const vacina = setupUploadGroup({
    input: '#inputVacina',
    box: '#boxVacina',
    btnPick: '#btnPickVacina',
    btnShot: '#btnShotVacina',
    preview: '#previewVacina',
    counter: '#countVacina',
    storageKey: 'adopet_upload_vacina',
    globalKey: 'vacina' // <- adicionamos essa chave
  });

  // Habilita o Salvar somente quando tiver ao menos 1 foto do animal
  const btnAvancar = $('#btnAvancar');
  function updateSaveAvailability() {
    const enabled = animal.count() > 0;
    btnAvancar?.classList.toggle('disabled', !enabled);
    btnAvancar?.setAttribute('aria-disabled', String(!enabled));
  }
  updateSaveAvailability();

  // Intercepta o clique do Salvar para validar
  btnAvancar?.addEventListener('click', (e) => {
    const valid = animal.count() > 0;
    if (!valid) {
      e.preventDefault();
      showAlert('Adicione pelo menos uma foto do animal para continuar.', 'warning');
      return;
    }

    try {
      sessionStorage.setItem('adopet_upload_counts', JSON.stringify({
        animal: animal.count(),
        vacina: vacina.count()
      }));
    } catch {}

    // deixa o submit acontecer normalmente (o módulo de banco trata)
  });

  // Helpers

  function setupUploadGroup(cfg) {
    const input = $(cfg.input);
    const box = $(cfg.box);
    const pick = $(cfg.btnPick);
    const shot = $(cfg.btnShot);
    const preview = $(cfg.preview);
    const counter = $(cfg.counter);
    const globalKey = cfg.globalKey; // 'animal' | 'vacina'

    /** @type {{id:string, file:File, url:string}[]} */
    let state = [];

    const updateCounter = () => counter && (counter.textContent = `${state.length}/${MAX_FILES}`);

    function addThumb(item) {
      const el = document.createElement('div');
      el.className = 'thumb';
      el.dataset.id = item.id;
      el.innerHTML = `
        <img src="${item.url}" alt="Pré-visualização da imagem selecionada" loading="lazy" />
        <button type="button" class="btn btn-sm btn-remove" aria-label="Remover imagem" title="Remover">
          <i class="bi bi-x-lg"></i>
        </button>
      `;
      preview?.appendChild(el);
    }

    // Remoção
    preview?.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.btn-remove');
      if (!btn) return;
      const thumb = btn.closest('.thumb');
      const id = thumb?.dataset?.id;

      const idx = state.findIndex(x => x.id === id);
      if (idx >= 0) {
        URL.revokeObjectURL(state[idx].url);
        // remove também do global
        const gArr = window.__adopetUploads[globalKey];
        const gIdx = gArr.findIndex(x => x.id === id);
        if (gIdx >= 0) gArr.splice(gIdx, 1);

        state.splice(idx, 1);
        thumb.remove();
        persist();
        updateCounter();
        updateSaveAvailability();
      }
    });

    // Entrada de arquivos
    input?.addEventListener('change', () => {
      if (!input.files?.length) return;
      handleFiles(input.files);
      // Mantemos esse reset para permitir selecionar o mesmo arquivo de novo;
      // os arquivos já ficam guardados no "state" e no global __adopetUploads.
      input.value = '';
    });

    // Botões
    pick?.addEventListener('click', () => input?.click());
    shot?.addEventListener('click', () => input?.click());

    // Acessibilidade da caixa
    box?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input?.click();
      }
    });

    // Drag & Drop
    ['dragenter','dragover'].forEach(evt =>
      box?.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); box.classList.add('is-dragover'); })
    );
    ['dragleave','drop'].forEach (evt =>
      box?.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); box.classList.remove('is-dragover'); })
    );
    box?.addEventListener('drop', (e) => {
      const files = e.dataTransfer?.files;
      if (files?.length) handleFiles(files);
    });

    function handleFiles(fileList) {
      const incoming = Array.from(fileList);
      const valid = [];
      for (const f of incoming) {
        if (!f.type.startsWith('image/')) {
          showAlert(`Arquivo ignorado: ${f.name} não é uma imagem.`, 'warning');
          continue;
        }
        if (f.size > MAX_SIZE_MB * BYTES_MB) {
          showAlert(`Arquivo muito grande: ${f.name} excede ${MAX_SIZE_MB} MB.`, 'warning');
          continue;
        }
        valid.push(f);
      }

      const canAdd = Math.max(0, MAX_FILES - state.length);
      if (valid.length > canAdd) {
        showAlert(`Apenas ${canAdd} imagem(ns) podem ser adicionadas (limite de ${MAX_FILES}).`, 'info');
      }
      const toAdd = valid.slice(0, canAdd);

      toAdd.forEach((file) => {
        const url = URL.createObjectURL(file);
        const id = crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
        const item = { id, file, url };
        state.push(item);
        // adiciona também no global, para o módulo do banco ler no submit
        window.__adopetUploads[globalKey].push({ id, file });
        addThumb(item);
      });

      persist();
      updateCounter();
      updateSaveAvailability();
    }

    function persist() {
      try {
        const names = state.map(s => s.file.name);
        sessionStorage.setItem(cfg.storageKey, JSON.stringify(names));
      } catch {}
    }

    updateCounter();

    return {
      count: () => state.length
    };
  }

  function showAlert(message, type = 'info') {
    const wrap = $('#formAlerts');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = `alert alert-${type} alert-dismissible fade show`;
    el.role = 'alert';
    el.innerHTML = `
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    wrap.appendChild(el);
  }
})();