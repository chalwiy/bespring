(function(){
  const form=document.getElementById('quote-form');
  const status=document.getElementById('quote-status');
  if(!form||!status)return;
  const product=form.elements.product?.value||'Producto alimentario';
  if(window.emailjs){
    window.emailjs.init({publicKey:'evd5fyrngOFOv_NQS',limitRate:{id:location.pathname+'-quote',throttle:10000}});
  }
  form.addEventListener('submit',function(event){
    event.preventDefault();
    if(!window.emailjs){status.textContent='No se pudo enviar el formulario. Escriba a info@bespringchem.com.';return;}
    status.textContent='Enviando consulta…';
    window.emailjs.sendForm('service_eim9osc','template_z7mkti2',form).then(function(){
      window.BespringAnalytics?.lead();
      status.textContent='Gracias. Hemos recibido su consulta.';
      form.reset();
      form.elements.product.value=product;
    }).catch(function(){status.textContent='No se pudo enviar el formulario. Escriba a info@bespringchem.com.';});
  });
})();
