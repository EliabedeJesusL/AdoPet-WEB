// perfil_ong.js (módulo de UI)
import { getOngByUid, findOngByName, isLoggedIn } from "./script.js";

document.addEventListener('DOMContentLoaded', async () => {
  await carregarDadosInstituicao();

  // Botão voltar
  const btnBack = document.getElementById('btnBack');
  btnBack?.addEventListener('click', (e) => {
    e.preventDefault();
    if (history.length > 1) history.back();
    else window.location.href = '../Doe/doe.html';
  });

  // Enviar mensagem automática: preenche e abre chat
  const btnMensagem = document.getElementById('btnMensagem');
  btnMensagem?.addEventListener('click', () => {
    // Se quiser exigir login, descomente as linhas abaixo:
    // if (!isLoggedIn()) {
    //   alert('Você precisa estar logado para enviar mensagens.');
    //   window.location.href = '/index.html';
    //   return;
    // }
    try {
      const dadosInstituicao = JSON.parse(localStorage.getItem('adopet_instituicao_selecionada') || '{}');
      const nome = dadosInstituicao.nome || 'Instituição';
      const mensagem = `Olá, ${nome}! Gostaria de apoiar a instituição (doações/itens). Podemos conversar?`;
      localStorage.setItem('adopet_prefill_chat', JSON.stringify({ to: nome, message: mensagem }));
    } catch {}
    window.location.href = '../Chat/chat.html';
  });

  // Offcanvas (mobile): fechar ao clicar em algum link
  const offcanvasEl = document.getElementById('menuOffcanvas');
  if (offcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    offcanvasEl.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => off.hide()));
  }
});

// Carregar dados (localStorage → banco)
async function carregarDadosInstituicao() {
  try {
    const raw = localStorage.getItem('adopet_instituicao_selecionada');
    if (!raw) { console.warn('Nenhuma instituição selecionada encontrada'); return; }
    const local = JSON.parse(raw);

    // Busca detalhes no banco (uid → nome)
    let detalhes = null;
    if (local?.uid) detalhes = await getOngByUid(local.uid);
    else if (local?.nome) detalhes = await findOngByName(local.nome);

    // Mescla local + banco (banco tem prioridade)
    const dados = { ...local, ...(detalhes || {}) };

    atualizarPerfilInstituicao(dados);
    renderNecessidades(dados.necessidades, dados.nome || dados.instituicao || 'Instituição');
  } catch (error) {
    console.error('Erro ao carregar dados da instituição:', error);
  }
}

// Atualizar perfil (nome, título, logo, CNPJ, contato)
function atualizarPerfilInstituicao(dados) {
  const nome = dados.nome || dados.instituicao || 'Instituição';

  const nomeElement = document.querySelector('#nomeInstituicao');
  if (nomeElement) nomeElement.textContent = nome;

  document.title = `${nome} - Adopet`;

  const logoElement = document.querySelector('#logoInstituicao');
  if (logoElement) {
    const foto = dados.fotoUrl || dados.logoUrl || '';
    if (foto) {
      logoElement.src = foto;
      logoElement.alt = `Logo da ${nome}`;
    } else {
      logoElement.src = `https://via.placeholder.com/180x120?text=${encodeURIComponent(nome)}`;
      logoElement.alt = `Logo da ${nome}`;
    }
  }

  const cnpjElement = document.querySelector('#cnpjInstituicao');
  if (cnpjElement) {
    const cnpj = (dados.cnpj || '').toString().trim();
    cnpjElement.textContent = `CNPJ • ${cnpj || 'Consulte no contato'}`;
  }

  // Informações de contato no primeiro .card-body
  const infoContainer = document.querySelector('.card-body');
  if (infoContainer) {
    infoContainer.querySelector('.info-contato')?.remove();

    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-contato mt-3 mb-4 p-3 bg-light rounded';

    const partesLoc = [];
    if (temTexto(dados.cidade)) partesLoc.push(dados.cidade);
    if (temTexto(dados.estado)) partesLoc.push(dados.estado);

    let infoHTML = '<h6 class="fw-semibold mb-3 text-center">📋 Informações de Contato</h6>';
    infoHTML += '<div class="row g-3 text-start">';

    if (temTexto(dados.responsavel)) {
      infoHTML += blocoInfo('bi-person-fill', 'Responsável', escapeHtml(dados.responsavel));
    }
    if (partesLoc.length) {
      infoHTML += blocoInfo('bi-geo-alt-fill', 'Localização', escapeHtml(partesLoc.join(', ')));
    }
    if (temTexto(dados.telefone)) {
      infoHTML += blocoInfoLink('bi-telephone-fill', 'Telefone', escapeHtml(dados.telefone), `tel:${soDigitos(dados.telefone)}`);
    }
    if (temTexto(dados.email)) {
      infoHTML += blocoInfoLink('bi-envelope-fill', 'E-mail', escapeHtml(dados.email), `mailto:${dados.email}`);
    }

    if (dados.timestamp) {
      const dataFormatada = new Date(dados.timestamp).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
      infoHTML += `
        <div class="col-12">
          <div class="d-flex align-items-center justify-content-center gap-2 mt-2 pt-2 border-top">
            <i class="bi bi-clock-fill text-muted"></i>
            <small class="text-muted">Dados atualizados em ${dataFormatada}</small>
          </div>
        </div>`;
    }

    infoHTML += '</div>';
    infoDiv.innerHTML = infoHTML;

    const primeiroH2 = infoContainer.querySelector('h2');
    if (primeiroH2) infoContainer.insertBefore(infoDiv, primeiroH2);
    else infoContainer.insertBefore(infoDiv, infoContainer.firstChild);
  }

  console.log('Perfil da instituição atualizado:', nome);
}

// Renderiza “O que precisamos” a partir de "necessidades"
function renderNecessidades(textoRaw, nome) {
  let box = document.getElementById('necessidadesBox');
  const conteudo = String(textoRaw || '').trim();

  if (!box) {
    const infoContainer = document.querySelector('.card-body');
    if (!infoContainer) return;
    const wrap = document.createElement('div');
    wrap.className = 'mt-3';
    wrap.innerHTML = `
      <h6 class="fw-semibold mb-2">O que precisamos</h6>
      <div id="necessidadesBox" class="bg-light p-3 rounded"></div>`;
    const contato = infoContainer.querySelector('.info-contato');
    if (contato && contato.nextSibling) infoContainer.insertBefore(wrap, contato.nextSibling);
    else infoContainer.appendChild(wrap);
    box = wrap.querySelector('#necessidadesBox');
  }

  if (!conteudo) {
    box.innerHTML = `<div class="text-secondary small">${escapeHtml(nome)} ainda não informou necessidades específicas.</div>`;
    return;
  }

  const items = conteudo.split(/\r?\n|[;,•]/).map(s => s.trim()).filter(Boolean);
  if (items.length <= 1) {
    box.innerHTML = `<p class="m-0">${escapeHtml(conteudo)}</p>`;
  } else {
    box.innerHTML = `<ul class="m-0 ps-3">${items.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`;
  }
}

/* ===== Utils de UI ===== */
function soDigitos(s) { return String(s || '').replace(/\D+/g, ''); }
function temTexto(v) { return typeof v === 'string' && v.trim().length > 0; }
function escapeHtml(s) {
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");
}
function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }
function blocoInfo(icon, label, value) {
  return `
    <div class="col-12 col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi ${icon} text-accent"></i>
        <div>
          <small class="text-muted d-block">${escapeHtml(label)}</small>
          <strong>${value}</strong>
        </div>
      </div>
    </div>`;
}
function blocoInfoLink(icon, label, value, href) {
  return `
    <div class="col-12 col-md-6">
      <div class="d-flex align-items-center gap-2">
        <i class="bi ${icon} text-accent"></i>
        <div>
          <small class="text-muted d-block">${escapeHtml(label)}</small>
          <strong><a href="${escapeAttr(href)}" class="text-decoration-none">${value}</a></strong>
        </div>
      </div>
    </div>`;
}