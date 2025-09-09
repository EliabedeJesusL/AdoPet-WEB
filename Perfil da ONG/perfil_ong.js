document.addEventListener('DOMContentLoaded', () => {
    // Botão voltar
    const btnBack = document.getElementById('btnBack');
    btnBack?.addEventListener('click', (e) => {
      e.preventDefault();
      if (history.length > 1) history.back();
      else window.location.href = '/Explorar/explorar.html';
    });
  
    // Favoritar (toggle visual)
    const btnFav = document.getElementById('btnFav');
    btnFav?.addEventListener('click', () => {
      const icon = btnFav.querySelector('i');
      const pressed = btnFav.getAttribute('aria-pressed') === 'true';
      btnFav.setAttribute('aria-pressed', String(!pressed));
      icon.classList.toggle('bi-heart');
      icon.classList.toggle('bi-heart-fill');
      btnFav.classList.toggle('btn-outline-secondary');
      btnFav.classList.toggle('btn-accent');
    });
  
    // Botão Adotar: salva nome do pet e redireciona
    const btnAdotar = document.getElementById('btnAdotar');
    btnAdotar?.addEventListener('click', (e) => {
      e.preventDefault();
      const article = btnAdotar.closest('.pet-detail');
      const petName = article?.dataset?.petName || document.querySelector('.pet-detail h1')?.textContent?.trim() || 'Seu pet';
  
      try {
        localStorage.setItem('adopet_last_pet', petName);
        localStorage.setItem('adopet_pet_nome', petName);
      } catch {}
  
      // Redireciona exatamente para a rota solicitada
      window.location.href = '/Adoção Iniciada/adocao_iniciada.html';
    });
  
    // Offcanvas: fechar ao clicar nos links (mobile)
    const offcanvasEl = document.getElementById('menuOffcanvas');
    if (offcanvasEl && window.bootstrap?.Offcanvas) {
      const off = bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      offcanvasEl.querySelectorAll('a').forEach(a => a.addEventListener('click', () => off.hide()));
    }
  });