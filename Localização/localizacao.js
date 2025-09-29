// js/localizacao.js
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'adopet_user_location';
  const NEXT_URL = '/Cadastro Pessoa ou ONG/cadastro_pessoa_ong.html';

  const $ = (s, el = document) => el.querySelector(s);

  const btnVoltar = $('#btnVoltar');
  const form = $('#formLocalizacao');
  const cep = $('#cep');
  const estado = $('#estado');
  const cidade = $('#cidade');
  const btnRegistrar = $('#btnRegistrar');

  // Voltar
  btnVoltar?.addEventListener('click', () => {
    // Mantém seu comportamento
    window.location.href = '/Criar conta/criar_conta.html';
  });

  // Lista controlada de cidades
  const cidades = {
    'Espírito Santo': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'],
    'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Petrópolis'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'],
    'São Paulo': ['São Paulo', 'Campinas', 'Santos'],
  };

  // UF (ViaCEP -> nome do select)
  const UF_MAP = { ES: 'Espírito Santo', RJ: 'Rio de Janeiro', MG: 'Minas Gerais', SP: 'São Paulo' };

  // Hidrata do localStorage
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.cep) cep.value = formatCEP(saved.cep);
    if (saved.estado) {
      estado.value = saved.estado;
      populateCidades(saved.estado);
    }
    if (saved.cidade) cidade.value = saved.cidade;
  } catch {}

  // CEP: máscara + ViaCEP
  cep.addEventListener('input', () => {
    cep.value = maskCEP(cep.value);
    validateForm();
    const digits = cep.value.replace(/\D/g, '');
    if (digits.length === 8) fetchCEP(digits);
  });

  cep.addEventListener('blur', () => {
    const digits = cep.value.replace(/\D/g, '');
    if (digits.length === 8) fetchCEP(digits);
  });

  // Estado -> carrega cidades
  estado.addEventListener('change', () => {
    populateCidades(estado.value);
    cidade.value = '';
    validateForm();
  });

  // Cidade
  cidade.addEventListener('change', validateForm);

  // Submit: só dispara evento para implementação (script.js)
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    const payload = {
      cep: cep.value.replace(/\D/g, ''),
      estado: estado.value,
      cidade: cidade.value,
      ts: Date.now(),
    };

    // Salva localmente (UX)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}

    setLoading(true);

    // Dispara para o script de implementação gravar no DB
    window.dispatchEvent(new CustomEvent('localizacao:submit', { detail: payload }));
  });

  // Respostas da implementação
  window.addEventListener('localizacao:saved', () => {
    showAlert('Localização registrada com sucesso!', 'success');
    setTimeout(() => { window.location.href = NEXT_URL; }, 600);
  });

  window.addEventListener('localizacao:error', (ev) => {
    const msg = ev?.detail?.message || 'Erro ao salvar localização.';
    showAlert(msg, 'danger');
    setLoading(false);

    const redirectTo = ev?.detail?.redirectTo;
    if (redirectTo) {
      setTimeout(() => { window.location.href = redirectTo; }, 900);
    }
  });

  // ---------------- utilitários UI ----------------
  function setLoading(isLoading) {
    if (!btnRegistrar) return;
    if (isLoading) {
      btnRegistrar.dataset.text = btnRegistrar.innerHTML;
      btnRegistrar.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Salvando...`;
      btnRegistrar.disabled = true;
    } else {
      btnRegistrar.innerHTML = btnRegistrar.dataset.text || 'Registrar';
      validateForm();
    }
  }

  function populateCidades(ufNome) {
    cidade.innerHTML = '<option value="">Selecione sua cidade</option>';
    (cidades[ufNome] || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      cidade.appendChild(opt);
    });
  }

  async function fetchCEP(digits) {
    setFieldValidity(cep, true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) throw new Error('CEP não encontrado');

      const ufFull = UF_MAP[data.uf];
      if (ufFull) {
        estado.value = ufFull;
        populateCidades(ufFull);

        if (data.localidade) {
          const exists = Array.from(cidade.options).some(o => o.value === data.localidade);
          if (!exists) {
            const opt = document.createElement('option');
            opt.value = data.localidade; opt.textContent = data.localidade;
            cidade.appendChild(opt);
          }
          cidade.value = data.localidade;
        }
      }
    } catch {
      setFieldValidity(cep, false, 'CEP inválido ou não encontrado.');
    } finally {
      validateForm();
    }
  }

  function setFieldValidity(input, ok, message = '') {
    input.setCustomValidity(ok ? '' : message || 'Inválido');
    input.classList.toggle('is-invalid', !ok);
    input.classList.toggle('is-valid', ok && !!input.value);
  }

  function validateForm(show = false) {
    const cepDigits = cep.value.replace(/\D/g, '');
    const cepOk = /^\d{8}$/.test(cepDigits);
    setFieldValidity(cep, cepOk, 'Informe um CEP válido (00000-000).');

    const estadoOk = !!estado.value;
    setFieldValidity(estado, estadoOk, 'Selecione o estado.');

    const cidadeOk = !!cidade.value;
    setFieldValidity(cidade, cidadeOk, 'Selecione a cidade.');

    const allOk = cepOk && estadoOk && cidadeOk;
    if (btnRegistrar) btnRegistrar.disabled = !allOk;

    if (show && !allOk) {
      const firstInvalid = [cep, estado, cidade].find(el => !el.checkValidity());
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid?.focus();
    }
    return allOk;
  }

  function maskCEP(v) {
    const d = v.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0,5)}-${d.slice(5)}`;
  }

  function formatCEP(d) {
    d = String(d || '').replace(/\D/g, '');
    return maskCEP(d);
  }

  function showAlert(message, type = 'info') {
    const container = document.getElementById('formAlerts');
    if (!container) return alert(message);
    const el = document.createElement('div');
    el.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    el.role = 'alert';
    el.innerHTML = `<div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>`;
    container.appendChild(el);
  }

  // valida já ao carregar
  validateForm();
});