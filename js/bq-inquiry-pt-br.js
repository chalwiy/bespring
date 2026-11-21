(() => {
  'use strict';

  const form = document.querySelector('form[data-pt-br-inquiry]');
  if (!form) return;

  const availability = document.getElementById('quote-service-status');
  const fallback = document.getElementById('product-inquiry-fallback');
  const status = form.querySelector('#form-status, #quote-status');
  const submit = form.querySelector('button[type="submit"]');
  const label = submit?.querySelector('span');
  const service = window.emailjs;
  const rateId = form.dataset.productInquiryRate;
  const isProduct = Boolean(form.dataset.productTitle);
  const unavailable = 'O formulário está temporariamente indisponível. Envie sua solicitação pelo e-mail acima.';
  if (!status || !submit || typeof service?.init !== 'function' || typeof service.sendForm !== 'function') {
    if (availability) availability.textContent = unavailable;
    return;
  }

  const options = { publicKey: 'evd5fyrngOFOv_NQS' };
  if (rateId) options.limitRate = { id: rateId, throttle: 10000 };
  try {
    service.init(options);
  } catch {
    if (availability) availability.textContent = unavailable;
    return;
  }

  const localizedFields = new WeakSet();
  form.addEventListener('invalid', ({ target: field }) => {
    let message;
    if (field.validity.valueMissing) {
      message = field.type === 'checkbox' ? 'Marque esta caixa antes de enviar a solicitação.' : 'Preencha este campo.';
    } else if (field.type === 'email' && field.validity.typeMismatch) {
      message = 'Informe um endereço de e-mail válido.';
    }
    if (!message) return;
    field.setCustomValidity(message);
    localizedFields.add(field);
  }, true);
  const clearValidation = ({ target: field }) => {
    if (!localizedFields.delete(field)) return;
    field.setCustomValidity('');
    if (field.validity.valid) field.removeAttribute('aria-invalid');
  };
  form.addEventListener('input', clearValidation, true);
  form.addEventListener('change', clearValidation, true);

  const initialLabel = label?.textContent;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    if (label) label.textContent = 'Enviando solicitação…';
    form.setAttribute('aria-busy', 'true');
    status.classList.remove('is-error', 'is-success');
    status.textContent = 'Enviando solicitação…';

    try {
      await service.sendForm('service_eim9osc', 'template_z7mkti2', form);
    } catch {
      status.classList.add('is-error');
      status.textContent = 'Não foi possível enviar a solicitação. Tente novamente ou escreva para info@bespringchem.com.';
      if (fallback) fallback.hidden = false;
      return;
    } finally {
      form.removeAttribute('aria-busy');
      submit.disabled = false;
      if (label) label.textContent = initialLabel;
    }

    const product = form.elements.namedItem('product');
    const productName = product?.value;
    form.reset();
    if (isProduct && product && productName) product.value = productName;
    status.classList.add('is-success');
    status.textContent = 'Solicitação de cotação enviada.';
    if (fallback) fallback.hidden = true;
    try {
      window.BespringAnalytics?.lead?.();
    } catch {
      // A reporting error does not change the successful submission state.
    }
  });

  form.hidden = false;
  if (fallback) fallback.hidden = true;
})();
