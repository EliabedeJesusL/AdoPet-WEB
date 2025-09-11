document.addEventListener('DOMContentLoaded', () => {
  // Modo de testes: validações flexíveis (permite CNPJ e email inventados)
  const TEST_MODE = true;

  const NEXT_URL = '/Dashboard/dashboard.html';
  const STORAGE_KEY = 'adopet_cadastro_pj';

  const $ = (s, el = document) => el.querySelector(s);

  const btnVoltar   = $('#btnVoltar');
  const form        = $('#formCadastroJuridico');
  const btnSubmit   = $('#btnSubmit');

  const instituicao = $('#instituicao');
  const cnpj        = $('#cnpj');
  const aceita      = $('#aceita');
  const responsavel = $('#responsavel');
  const email       = $('#email');
  const site        = $('#site');
  const telefone    = $('#telefone');
  const patrocinios = $('#patrocinios');
  const necessidades= $('#necessidades');
  const necCounter  = $('#necCounter');

  const upload      = $('#uploadLogo');
  const img         = $('#logoImg');
  const placeholder = $('#logoPlaceholder');

  // Voltar
  btnVoltar?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.location.href = '/Conta/conta.html';
  });

  // Preview do logo
  upload?.addEventListener('change', () => {
    const file = upload.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    img.src = url;
    img.classList.remove('d-none');
    placeholder.classList.add('d-none');
  });

  // Máscaras/contadores (mantidos, mas sem travar o envio)
  cnpj.addEventListener('input', () => { cnpj.value = maskCNPJ(cnpj.value); });
  telefone.addEventListener('input', () => { telefone.value = maskPhone(telefone.value); });
  necessidades.addEventListener('input', () => { necCounter.textContent = `${necessidades.value.length}/500`; });

  // Submit (sem validações obrigatórias no modo teste)
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Ajuste leve no site (prefixo) – opcional
    if (site.value && !/^https?:\/\//i.test(site.value.trim())) {
      site.value = `https://${site.value.trim()}`;
    }

    const payload = {
      instituicao: instituicao.value.trim(),
      cnpj: digits(cnpj.value),          // pode ser inventado
      aceita: aceita.value,
      responsavel: responsavel.value.trim(),
      email: email.value.trim(),         // pode ser inventado
      site: site.value.trim(),
      telefone: telefone.value.trim(),
      patrocinios: patrocinios.value,
      necessidades: necessidades.value.trim(),
      ts: Date.now()
    };

    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}

    window.location.href = NEXT_URL;
  });

  // Se não estiver em TEST_MODE (futuro), você pode reativar as validações abaixo:
  if (!TEST_MODE) {
    [instituicao, aceita, responsavel, email, site, telefone, patrocinios].forEach(el => {
      el.addEventListener('input', validate);
      el.addEventListener('change', validate);
    });
    function validate() {
      // Validações reais ficariam aqui (CNPJ, email, etc).
      // btnSubmit.disabled = !ok;
    }
  } else {
    // Em modo de teste, botão sempre habilitado
    btnSubmit.disabled = false;
  }

  // Utils
  function digits(v) { return String(v || '').replace(/\D/g, ''); }

  function maskCNPJ(v) {
    const d = digits(v).slice(0, 14);
    const p1 = d.slice(0,2), p2 = d.slice(2,5), p3 = d.slice(5,8), p4 = d.slice(8,12), p5 = d.slice(12,14);
    if (d.length > 12) return `${p1}.${p2}.${p3}/${p4}-${p5}`;
    if (d.length > 8)  return `${p1}.${p2}.${p3}/${p4}`;
    if (d.length > 5)  return `${p1}.${p2}.${p3}`;
    if (d.length > 2)  return `${p1}.${p2}`;
    return p1;
  }

  function maskPhone(v) {
    let d = digits(v);
    if (d.startsWith('55')) d = d.slice(2);
    d = d.slice(0, 11);
    const ddd = d.slice(0,2), p1 = d.slice(2,7), p2 = d.slice(7,11);
    if (d.length > 6) return `+55 (${ddd}) ${p1}-${p2}`;
    if (d.length > 2) return `+55 (${ddd}) ${p1}`;
    if (d.length > 0) return `+55 (${ddd}`;
    return '+55 ';
  }
});


// CÓDIGO COM VERIFICAÇÃO
//     document.addEventListener('DOMContentLoaded', () => {
//     const NEXT_URL = '/Dashboard/dashboard.html';
//     const STORAGE_KEY = 'adopet_cadastro_pj';
  
//     const $ = (s, el = document) => el.querySelector(s);
  
//     const btnVoltar   = $('#btnVoltar');
//     const form        = $('#formCadastroJuridico');
//     const btnSubmit   = $('#btnSubmit');
  
//     const instituicao = $('#instituicao');
//     const cnpj        = $('#cnpj');
//     const aceita      = $('#aceita');
//     const responsavel = $('#responsavel');
//     const email       = $('#email');
//     const site        = $('#site');
//     const telefone    = $('#telefone');
//     const patrocinios = $('#patrocinios');
//     const necessidades= $('#necessidades');
//     const necCounter  = $('#necCounter');
  
//     const upload      = $('#uploadLogo');
//     const img         = $('#logoImg');
//     const placeholder = $('#logoPlaceholder');
  
//     // Voltar
//     btnVoltar?.addEventListener('click', () => {
//       if (history.length > 1) history.back();
//       else window.location.href = '/Conta/conta.html';
//     });
  
//     // Preview do logo
//     upload?.addEventListener('change', () => {
//       const file = upload.files?.[0];
//       if (!file) return;
//       const url = URL.createObjectURL(file);
//       img.src = url;
//       img.classList.remove('d-none');
//       placeholder.classList.add('d-none');
//     });
  
//     // Máscaras e contadores
//     cnpj.addEventListener('input', () => { cnpj.value = maskCNPJ(cnpj.value); validate(); });
//     telefone.addEventListener('input', () => { telefone.value = maskPhone(telefone.value); validate(); });
//     necessidades.addEventListener('input', () => { necCounter.textContent = `${necessidades.value.length}/500`; });
  
//     [instituicao, aceita, responsavel, email, site, patrocinios].forEach(el => {
//       el.addEventListener('input', validate);
//       el.addEventListener('change', validate);
//     });
  
//     site.addEventListener('blur', () => {
//       if (!site.value.trim()) return;
//       if (!/^https?:\/\//i.test(site.value)) site.value = `https://${site.value.trim()}`;
//       validate();
//     });
  
//     // Submit
//     form.addEventListener('submit', (e) => {
//       e.preventDefault();
//       if (!validate(true)) return;
  
//       const payload = {
//         instituicao: instituicao.value.trim(),
//         cnpj: digits(cnpj.value),
//         aceita: aceita.value,
//         responsavel: responsavel.value.trim(),
//         email: email.value.trim(),
//         site: site.value.trim(),
//         telefone: telefone.value.trim(),
//         patrocinios: patrocinios.value,
//         necessidades: necessidades.value.trim(),
//         ts: Date.now()
//       };
  
//       try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
//       window.location.href = NEXT_URL;
//     });
  
//     // --------- Validação ----------
//     function validate(show = false) {
//       const vInst = instituicao.value.trim().length >= 2;
//       setValidity(instituicao, vInst, 'Informe o nome da instituição.');
  
//       const cnpjDigits = digits(cnpj.value);
//       const vCnpj = isValidCNPJ(cnpjDigits);
//       setValidity(cnpj, vCnpj, 'Informe um CNPJ válido.');
  
//       const vAceita = !!aceita.value;
//       setValidity(aceita, vAceita, 'Selecione uma opção.');
  
//       const vResp = responsavel.value.trim().length >= 2;
//       setValidity(responsavel, vResp, 'Informe o responsável.');
  
//       const vEmail = email.checkValidity();
//       setValidity(email, vEmail, 'Informe um email válido.');
  
//       const vSite = !site.value || site.checkValidity();
//       setValidity(site, vSite, 'Informe uma URL válida.');
  
//       const vTel = isValidPhone(telefone.value);
//       setValidity(telefone, vTel, 'Informe um telefone válido.');
  
//       const vPat = !!patrocinios.value;
//       setValidity(patrocinios, vPat, 'Selecione uma opção.');
  
//       const ok = vInst && vCnpj && vAceita && vResp && vEmail && vSite && vTel && vPat;
//       btnSubmit.disabled = !ok;
  
//       if (show && !ok) {
//         const first = [instituicao, cnpj, aceita, responsavel, email, site, telefone, patrocinios]
//           .find(el => !el.checkValidity());
//         first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         first?.focus();
//       }
//       return ok;
//     }
  
//     function setValidity(input, ok, msg = 'Inválido') {
//       input.setCustomValidity(ok ? '' : msg);
//       input.classList.toggle('is-invalid', !ok);
//       input.classList.toggle('is-valid', ok && !!input.value);
//     }
  
//     // --------- Utilitários ----------
//     function digits(v) { return String(v || '').replace(/\D/g, ''); }
  
//     function maskCNPJ(v) {
//       const d = digits(v).slice(0, 14);
//       const p1 = d.slice(0,2);
//       const p2 = d.slice(2,5);
//       const p3 = d.slice(5,8);
//       const p4 = d.slice(8,12);
//       const p5 = d.slice(12,14);
//       if (d.length > 12) return `${p1}.${p2}.${p3}/${p4}-${p5}`;
//       if (d.length > 8)  return `${p1}.${p2}.${p3}/${p4}`;
//       if (d.length > 5)  return `${p1}.${p2}.${p3}`;
//       if (d.length > 2)  return `${p1}.${p2}`;
//       return p1;
//     }
  
//     function isValidCNPJ(str) {
//       if (!/^\d{14}$/.test(str)) return false;
//       if (/^(\d)\1{13}$/.test(str)) return false; // todos iguais
  
//       const calc = (base) => {
//         const weights = base.length === 12
//           ? [5,4,3,2,9,8,7,6,5,4,3,2]
//           : [6,5,4,3,2,9,8,7,6,5,4,3,2];
//         const nums = base.split('').map(n => +n);
//         const sum = nums.reduce((acc, n, i) => acc + n * weights[i], 0);
//         const mod = sum % 11;
//         return mod < 2 ? 0 : 11 - mod;
//       };
  
//       const d1 = calc(str.slice(0,12));
//       const d2 = calc(str.slice(0,12) + d1);
//       return str.endsWith(`${d1}${d2}`);
//     }
  
//     function maskPhone(v) {
//       let d = digits(v);
//       if (d.startsWith('55')) d = d.slice(2);
//       d = d.slice(0, 11);
//       const ddd = d.slice(0,2);
//       const p1  = d.slice(2,7);
//       const p2  = d.slice(7,11);
//       if (d.length > 6) return `+55 (${ddd}) ${p1}-${p2}`;
//       if (d.length > 2) return `+55 (${ddd}) ${p1}`;
//       if (d.length > 0) return `+55 (${ddd}`;
//       return '+55 ';
//     }
  
//     function isValidPhone(v) {
//       const d = digits(v).replace(/^55/, '');
//       return d.length === 11; // DDD + 9 dígitos
//     }
  
//     // Primeira validação
//     validate();
//   });