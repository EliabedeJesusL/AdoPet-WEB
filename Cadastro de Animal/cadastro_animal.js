(() => {
  const STORAGE_KEY = 'adopet_cadastro_animal_step1';
  const NEXT_URL = '/Upload Dados do Animal/upload_dados_animal.html'; // ajuste o caminho da próxima etapa

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  const form = $('#formCadastro');
  const especie = $('#especie');
  const raca = $('#raca');
  const idade = $('#idade');
  const nome = $('#nome');
  const descricao = $('#descricao');
  const historico = $('#historico');
  const descCounter = $('#descCounter');
  const histCounter = $('#histCounter');
  const btnAvancar = $('#btnAvancar');
  const btnVoltar = $('#btnVoltar');
  const btnRascunho = $('#btnSalvarRascunho');
  const listaRacas = $('#listaRacas');

  // Sugestões de raças por espécie
  const RACAS = {
    cao: ['Vira-lata (SRD)', 'Labrador', 'Bulldog', 'Poodle', 'Golden Retriever', 'Pastor Alemão', 'Shih-Tzu', 'Beagle', 'Husky Siberiano', 'Pinscher'],
    gato: ['Vira-lata (SRD)', 'Siamês', 'Persa', 'Maine Coon', 'Angorá', 'Sphynx', 'British Shorthair'],
    outro: ['Coelho', 'Hamster', 'Porquinho-da-Índia', 'Pássaro', 'Furão']
  };

  // ----- Utilidades -----
  const save = (data) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} };
  const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; } };
  const current = () => ({
    especie: especie.value,
    raca: raca.value.trim(),
    idade: idade.value,
    nome: nome.value.trim(),
    descricao: descricao.value.trim(),
    historico: historico.value.trim(),
  });

  const updateCounters = () => {
    if (descCounter) descCounter.textContent = `${descricao.value.length}/500`;
    if (histCounter) histCounter.textContent = `${historico.value.length}/500`;
  };

  const fillRacas = (esp) => {
    const list = RACAS[esp] || [];
    listaRacas.innerHTML = list.map(v => `<option value="${v}"></option>`).join('');
    // Ajustar placeholder
    raca.placeholder = esp === 'gato' ? 'Ex.: Siamês' : esp === 'outro' ? 'Ex.: Coelho' : 'Ex.: Bulldog';
  };

  // ----- Hidratar estado salvo -----
  const data = load();
  if (data.especie) especie.value = data.especie;
  fillRacas(especie.value || 'cao');

  if (data.raca) raca.value = data.raca;
  if (data.idade) idade.value = data.idade;
  if (data.nome) nome.value = data.nome;
  if (data.descricao) descricao.value = data.descricao;
  if (data.historico) historico.value = data.historico;
  updateCounters();

  // ----- Eventos -----
  especie.addEventListener('change', () => {
    fillRacas(especie.value);
    // Se raça anterior não pertence à nova espécie, limpa o valor
    save(current());
    validateForm();
  });

  [raca, idade, nome, descricao, historico].forEach((el) => {
    el.addEventListener('input', () => {
      updateCounters();
      save(current());
      validateForm();
    });
    el.addEventListener('blur', () => validateField(el)); // feedback ao sair do campo
  });

  // Voltar (mobile)
  btnVoltar?.addEventListener('click', () => {
    if (document.referrer) history.back();
    else window.location.href = '/Dashboard/dashboard.html';
  });

  // Rascunho
  btnRascunho?.addEventListener('click', () => {
    save(current());
    toast('Rascunho salvo!');
  });

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = validateForm(true);
    if (!ok) return;
    // Salva e vai para próxima etapa
    save(current());
    window.location.href = NEXT_URL;
  });

  // ----- Validação -----
  function validateField(el) {
    let valid = true;
    el.setCustomValidity('');

    if (el === especie && !el.value) {
      el.setCustomValidity('Escolha a espécie.');
      valid = false;
    }
    if (el === raca && !el.value.trim()) {
      el.setCustomValidity('Informe a raça.');
      valid = false;
    }
    if (el === idade) {
      const n = Number(el.value);
      if (!Number.isFinite(n) || n < 0 || n > 360) {
        el.setCustomValidity('Informe a idade entre 0 e 360 meses.');
        valid = false;
      }
    }
    if (el === nome) {
      const v = el.value.trim();
      if (v.length < 2) {
        el.setCustomValidity('Informe um nome válido.');
        valid = false;
      }
    }
    if (el === descricao && !el.value.trim()) {
      el.setCustomValidity('Escreva uma descrição.');
      valid = false;
    }

    // UI
    el.classList.toggle('is-invalid', !valid);
    el.classList.toggle('is-valid', valid);
    return valid;
  }

  function validateForm(showAll = false) {
    const fields = [especie, raca, idade, nome, descricao];
    let allValid = true;
    fields.forEach((f) => {
      const v = validateField(f);
      allValid = allValid && v;
      if (!v && showAll) {
        // rola até o primeiro inválido
        f.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    btnAvancar.disabled = !allValid;
    return allValid;
  }

  // ----- Offcanvas: fechar ao clicar nos links -----
  const menuOffcanvasEl = $('#menuOffcanvas');
  if (menuOffcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(menuOffcanvasEl);
    $$('a', menuOffcanvasEl).forEach((a) => a.addEventListener('click', () => off.hide()));
  }

  // ----- Toast simples (sem dependência) -----
  function toast(msg = 'Salvo!') {
    let t = document.getElementById('appToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'appToast';
      t.style.position = 'fixed';
      t.style.left = '50%';
      t.style.bottom = '24px';
      t.style.transform = 'translateX(-50%)';
      t.style.background = 'rgba(0,0,0,.8)';
      t.style.color = '#fff';
      t.style.padding = '10px 14px';
      t.style.borderRadius = '12px';
      t.style.fontSize = '.9rem';
      t.style.zIndex = '1080';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; }, 1400);
  }

  // Primeira validação
  validateForm();
})();