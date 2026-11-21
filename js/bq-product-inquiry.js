(() => {
  'use strict';

  const form = document.querySelector('form[data-product-inquiry-rate]');
  if (!form) return;

  const fallback = document.getElementById('product-inquiry-fallback');
  const status = form.querySelector('#quote-status');
  const submit = form.querySelector('button[type="submit"]');
  const service = window.emailjs;
  if (!status || !submit || typeof service?.init !== 'function' || typeof service.sendForm !== 'function') {
    return;
  }

  try {
    service.init({
      publicKey: "evd5fyrngOFOv_NQS",
      limitRate: { id: form.dataset.productInquiryRate, throttle: 10000 },
    });
  } catch {
    return;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.classList.remove('is-error', 'is-success');
    status.textContent = 'Sending your inquiry…';
    try {
      await service.sendForm("service_eim9osc", "template_z7mkti2", form);
      const product = form.elements.namedItem('product');
      const productName = product?.value;
      form.reset();
      if (product && productName) product.value = productName;
      status.classList.add('is-success');
      status.textContent = 'Your inquiry was submitted.';
    } catch {
      status.classList.add('is-error');
      status.textContent = 'We could not send your inquiry. Try again or email info@bespringchem.com.';
      return;
    } finally {
      form.removeAttribute('aria-busy');
      submit.disabled = false;
    }

    window.BespringAnalytics?.lead?.();
  });

  form.hidden = false;
  if (fallback) fallback.hidden = true;
})();
