(() => {
  'use strict';
  const cfg = window.LP_CONFIG;
  const $ = (selector) => document.querySelector(selector);
  const creative = document.documentElement.dataset.creative;
  const attributionKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'creative'];
  const storageKey = 'reflame-attribution-v1';
  let attribution = {};
  // 個人情報・URL全体・任意のクエリを保存しない。流入情報だけを同一タブ内に30分保持。
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    if (saved && saved.expires > Date.now()) attribution = saved.values || {};
    else sessionStorage.removeItem(storageKey);
  } catch (_) { /* ストレージを拒否されてもページとフォームは動作する。 */ }
  const params = new URLSearchParams(location.search);
  const incoming = {};
  attributionKeys.forEach((key) => {
    const value = params.get(key);
    if (value && value.length <= 160 && /^[a-zA-Z0-9_\-.~]+$/.test(value) && (key !== 'creative' || ['ranking', 'skills'].includes(value))) incoming[key] = value;
  });
  if (!Object.keys(attribution).length && Object.keys(incoming).length) {
    attribution = incoming;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ values: attribution, expires: Date.now() + 30 * 60 * 1000 })); } catch (_) {}
  }
  // イベントは許可したメタデータのみ。ID未設定の初期状態では外部・dataLayerとも送信しない。
  const seen = new Set();
  function emit(event, metadata = {}, onceKey = '') {
    if (onceKey && seen.has(onceKey)) return;
    if (onceKey) seen.add(onceKey);
    const detail = { event, lp: 'midcareer_teacher', creative, ...(metadata.cta_location ? { cta_location: metadata.cta_location } : {}) };
    document.dispatchEvent(new CustomEvent('reflame:analytics', { detail }));
    if (cfg.tracking.enabled && /^GTM-[A-Z0-9]+$/.test(cfg.tracking.gtmId)) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(detail);
    }
  }
  document.querySelectorAll('[data-brand]').forEach((node) => { node.textContent = cfg.brand || 'REFLAME'; });
  document.title = '教員経験を、次の選択肢へ。｜' + (cfg.brand || 'REFLAME');
  const safeUrl = (value) => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch (_) { return ''; } };
  function link(selector, value) { const url = safeUrl(value); if (url) { $(selector).href = url; $(selector).hidden = false; } return url; }
  link('#company-link', cfg.companyUrl);
  link('#footer-privacy', cfg.privacyUrl);
  if (cfg.legalCompanyName) { $('#operator').hidden = false; $('#operator').textContent = cfg.legalCompanyName + (cfg.licenseNumber ? ' ｜ 有料職業紹介事業許可番号 ' + cfg.licenseNumber : ''); }
  if (cfg.salary.enabled && cfg.salary.evidence) {
    document.querySelectorAll('[data-salary]').forEach((node, i) => {
      if (cfg.salary.values[i]) { node.hidden = false; node.textContent = '想定年収：' + cfg.salary.values[i] + '。制作時点の想定値です。経験・企業・求人条件で異なり、現在の求人や自社実績を示すものではありません。'; }
    });
  }
  if (cfg.assets.heroImage && (/^assets\/[a-zA-Z0-9_./-]+\.(svg|png|jpg|jpeg|webp)$/.test(cfg.assets.heroImage) || safeUrl(cfg.assets.heroImage))) {
    const illustration = document.createElement('img'); illustration.alt = ''; illustration.src = cfg.assets.heroImage; illustration.style.width = '100%';
    illustration.onload = () => $('.hero-art svg').replaceWith(illustration);
  }

  // 未添付アセットは空の枠や壊れた画像にしない。任意動画のみ、設定後に表示。
  const media = document.createElement('section');
  media.className = 'optional-media';
  let videoCount = 0;
  [['rankingVideo', '教員経験が活きる仕事'], ['skillsVideo', '学校で培った強み']].forEach(([key, title]) => {
    const value = cfg.assets[key];
    if (!value || (!/^assets\/[a-zA-Z0-9_./-]+\.mp4$/.test(value) && !safeUrl(value))) return;
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = title + 'を動画で見る';
    const video = document.createElement('video'); video.controls = true; video.preload = 'none'; video.playsInline = true; video.style.width = '100%'; video.setAttribute('aria-label', title);
    details.addEventListener('toggle', () => { if (details.open && !video.src) video.src = value; if (!details.open) video.pause(); });
    details.append(summary, video); media.append(details); videoCount++;
  });
  if (videoCount) $('.possibilities').append(media);
  // 予約ボタンはページ内の予約フォーム（#reflame-booking）へ移動するだけ。予約ページへは飛ばさない。
  // 予約フォームは SF日程調整ツールの埋め込み（枠 mid-ad-mk）。流入情報はフォーム自身がページのURLから送る。
  // 予約完了（schedule_complete）もフォーム自身が dataLayer に送るため、ここでは送らない（送ると1件が2回数えられる）。
  document.querySelectorAll('[data-cta]').forEach((anchor) => {
    anchor.addEventListener('click', () => emit('cta_click', { cta_location: anchor.dataset.cta }));
  });
  emit('lp_view', {}, 'lp_view');
  const sticky = $('#sticky-cta');
  const heroCta = $('.hero-copy .button');
  const finalCta = $('#reflame-booking');
  function inView(node) {
    const r = node.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight;
  }
  function updateSticky() {
    sticky.hidden = inView(heroCta) || inView(finalCta);
  }
  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; updateSticky(); });
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  updateSticky();
  // 予約フォームは予約ツールの描画領域（shadowRoot）の中にあり、ページのCSSが届かない。スマホでは中の11〜13pxの文字をここで14pxに上げる（予約ツールが描き直しても付け直す）。
  const bookingFontCss = '@media (max-width:768px){label,.step,.fe,.wk-lbl,.wk-hint,.wk-head .wk-dow,.date,.who-bio,.who-back{font-size:14px!important}}';
  let bookingTries = 0;
  (function liftBookingFontSize() {
    const root = document.getElementById('reflame-booking-widget')?.shadowRoot;
    if (!root) { if (++bookingTries < 120) setTimeout(liftBookingFontSize, 250); return; }
    const paint = () => {
      if (root.getElementById('rf-font-14')) return;
      const style = document.createElement('style');
      style.id = 'rf-font-14';
      style.textContent = bookingFontCss;
      root.appendChild(style);
    };
    paint();
    new MutationObserver(paint).observe(root, { childList: true });
  })();
})();
