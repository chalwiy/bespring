(() => {
  'use strict';

  const form = document.querySelector('form[data-es-inquiry]');
  if (!form) return;

  const availability = document.getElementById('quote-service-status');
  const fallback = document.getElementById('product-inquiry-fallback');
  const status = form.querySelector('#form-status, #quote-status');
  const submit = form.querySelector('button[type="submit"]');
  const label = submit?.querySelector('span');
  const service = window.emailjs;
  const rateId = form.dataset.productInquiryRate;
  const isProduct = Boolean(form.dataset.productTitle);
  const unavailable = 'El formulario no está disponible temporalmente. Envíe su solicitud al correo indicado arriba.';
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
      message = field.type === 'checkbox' ? 'Marque esta casilla antes de enviar la solicitud.' : 'Complete este campo.';
    } else if (field.type === 'email' && field.validity.typeMismatch) {
      message = 'Introduzca una dirección de correo electrónico válida.';
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
    if (label) label.textContent = 'Enviando solicitud…';
    form.setAttribute('aria-busy', 'true');
    status.classList.remove('is-error', 'is-success');
    status.textContent = 'Enviando solicitud…';

    try {
      await service.sendForm('service_eim9osc', 'template_z7mkti2', form);
    } catch {
      status.classList.add('is-error');
      status.textContent = 'No se pudo enviar la solicitud. Inténtelo de nuevo o escriba a info@bespringchem.com.';
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
    status.textContent = 'Solicitud de cotización enviada.';
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
