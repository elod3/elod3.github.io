/* Trecerea între pagini, ca o tăietură de film: cadrul din „Următorul” devine hero-ul paginii noi.
   Stă în <head>, ca să prindă `pagereveal` înainte de primul cadru. */
window.__vt = false;
addEventListener('pagereveal', (e) => {
  if (!e.viewTransition) return;
  window.__vt = true;
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  hero.style.viewTransitionName = 'hero-img';
  e.viewTransition.finished.finally(() => { hero.style.viewTransitionName = ''; });
});
addEventListener('pageswap', (e) => {
  if (!e.viewTransition) return;
  const next = document.querySelector('.next.is-going .next__img');
  if (next) next.style.viewTransitionName = 'hero-img';
});
