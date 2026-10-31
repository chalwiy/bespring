/* Bespring GA4: one shared implementation; optional analytics, no form values. */
(() => {
  'use strict';
  if (window.BespringAnalytics) return;
  const ID = 'G-T70CEC8BCT';
  const KEY = 'bespring.analytics-consent.v1';
  const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  const production = location.protocol === 'https:' && location.hostname === 'www.bespringchem.com';
  const language = (document.documentElement.lang || 'en').toLowerCase();
  const copy = {
/* five-language-copy */
    fr: ["Statistiques du site", "Autorisez-vous les cookies Google Analytics pour mesurer les visites et les interactions ? Vous pouvez envoyer une demande sans les accepter.", "Accepter les statistiques", "Refuser les statistiques", "Paramètres des statistiques"],
    ja: ["アクセス解析", "訪問やサイト内の操作を計測するため、Google Analytics の Cookie の使用を許可しますか？許可しなくてもお問い合わせいただけます。", "解析を許可", "解析を拒否", "解析の設定"],
    ko: ["웹사이트 분석", "방문 및 사이트 이용을 분석하기 위한 Google Analytics 쿠키를 허용하시겠습니까? 허용하지 않아도 문의를 보낼 수 있습니다.", "분석 허용", "분석 거부", "분석 설정"],
    vi: ["Thống kê truy cập", "Bạn có cho phép sử dụng cookie Google Analytics để đo lường lượt truy cập và tương tác không? Bạn vẫn có thể gửi yêu cầu mà không cần cho phép.", "Cho phép thống kê", "Từ chối thống kê", "Cài đặt thống kê"],
    th: ["การวิเคราะห์เว็บไซต์", "คุณอนุญาตให้ใช้คุกกี้ Google Analytics เพื่อวัดการเข้าชมและการใช้งานเว็บไซต์หรือไม่ คุณยังส่งคำสอบถามได้แม้ไม่อนุญาต", "อนุญาตการวิเคราะห์", "ปฏิเสธการวิเคราะห์", "การตั้งค่าการวิเคราะห์"],

    en: ['Website analytics', 'May we use Google Analytics cookies to measure visits and site interactions? Your inquiries work without analytics.', 'Allow analytics', 'Reject analytics', 'Analytics settings'],
    es: ['Estadísticas del sitio', '¿Podemos usar cookies de Google Analytics para medir visitas e interacciones? Puede enviar consultas sin aceptar estas cookies.', 'Aceptar estadísticas', 'Rechazar estadísticas', 'Configurar estadísticas'],
    pt: ['Estatísticas do site', 'Podemos usar cookies do Google Analytics para medir visitas e interações? Pode enviar consultas sem aceitar estes cookies.', 'Aceitar estatísticas', 'Recusar estatísticas', 'Configurar estatísticas'],
    de: ['Website-Statistik', 'Dürfen wir Google-Analytics-Cookies verwenden, um Besuche und Interaktionen zu messen? Anfragen funktionieren auch ohne diese Cookies.', 'Statistik erlauben', 'Statistik ablehnen', 'Statistik-Einstellungen'],
    ru: ['Статистика сайта', 'Разрешить файлы cookie Google Analytics для измерения посещений и взаимодействий? Отправка запросов работает и без них.', 'Разрешить аналитику', 'Отклонить аналитику', 'Настройки аналитики'],
    ar: ['إحصاءات الموقع', 'هل تسمح بملفات تعريف ارتباط Google Analytics لقياس الزيارات والتفاعلات؟ يمكنك إرسال استفساراتك دون السماح بها.', 'السماح بالإحصاءات', 'رفض الإحصاءات', 'إعدادات الإحصاءات'],
    'zh-cn': ['网站访问统计', '是否允许使用 Google Analytics Cookie 统计访问与网站互动？拒绝不影响发送询盘。', '允许统计', '拒绝统计', '统计设置'],
    'zh-tw': ['網站訪問統計', '是否允許使用 Google Analytics Cookie 統計訪問與網站互動？拒絕不影響傳送詢盤。', '允許統計', '拒絕統計', '統計設定']
  };
  const words = copy[language] || copy[language.split('-')[0]] || copy.en;
  let choice = null;
  let started = false;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved && ['granted', 'denied'].includes(saved.value) && Date.now() - saved.time >= 0 && Date.now() - saved.time < MAX_AGE) choice = saved.value;
  } catch (_) { /* Storage can be unavailable; consent remains optional. */ }
  function gtag() { window.dataLayer.push(arguments); }
  function consent(value) {
    return { analytics_storage: value, ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  }
  function start() {
    if (!production || choice !== 'granted') return;
    window['ga-disable-' + ID] = false;
    if (started) { gtag('consent', 'update', consent('granted')); return; }
    started = true;
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', consent('denied'));
    gtag('consent', 'update', consent('granted'));
    gtag('js', new Date());
    // Config sends the page view; do not also send a manual page_view event.
    gtag('config', ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_location: measurementLocation(),
      page_referrer: cleanReferrer()
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(script);
  }
  function cleanReferrer() {
    try { const u = new URL(document.referrer); return u.origin + u.pathname; } catch (_) { return ''; }
  }
  function measurementLocation() {
    const u = new URL(location.href);
    const clean = new URL(u.origin + u.pathname);
    // Retain standard campaign attribution, not arbitrary query/form parameters.
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content', 'utm_source_platform', 'gclid', 'dclid', 'gbraid', 'wbraid'].forEach(key => {
      if (u.searchParams.has(key)) clean.searchParams.set(key, u.searchParams.get(key));
    });
    return clean.href;
  }
  function clearCookies() {
    // Remove only Analytics cookies, never inquiry/session cookies.
    document.cookie.split(';').forEach(part => {
      const name = part.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      ['', '; domain=www.bespringchem.com', '; domain=.bespringchem.com'].forEach(domain => {
        document.cookie = name + '=; Max-Age=0; path=/' + domain + '; SameSite=Lax; Secure';
      });
    });
  }
  function choose(value) {
    choice = value;
    try { localStorage.setItem(KEY, JSON.stringify({ value, time: Date.now() })); } catch (_) { /* Continue for this page. */ }
    if (value === 'granted') start();
    else {
      window['ga-disable-' + ID] = true;
      if (started) gtag('consent', 'update', consent('denied'));
      clearCookies();
    }
    panel.hidden = true;
    settings.focus({ preventScroll: true });
  }
  function event(name, extra) {
    try {
      if (!production || choice !== 'granted' || !started) return;
      gtag('event', name, Object.assign({ page_language: language, page_location: measurementLocation() }, extra));
    } catch (_) { /* Analytics must never interrupt navigation or inquiry delivery. */ }
  }
  window.BespringAnalytics = Object.freeze({
    lead: () => event('generate_lead', { lead_source: 'website_inquiry' })
  });
  document.addEventListener('click', e => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    try {
      const u = new URL(a.getAttribute('href'), location.href);
      if (u.protocol === 'mailto:') event('email_click', { contact_method: 'email' });
      else if (['wa.me', 'api.whatsapp.com', 'web.whatsapp.com'].includes(u.hostname)) event('whatsapp_click', { contact_method: 'whatsapp' });
    } catch (_) { /* Ignore malformed links. */ }
  });
  // Isolated styles leave the site's templates and layout unchanged.
  const host = document.createElement('div');
  host.id = 'bespring-analytics-choice';
  const root = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = ':host{display:block;font:12px/1.5 Arial,sans-serif;color:#d8e7ec;max-width:100%}section{position:fixed;bottom:12px;inset-inline-start:12px;z-index:2147483000;color:#172b38;box-sizing:border-box;background:#fff;border:1px solid #8f9ba2;border-radius:8px;padding:16px;width:370px;max-width:calc(100% - 24px);max-height:65vh;overflow:auto;box-shadow:0 2px 12px #0002}section[hidden]{display:none}p{margin:8px 0 12px}strong{font-size:16px}button{font:inherit;cursor:pointer;border:1px solid #647985;border-radius:4px;background:#fff;color:#172b38;padding:8px;margin:3px}button:focus-visible{outline:3px solid #1671a3;outline-offset:2px}.settings{font-size:12px;padding:4px 0;border:0;background:transparent;color:inherit;min-height:38px}';
  root.appendChild(style);
  const panel = document.createElement('section');
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', words[0]);
  panel.dir = language === 'ar' ? 'rtl' : 'ltr';
  const title = document.createElement('strong'); title.textContent = words[0]; panel.appendChild(title);
  const text = document.createElement('p'); text.textContent = words[1]; panel.appendChild(text);
  ['granted', 'denied'].forEach((value, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.textContent = words[i + 2];
    button.addEventListener('click', () => choose(value)); panel.appendChild(button);
  });
  panel.hidden = !production || choice !== null;
  root.appendChild(panel);
  const settings = document.createElement('button'); settings.type = 'button'; settings.className = 'settings'; settings.textContent = words[4];
  settings.addEventListener('click', () => { panel.hidden = !panel.hidden; if (!panel.hidden) panel.querySelector('button').focus(); });
  root.appendChild(settings);
  (document.getElementById('bq-analytics-settings') || document.body).appendChild(host);
  start();
})();
