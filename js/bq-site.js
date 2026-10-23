(() => {
  'use strict';
  const header = document.querySelector('.bq-header');
  const menu = header?.querySelector('.bq-menu');
  if (header && menu) {
    header.classList.add('is-ready');
    const close = () => { header.classList.remove('is-open'); menu.setAttribute('aria-expanded','false'); };
    menu.addEventListener('click', () => {
      const open = header.classList.toggle('is-open');
      menu.setAttribute('aria-expanded',String(open));
    });
    header.addEventListener('keydown', event => { if(event.key==='Escape'){close();menu.focus();} });
    header.querySelector('#bq-navigation')?.addEventListener('click', event => {if(event.target.closest('a'))close();});
  }
  const compact=window.matchMedia('(max-width:800px)');
  const setContents=()=>document.querySelectorAll('.bq-contents details').forEach(d=>{d.open=!compact.matches;});
  setContents();
  compact.addEventListener('change',setContents);
  // Tables remain ordinary, indexable HTML. Name their scrollable regions using the local heading.
  document.querySelectorAll('.bq-table').forEach((table,index) => {
    const heading=table.closest('section')?.querySelector('h2');
    if(heading){if(!heading.id)heading.id='bq-table-heading-'+index;table.setAttribute('aria-labelledby',heading.id);}
  });
})();
