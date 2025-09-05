(() => {
  const STORAGE_KEY = 'adopet_read_chats';

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const chatList = $('.chat-list');
  if (!chatList) return; // não está na tela de mensagens

  const chatItems = $$('.chat-item', chatList);

  // Util - ID estável por item (prefira usar data-chat-id no HTML)
  const getChatId = (item, index) =>
    item.dataset.chatId ||
    `${item.querySelector('.name')?.textContent.trim().toLowerCase() || 'chat'}|${index}`;

  // ===== Persistência de lidos =====
  const loadReadSet = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch {
      return new Set();
    }
  };
  const saveReadSet = (set) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch {}
  };

  let readSet = loadReadSet();

  const markAsRead = (item) => {
    item.classList.remove('unread');
    const badge = $('.badge-unread', item);
    if (badge) badge.remove();

    // Opcional: trocar ícone de status para "lido" (check duplo)
    const statusIcon = $('.status i', item);
    if (statusIcon && !statusIcon.classList.contains('bi-check2-all')) {
      statusIcon.classList.remove('bi-check2');
      statusIcon.classList.add('bi-check2-all');
      statusIcon.parentElement?.classList.remove('opacity-50');
      statusIcon.parentElement?.classList.add('text-accent');
    }
  };

  // Hidratar estado inicial a partir do localStorage
  chatItems.forEach((item, i) => {
    const id = getChatId(item, i);
    if (readSet.has(id)) markAsRead(item);

    // Ao clicar, marcar como lido e persistir
    item.addEventListener('click', () => {
      if (!readSet.has(id)) {
        markAsRead(item);
        readSet.add(id);
        saveReadSet(readSet);
      }
    });
  });

  // ===== Filtro via busca do header =====
  const searchInput = $('header input[type="search"]');
  const noResults = document.createElement('div');
  noResults.className = 'text-center text-secondary py-4';
  noResults.textContent = 'Nenhum contato encontrado';

  const filterChats = (term) => {
    const t = (term || '').trim().toLowerCase();
    let visible = 0;

    chatItems.forEach((item) => {
      const name = $('.name', item)?.textContent.toLowerCase() || '';
      const snippet = $('.snippet', item)?.textContent.toLowerCase() || '';
      const match = !t || name.includes(t) || snippet.includes(t);
      item.classList.toggle('d-none', !match);
      if (match) visible++;
    });

    if (visible === 0) {
      if (!noResults.isConnected) chatList.parentElement?.appendChild(noResults);
    } else if (noResults.isConnected) {
      noResults.remove();
    }
  };

  if (searchInput) {
    searchInput.addEventListener('input', (e) => filterChats(e.target.value));
  }

  // ===== Offcanvas: fechar ao clicar nos links =====
  const offcanvasEl = $('#menuOffcanvas');
  if (offcanvasEl && window.bootstrap?.Offcanvas) {
    const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
    $$('a', offcanvasEl).forEach((a) => {
      a.addEventListener('click', () => off.hide());
    });
  }

  // Expor utilitário para marcar tudo como lido (para debug/ação futura)
  window.markAllChatsAsRead = () => {
    chatItems.forEach((item, i) => {
      markAsRead(item);
      readSet.add(getChatId(item, i));
    });
    saveReadSet(readSet);
  };
})();