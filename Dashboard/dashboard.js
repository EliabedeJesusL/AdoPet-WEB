// Hero dinâmico (frases + imagens)
(() => {
  const phraseEl = document.getElementById('heroPhrase');
  const imgEl = document.getElementById('heroImage');

  if (!phraseEl || !imgEl) return;

  const slides = [
    { text: "Seu novo melhor amigo está te esperando.", img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1600&auto=format&fit=crop" },
    { text: "Transforme uma vida hoje.", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1600&auto=format&fit=crop" },
    { text: "Adoção segura e rápida.", img: "https://images.unsplash.com/photo-1601758125946-6ec2ef64243f?q=80&w=1600&auto=format&fit=crop" },
  ];

  let idx = 0;
  function nextHero() {
    idx = (idx + 1) % slides.length;
    const { text, img } = slides[idx];
    imgEl.classList.add('fade');
    setTimeout(() => {
      phraseEl.textContent = text;
      imgEl.src = img;
      imgEl.classList.remove('fade');
    }, 200);
  }

  setInterval(nextHero, 4000);
})();

// Fecha offcanvas ao clicar em link (mobile)
(() => {
  document.body.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const offcanvasEl = link.closest('.offcanvas.show');
    if (offcanvasEl && window.bootstrap?.Offcanvas) {
      window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl).hide();
    }
  });
})();

// Debounce helper
function debounce(fn, wait = 250) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

// BUSCA: instantânea com dropdown + enter redireciona para Explorar (?term=...)
(() => {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const box = document.getElementById('searchResults');

  if (!form || !input || !box) return;

  function hideBox() { box.classList.add('d-none'); box.innerHTML = ''; }
  function showBox() { box.classList.remove('d-none'); }

  // Renderiza os resultados
  function renderResults({ animals = [], orgs = [] } = {}, term = "") {
    if ((!animals || animals.length === 0) && (!orgs || orgs.length === 0)) {
      box.innerHTML = `
        <div class="p-3 text-secondary small">Nenhum resultado para "${escapeHtml(term)}".</div>
      `;
      showBox();
      return;
    }

    const animalHTML = animals?.length ? `
      <div class="px-2 pt-2 pb-1 text-secondary small fw-semibold">Animais</div>
      ${animals.map(a => `
        <a href="/Perfil do Animal/perfil_animal.html?id=${encodeURIComponent(a.id)}"
           class="d-flex align-items-center gap-2 p-2 text-decoration-none result-item"
           data-guard="animal">
          <img src="${escapeAttr(a.foto)}" alt="${escapeAttr(a.nome)}"
               class="rounded" style="width:48px;height:48px;object-fit:cover;">
          <div class="flex-grow-1">
            <div class="text-dark small fw-semibold">${escapeHtml(a.nome)}</div>
            <div class="text-secondary small">${escapeHtml(a.especie || '')}</div>
          </div>
        </a>
      `).join('')}
    ` : '';

    const orgHTML = orgs?.length ? `
      <div class="px-2 pt-2 pb-1 text-secondary small fw-semibold">ONGs</div>
      ${orgs.map(o => `
        <div class="d-flex align-items-center gap-2 p-2 result-item">
          <img src="${escapeAttr(o.foto)}" alt="${escapeAttr(o.instituicao)}"
               class="rounded" style="width:48px;height:48px;object-fit:cover;">
          <div class="flex-grow-1">
            <div class="text-dark small fw-semibold">${escapeHtml(o.instituicao)}</div>
            <div class="text-secondary small">Instituição</div>
          </div>
        </div>
      `).join('')}
    ` : '';

    box.innerHTML = `
      ${animalHTML || ''}${orgHTML || ''}
      <div class="border-top mt-1 pt-2 px-2 pb-2 text-end">
        <a class="small" href="/Explorar/explorar.html?term=${encodeURIComponent(term)}">Ver mais em Explorar</a>
      </div>
    `;
    showBox();
  }

  // Busca instantânea (usa função exposta pelo script de banco)
  const doSearch = debounce(async () => {
    const q = (input.value || '').trim();
    if (!q) { hideBox(); return; }
    if (!window.ADO || !window.ADO.search) return; // ainda carregando banco

    try {
      const res = await window.ADO.search(q);
      renderResults(res, q);
    } catch (e) {
      box.innerHTML = `<div class="p-3 text-danger small">Erro ao buscar.</div>`;
      showBox();
    }
  }, 250);

  input.addEventListener('input', doSearch);

  // Enter → Explorar com term
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = (input.value || '').trim();
    const url = term ? `/Explorar/explorar.html?term=${encodeURIComponent(term)}` : `/Explorar/explorar.html`;
    window.location.href = url;
  });

  // Oculta ao clicar fora
  document.addEventListener('click', (e) => {
    if (!box.contains(e.target) && !form.contains(e.target)) hideBox();
  });

  // Helpers de escape (mesmo do db, duplicado aqui pro bundle simples)
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function escapeAttr(s) { return escapeHtml(s).replace(/"/g, "&quot;"); }
})();