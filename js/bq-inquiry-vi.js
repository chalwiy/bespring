(() => {
  'use strict';

  const form = document.querySelector('form[data-vi-inquiry]');
  if (!form) return;

  const availability = document.getElementById('quote-service-status');
  const fallback = document.getElementById('product-inquiry-fallback');
  const status = form.querySelector('#form-status, #quote-status');
  const submit = form.querySelector('button[type="submit"]');
  const label = submit?.querySelector('span');
  const service = window.emailjs;
  const rateId = form.dataset.productInquiryRate;
  const isProduct = Boolean(form.dataset.productTitle);
  const unavailable = 'Biểu mẫu tạm thời không khả dụng. Vui lòng gửi yêu cầu đến địa chỉ email được ghi trên trang.';
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
      message = field.type === 'checkbox' ? 'Vui lòng chọn ô đồng ý để gửi yêu cầu.' : 'Vui lòng điền thông tin này.';
    } else if (field.type === 'email' && field.validity.typeMismatch) {
      message = 'Vui lòng nhập địa chỉ email hợp lệ.';
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
    if (label) label.textContent = 'Đang gửi…';
    form.setAttribute('aria-busy', 'true');
    status.classList.remove('is-error', 'is-success');
    status.textContent = 'Đang gửi…';

    try {
      await service.sendForm('service_eim9osc', 'template_z7mkti2', form);
    } catch {
      status.classList.add('is-error');
      status.textContent = 'Không gửi được yêu cầu. Vui lòng thử lại hoặc liên hệ info@bespringchem.com.';
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
    status.textContent = 'Yêu cầu của bạn đã được gửi.';
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
