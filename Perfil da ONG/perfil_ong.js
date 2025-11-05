document.addEventListener('DOMContentLoaded', () => {
  // Carregar dados da instituição selecionada
  carregarDadosInstituicao();

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
    try {
      // Busca dados da instituição atual
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

// === FUNÇÃO PARA CARREGAR DADOS DA INSTITUIÇÃO ===
function carregarDadosInstituicao() {
  try {
    // Recupera dados da instituição selecionada
    const dadosArmazenados = localStorage.getItem('adopet_instituicao_selecionada');
    
    if (!dadosArmazenados) {
      console.warn('Nenhuma instituição selecionada encontrada');
      return;
    }

    const dados = JSON.parse(dadosArmazenados);
    console.log('Carregando dados da instituição:', dados);

    // Atualizar elementos da página
    atualizarPerfilInstituicao(dados);

  } catch (error) {
    console.error('Erro ao carregar dados da instituição:', error);
  }
}

// === FUNÇÃO PARA ATUALIZAR O PERFIL DA INSTITUIÇÃO ===
function atualizarPerfilInstituicao(dados) {
  // Atualizar nome da instituição
  const nomeElement = document.querySelector('#nomeInstituicao');
  if (nomeElement && dados.nome) {
    nomeElement.textContent = dados.nome;
  }

  // Atualizar título da página
  document.title = `${dados.nome || 'Instituição'} - Adopet`;

  // Atualizar logo (se disponível)
  const logoElement = document.querySelector('#logoInstituicao');
  if (logoElement) {
    if (dados.fotoUrl && dados.fotoUrl !== '') {
      logoElement.src = dados.fotoUrl;
      logoElement.alt = `Logo da ${dados.nome}`;
    } else {
      logoElement.src = `https://via.placeholder.com/180x120?text=${encodeURIComponent(dados.nome || 'ONG')}`;
      logoElement.alt = `Logo da ${dados.nome || 'Instituição'}`;
    }
  }

  // Atualizar CNPJ
  const cnpjElement = document.querySelector('#cnpjInstituicao');
  if (cnpjElement) {
    if (dados.cnpj && dados.cnpj !== '') {
      cnpjElement.textContent = `CNPJ • ${dados.cnpj}`;
    } else {
      cnpjElement.textContent = 'CNPJ • Consulte no contato';
    }
  }

  // Criar/atualizar informações de contato
  const infoContainer = document.querySelector('.card-body');
  if (infoContainer) {
    // Remover conteúdo antigo de contato se existir
    const infoExistente = infoContainer.querySelector('.info-contato');
    if (infoExistente) {
      infoExistente.remove();
    }

    // Criar nova seção de informações
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info-contato mt-3 mb-4 p-3 bg-light rounded';
    
    let infoHTML = '<h6 class="fw-semibold mb-3 text-center">📋 Informações de Contato</h6>';
    infoHTML += '<div class="row g-3 text-start">';
    
    if (dados.responsavel && dados.responsavel !== '') {
      infoHTML += `
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-person-fill text-accent"></i>
            <div>
              <small class="text-muted d-block">Responsável</small>
              <strong>${dados.responsavel}</strong>
            </div>
          </div>
        </div>
      `;
    }

    if (dados.cidade && dados.cidade !== '') {
      const localizacao = dados.estado ? `${dados.cidade}, ${dados.estado}` : dados.cidade;
      infoHTML += `
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-geo-alt-fill text-accent"></i>
            <div>
              <small class="text-muted d-block">Localização</small>
              <strong>${localizacao}</strong>
            </div>
          </div>
        </div>
      `;
    }

    if (dados.telefone && dados.telefone !== '') {
      infoHTML += `
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-telephone-fill text-accent"></i>
            <div>
              <small class="text-muted d-block">Telefone</small>
              <strong><a href="tel:${dados.telefone}" class="text-decoration-none">${dados.telefone}</a></strong>
            </div>
          </div>
        </div>
      `;
    }

    if (dados.email && dados.email !== '') {
      infoHTML += `
        <div class="col-12 col-md-6">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-envelope-fill text-accent"></i>
            <div>
              <small class="text-muted d-block">E-mail</small>
              <strong><a href="mailto:${dados.email}" class="text-decoration-none">${dados.email}</a></strong>
            </div>
          </div>
        </div>
      `;
    }

    // Adicionar timestamp da última atualização
    if (dados.timestamp) {
      const dataFormatada = new Date(dados.timestamp).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      infoHTML += `
        <div class="col-12">
          <div class="d-flex align-items-center justify-content-center gap-2 mt-2 pt-2 border-top">
            <i class="bi bi-clock-fill text-muted"></i>
            <small class="text-muted">Dados atualizados em ${dataFormatada}</small>
          </div>
        </div>
      `;
    }

    infoHTML += '</div>';
    infoDiv.innerHTML = infoHTML;

    // Inserir antes do primeiro h2
    const primeiroH2 = infoContainer.querySelector('h2');
    if (primeiroH2) {
      infoContainer.insertBefore(infoDiv, primeiroH2);
    } else {
      infoContainer.insertBefore(infoDiv, infoContainer.firstChild);
    }
  }

  console.log('Perfil da instituição atualizado com sucesso:', dados.nome);
}