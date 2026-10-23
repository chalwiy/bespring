(() => {
'use strict';
const header=document.querySelector('.bq-header');
const menu=header?.querySelector('.bq-menu');
const closeMenu=()=>{header?.classList.remove('is-open');menu?.setAttribute('aria-expanded','false');};
if(header&&menu){header.classList.add('is-ready');menu.addEventListener('click',()=>{const open=header.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));});}
const disclosures=Array.from(header?.querySelectorAll('details')||[]);
disclosures.forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)disclosures.forEach(other=>{if(other!==detail)other.open=false;});}));
document.addEventListener('click',event=>{if(!header?.contains(event.target)){disclosures.forEach(d=>d.open=false);closeMenu();}});
header?.addEventListener('keydown',event=>{if(event.key==='Escape'){disclosures.forEach(d=>d.open=false);closeMenu();menu?.focus();}});
header?.querySelector('#bq-navigation')?.addEventListener('click',event=>{if(event.target.closest('a')){closeMenu();disclosures.forEach(d=>d.open=false);}});
document.querySelectorAll('.bq-table').forEach((region,index)=>{const heading=region.closest('section')?.querySelector('h2');if(heading){if(!heading.id)heading.id='bq-table-heading-'+index;region.setAttribute('aria-labelledby',heading.id);}});
})();

(() => {
 'use strict';
 const data=document.getElementById('bq-product-data');
 const create=(tag,className,value)=>{const e=document.createElement(tag);if(className)e.className=className;if(value!==undefined)e.textContent=value;return e;};
 const fold=value=>String(value).normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[‐‑–—]/g,'-').replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-0x660)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-0x6f0)).trim();
 const params=new URLSearchParams(location.search);
 if(data){
  const {copy,defaultCategory}=JSON.parse(data.textContent);
  const items=(window.BQ_PRODUCT_INDEX||[]).map(p=>({...p,href:(document.body.dataset.siteRoot||'')+p.href}));
  const container=document.querySelector('[data-search-interface]');
  const form=container.querySelector('[data-product-search]'),query=form.elements.q,category=form.elements.category;
  const results=container.querySelector('[data-search-results]'),status=container.querySelector('[data-search-status]');
  let limit=12;
  query.value=(params.get('q')||'').slice(0,160);
  const chosen=params.get('category');
  if(chosen&&[...category.options].some(o=>o.value===chosen))category.value=chosen;
  const index=items.map(p=>({...p,terms:fold(p.name+' '+p.english+' '+p.aliases+' '+p.cas.join(' ')),digits:p.cas.map(c=>c.replace(/\D/g,''))}));
  function render(){
   const q=fold(query.value),tokens=q.split(/\s+/).filter(Boolean),digits=q.replace(/\D/g,'');
   const onlyCas=/^[\d\s-]+$/.test(q)&&digits.length>=3;
   const matches=index.filter(p=>(!category.value||p.category===category.value)&&(onlyCas?p.digits.some(c=>c.includes(digits)):tokens.every(t=>p.terms.includes(t))));
   if(q)matches.sort((a,b)=>Number(b.cas.includes(q))-Number(a.cas.includes(q)));
   results.replaceChildren();
   for(const p of matches.slice(0,limit)){
    const item=create('article','bq-result');const title=create('h3');const link=create('a','',p.name);link.href=p.href;title.append(link);item.append(title);
    if(fold(p.name)!==fold(p.english)){const english=create('p','bq-result-english',p.english);english.lang='en';item.append(english);}
    const meta=create('div','bq-result-meta');meta.append(create('span','',p.categoryName));
    if(p.cas.length){const cas=create('bdi','bq-result-cas','CAS '+p.cas.join(' / '));cas.dir='ltr';meta.append(cas);}item.append(meta);
    const action=create('a','bq-result-action',copy.details+' ↗');action.href=p.href;item.append(action);results.append(item);
   }
   status.textContent=matches.length?copy.resultsLabel+': '+Math.min(limit,matches.length)+' / '+matches.length:copy.empty;
   if(matches.length>limit){const more=create('button','bq-load-results',copy.moreResults+' (+'+Math.min(24,matches.length-limit)+')');more.type='button';more.addEventListener('click',()=>{limit+=24;render();});results.append(more);}
  }
  form.addEventListener('submit',e=>{e.preventDefault();limit=12;render();});
  query.addEventListener('input',()=>{limit=12;render();});category.addEventListener('change',()=>{limit=12;render();});
  form.addEventListener('reset',e=>{e.preventDefault();query.value='';category.value='';limit=12;render();query.focus();});
  container.hidden=false;render();
 }
 const labels=JSON.parse(document.getElementById('bq-interface-copy')?.textContent||'{}');
 const product=(params.get('product')||'').slice(0,200).trim();
 const request=['TDS','SDS','COA'].includes(params.get('request'))?params.get('request'):'';
 const origin=params.get('source')||'';
 const source=/^(?!\/)(?!.*\.\.)[a-zA-Z0-9_\-/.]+\.html$/.test(origin)?origin:'';
 document.querySelectorAll('[data-inquiry-form]').forEach(form=>{
  const field=form.querySelector('[name="product"]');const value=product||form.dataset.productTitle;
  if(field&&value&&(product||!field.value))field.value=value;
  const context=form.querySelector('[data-inquiry-context]');
  if(context&&(product||request)){
   context.hidden=false;context.append(create('strong','',labels.context));context.append(create('p','',value+(request?' · '+request:'')));
   if(source){const link=create('a','',labels.source+' ↗');link.href=(document.body.dataset.siteRoot||'')+source;context.append(link);}
  }
  const message=form.querySelector('[name="message"]');
  if(message&&request&&!message.value){message.value=labels.request+': '+request+(source?'\n'+labels.source+': https://www.bespringchem.com/'+source:'')+'\n';}
  form.addEventListener('invalid',e=>{e.target.setAttribute('aria-invalid','true');},true);
  form.addEventListener('input',e=>{if(e.target.validity?.valid)e.target.removeAttribute('aria-invalid');});
 });
 function revealFragment(){
  if(!location.hash)return;
  let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{return;}
  if(!target)return;
  let parent=target.parentElement;
  while(parent){if(parent.tagName==='DETAILS')parent.open=true;parent=parent.parentElement;}
 }
 revealFragment();window.addEventListener('hashchange',revealFragment);
})();
