(() => {
  const header = document.querySelector('.release-header');
  const button = header?.querySelector('.release-toggle');
  if (!button) return;
  header.classList.add('is-enhanced');
  button.addEventListener('click', () => {
    const open = header.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      header.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.focus();
    }
  });
})();
