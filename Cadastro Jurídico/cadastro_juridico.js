document.addEventListener('DOMContentLoaded', () => {
  const TEST_MODE = true;

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

  // Botão voltar
  btnVoltar?.addEventListener('click', () => {
    if (history.length > 1) history.back();
    else window.location.href = '/Conta/conta.html';
  });

  // Preview da logo
  upload?.addEventListener('change', () => {
    const file = upload.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    img.src = url;
    img.classList.remove('d-none');
    placeholder.classList.add('d-none');
  });

  // Máscaras / contadores
  cnpj.addEventListener('input', () => { cnpj.value = maskCNPJ(cnpj.value); });
  telefone.addEventListener('input', () => { telefone.value = maskPhone(telefone.value); });
  necessidades.addEventListener('input', () => { necCounter.textContent = `${necessidades.value.length}/500`; });

  // Habilita envio no modo teste
  if (TEST_MODE) {
    btnSubmit.disabled = false;
  }

  // --------- Utils ----------
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
