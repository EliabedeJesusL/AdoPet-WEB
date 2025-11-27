// Hero dinâmico (frases + imagens)
(() => {
  const phraseEl = document.getElementById('heroPhrase');
  const imgEl = document.getElementById('heroImage');

  if (!phraseEl || !imgEl) return;

  const slides = [
    {
      text: "Seu novo melhor amigo está te esperando.",
      img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1600&auto=format&fit=crop",
    },
    {
      text: "Transforme uma vida hoje.",
      img: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1600&auto=format&fit=crop",
    },
    {
      text: "Adoção segura e rápida.",
      img: "https://images.unsplash.com/photo-1601758125946-6ec2ef64243f?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  let idx = 0;
  function nextHero() {
    idx = (idx + 1) % slides.length;
    const { text, img } = slides[idx];
    // fade leve
    imgEl.classList.add('fade');
    setTimeout(() => {
      phraseEl.textContent = text;
      imgEl.src = img;
      imgEl.classList.remove('fade');
    }, 200);
  }

  setInterval(nextHero, 4000);
})();

// Fecha offcanvas ao clicar em um link (mobile)
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