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
    if (history.length > 1) history.back();
    else window.location.href = '/Cadastro Pessoa ou ONG/cadastro_pessoa_ong.html';
  });

  // Lista de cidades por estado (controlada)
  const cidades = {
    'Espírito Santo': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'],
    'Rio de Janeiro': ['Rio de Janeiro', 'Niterói', 'Petrópolis'],
    'Minas Gerais': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora'],
    'São Paulo': ['São Paulo', 'Campinas', 'Santos'],
  };

  // Mapeia siglas da ViaCEP -> nomes do select
  const UF_MAP = {
    ES: 'Espírito Santo',
    RJ: 'Rio de Janeiro',
    MG: 'Minas Gerais',
    SP: 'São Paulo',
  };

  // Hidrata se houver dado salvo
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (saved.cep) cep.value = formatCEP(saved.cep);
    if (saved.estado) {
      estado.value = saved.estado;
      populateCidades(saved.estado);
    }
    if (saved.cidade) cidade.value = saved.cidade;
  } catch {}

  // CEP: máscara e busca ViaCEP
  cep.addEventListener('input', () => {
    cep.value = maskCEP(cep.value);
    validateForm();
    const digits = cep.value.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchCEP(digits);
    }
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

  // Cidade validação
  cidade.addEventListener('change', validateForm);

  // Submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;

    // Persistência
    const payload = {
      cep: cep.value.replace(/\D/g, ''),
      estado: estado.value,
      cidade: cidade.value,
      ts: Date.now(),
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}

    // Feedback simples e próxima etapa
    showAlert('Localização registrada com sucesso!', 'success');
    setTimeout(() => { window.location.href = NEXT_URL; }, 600);
  });

  // Utils

  function populateCidades(ufNome) {
    cidade.innerHTML = '<option value="">Selecione sua cidade</option>';
    (cidades[ufNome] || []).forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      cidade.appendChild(opt);
    });
  }

  async function fetchCEP(digits) {
    setFieldValidity(cep, true); // limpa erro anterior
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) throw new Error('CEP não encontrado');

      const ufFull = UF_MAP[data.uf];
      if (ufFull) {
        estado.value = ufFull;
        populateCidades(ufFull);

        // Se a cidade retornada estiver na lista, seleciona; senão, adiciona temporariamente
        if (data.localidade) {
          const exists = Array.from(cidade.options).some(o => o.value === data.localidade);
          if (!exists) {
            const opt = document.createElement('option');
            opt.value = data.localidade;
            opt.textContent = data.localidade;
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
    // CEP
    const cepDigits = cep.value.replace(/\D/g, '');
    const cepOk = /^\d{8}$/.test(cepDigits);
    setFieldValidity(cep, cepOk, 'Informe um CEP válido (00000-000).');

    // Estado
    const estadoOk = !!estado.value;
    setFieldValidity(estado, estadoOk, 'Selecione o estado.');

    // Cidade
    const cidadeOk = !!cidade.value;
    setFieldValidity(cidade, cidadeOk, 'Selecione a cidade.');

    const allOk = cepOk && estadoOk && cidadeOk;
    btnRegistrar.disabled = !allOk;

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
    const container = $('#formAlerts');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    el.role = 'alert';
    el.innerHTML = `
      <div>${message}</div>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fechar"></button>
    `;
    container.appendChild(el);
  }

  // Primeira validação
  validateForm();
});