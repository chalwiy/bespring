(() => {
  'use strict';

  const form = document.querySelector('form[data-ko-inquiry]');
  if (!form) return;

  const availability = document.getElementById('quote-service-status');
  const fallback = document.getElementById('product-inquiry-fallback');
  const status = form.querySelector('#form-status, #quote-status');
  const submit = form.querySelector('button[type="submit"]');
  const label = submit?.querySelector('span');
  const service = window.emailjs;
  const rateId = form.dataset.productInquiryRate;
  const isProduct = Boolean(form.dataset.productTitle);
  const unavailable = '현재 양식을 사용할 수 없습니다. 안내된 이메일 주소로 문의해 주세요.';
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
      message = field.type === 'checkbox' ? '문의를 보내려면 동의란에 체크해 주세요.' : '이 항목을 입력해 주세요.';
    } else if (field.type === 'email' && field.validity.typeMismatch) {
      message = '올바른 이메일 주소를 입력해 주세요.';
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
    if (label) label.textContent = '전송 중…';
    form.setAttribute('aria-busy', 'true');
    status.classList.remove('is-error', 'is-success');
    status.textContent = '전송 중…';

    try {
      await service.sendForm('service_eim9osc', 'template_z7mkti2', form);
    } catch {
      status.classList.add('is-error');
      status.textContent = '문의를 보내지 못했습니다. 다시 시도하거나 info@bespringchem.com으로 연락해 주세요.';
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
    status.textContent = '문의가 전송되었습니다.';
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
