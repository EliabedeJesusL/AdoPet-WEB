document.addEventListener('DOMContentLoaded', () => {
    const NEXT_URL = '/Dashboard/dashboard.html';
    const STORAGE_KEY = 'adopet_cadastro_pf';
  
    const $ = (s, el = document) => el.querySelector(s);
  
    const btnVoltar = $('#btnVoltar');
    const form = $('#formCadastro');
    const btnSubmit = $('#btnSubmit');
  
    const nome = $('#nome');
    const cpf = $('#cpf');
    const nasc = $('#nascimento');
    const sexo = $('#sexo');
    const tel = $('#telefone');
  
    const upload = $('#uploadFoto');
    const img = $('#avatarImg');
    const placeholder = $('#avatarPlaceholder');
  
    // Voltar
    btnVoltar?.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else window.location.href = '/Conta/conta.html';
    });
  
    // Avatar preview
    upload?.addEventListener('change', () => {
      const file = upload.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      img.src = url;
      img.classList.remove('d-none');
      placeholder.classList.add('d-none');
    });
  
    // Máscaras
    nome.addEventListener('input', () => { nome.value = nome.value.replace(/\s{2,}/g, ' '); validate(); });
  
    cpf.addEventListener('input', () => {
      cpf.value = maskCPF(cpf.value);
      validate();
    });
  
    nasc.addEventListener('input', () => {
      nasc.value = maskDate(nasc.value);
      validate();
    });
  
    tel.addEventListener('input', () => {
      tel.value = maskPhone(tel.value);
      validate();
    });
  
    sexo.addEventListener('change', validate);
  
    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(true)) return;
  
      const payload = {
        nome: nome.value.trim(),
        cpf: digits(cpf.value),
        nascimento: nasc.value,
        sexo: sexo.value,
        telefone: tel.value,
        ts: Date.now()
      };
  
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch {}
      window.location.href = NEXT_URL;
    });
  
    // Helpers de validação/máscara
    function validate(show = false) {
      const vNome = nome.value.trim().length >= 2;
      setValidity(nome, vNome, 'Informe seu nome (mínimo 2 caracteres).');
  
      const vCPF = isValidCPF(digits(cpf.value));
      setValidity(cpf, vCPF, 'Informe um CPF válido.');
  
      const vDate = isValidDate(nasc.value);
      setValidity(nasc, vDate, 'Informe uma data válida.');
  
      const vSexo = !!sexo.value;
      setValidity(sexo, vSexo, 'Selecione uma opção.');
  
      const vTel = isValidPhone(tel.value);
      setValidity(tel, vTel, 'Informe um telefone válido.');
  
      const ok = vNome && vCPF && vDate && vSexo && vTel;
      btnSubmit.disabled = !ok;
  
      if (show && !ok) {
        const first = [nome, cpf, nasc, sexo, tel].find(el => !el.checkValidity());
        first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        first?.focus();
      }
      return ok;
    }
  
    function setValidity(input, ok, msg = 'Inválido') {
      input.setCustomValidity(ok ? '' : msg);
      input.classList.toggle('is-invalid', !ok);
      input.classList.toggle('is-valid', ok && !!input.value);
    }
  
    function digits(v) { return String(v || '').replace(/\D/g, ''); }
  
    function maskCPF(v) {
      const d = digits(v).slice(0, 11);
      const p1 = d.slice(0,3);
      const p2 = d.slice(3,6);
      const p3 = d.slice(6,9);
      const p4 = d.slice(9,11);
      if (d.length > 9) return `${p1}.${p2}.${p3}-${p4}`;
      if (d.length > 6) return `${p1}.${p2}.${p3}`;
      if (d.length > 3) return `${p1}.${p2}`;
      return p1;
    }
  
    function isValidCPF(str) {
      if (!/^\d{11}$/.test(str)) return false;
      if (/^(\d)\1{10}$/.test(str)) return false; // todos iguais
      let s = 0;
      for (let i = 0; i < 9; i++) s += Number(str[i]) * (10 - i);
      let d1 = (s * 10) % 11; if (d1 === 10) d1 = 0;
      if (d1 !== Number(str[9])) return false;
      s = 0;
      for (let i = 0; i < 10; i++) s += Number(str[i]) * (11 - i);
      let d2 = (s * 10) % 11; if (d2 === 10) d2 = 0;
      return d2 === Number(str[10]);
    }
  
    function maskDate(v) {
      const d = digits(v).slice(0, 8);
      if (d.length <= 2) return d;
      if (d.length <= 4) return `${d.slice(0,2)}/${d.slice(2)}`;
      return `${d.slice(0,2)}/${d.slice(2,4)}/${d.slice(4)}`;
    }
  
    function isValidDate(v) {
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
      if (!m) return false;
      const [_, dd, mm, yyyy] = m.map(Number);
      if (mm < 1 || mm > 12) return false;
      const days = new Date(yyyy, mm, 0).getDate();
      if (dd < 1 || dd > days) return false;
      const d = new Date(yyyy, mm - 1, dd);
      const min = new Date(1900, 0, 1);
      const now = new Date();
      if (d < min || d > now) return false;
      return true;
    }
  
    function maskPhone(v) {
      let d = digits(v);
      // remove DDI 55 se informado para formatar sempre com +55
      if (d.startsWith('55')) d = d.slice(2);
      d = d.slice(0, 11); // DDD + número (11)
      const ddd = d.slice(0,2);
      const p1 = d.slice(2,7);
      const p2 = d.slice(7,11);
      if (d.length > 6) return `+55 (${ddd}) ${p1}-${p2}`;
      if (d.length > 2) return `+55 (${ddd}) ${p1}`;
      if (d.length > 0) return `+55 (${ddd}`;
      return '+55 ';
    }
  
    function isValidPhone(v) {
      const d = digits(v).replace(/^55/, '');
      return d.length === 11; // padrão móvel com 9 dígitos + DDD
    }
  
    // Primeira validação
    validate();
  });