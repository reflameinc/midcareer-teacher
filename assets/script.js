/* =============================================================================
   script.js — REFLAME 教員向けLP
   やっていること
     1) data.js の配列から「事例 / アドバイザー / FAQ」を描画する
     2) スクロールに合わせたフェードイン
     3) モバイル下部の追従CTA（200px以降でフェードイン）
     4) CTAクリック時に dataLayer へイベントを push（Metaピクセルの差し込み位置つき）
   ============================================================================= */
(function () {
  'use strict';

  var data = (typeof LP_DATA !== 'undefined') ? LP_DATA : { cases: [], advisors: [], faqs: [] };

  /* --- 小さなヘルパ --------------------------------------------------------- */
  function el(tag, className, text) {
    var n = document.createElement(tag);
    if (className) { n.className = className; }
    if (text !== undefined && text !== null) { n.textContent = text; }
    return n;
  }

  /* 画像があれば <img>、無ければグレーのプレースホルダを返す */
  function media(src, ratioClass, label) {
    if (src) {
      var img = el('img', 'card__img');
      img.src = src;
      img.alt = label;
      img.loading = 'lazy';
      img.decoding = 'async';
      return img;
    }
    var ph = el('figure', 'ph ' + ratioClass + ' card__img');
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', '画像プレースホルダ：' + label);
    var sp = el('span', 'ph__label', label);
    ph.appendChild(sp);
    return ph;
  }

  /* --- 1) 転職事例カード ---------------------------------------------------- */
  function renderCases() {
    var list = document.getElementById('case-list');
    if (!list || !data.cases) { return; }
    data.cases.forEach(function (c, i) {
      var li = el('li', 'card reveal');
      /* 画像は任意。data.js の image が空ならカードに画像枠を作らない（縦に長くなるため） */
      if (c.image) { li.appendChild(media(c.image, 'ph--4x3', c.jobAfter + 'へ転職した方')); }
      li.appendChild(el('p', 'card__meta', c.age + '歳・' + c.gender + '・' + c.school));
      li.appendChild(el('span', 'card__arrow'));
      li.appendChild(el('p', 'card__job', c.jobAfter));
      if (c.note) { li.appendChild(el('p', 'card__note', c.note)); }
      list.appendChild(li);
    });
    setSampleNote('case-disclaimer');
  }

  /* --- 2) アドバイザー ------------------------------------------------------ */
  function renderAdvisors() {
    var list = document.getElementById('advisor-list');
    if (!list || !data.advisors) { return; }
    data.advisors.forEach(function (a, i) {
      var li = el('li', 'card reveal');
      li.appendChild(media(a.image, 'ph--1x1', 'assets/advisor-0' + (i + 1) + '.jpg'));
      li.appendChild(el('p', 'card__name', a.name));
      li.appendChild(el('p', 'card__role', a.role));
      li.appendChild(el('p', 'card__words', a.words));
      list.appendChild(li);
    });
    setSampleNote('advisor-disclaimer');
  }

  /* --- 3) FAQ（details/summary = JSなしでも開閉できる形） ------------------- */
  function renderFaqs() {
    var wrap = document.getElementById('faq-list');
    if (!wrap || !data.faqs) { return; }
    data.faqs.forEach(function (f, i) {
      var item = el('details', 'faq__item reveal');
      if (i === 0) { item.open = true; }
      var q = el('summary', 'faq__q', f.q);
      var a = el('p', 'faq__a', f.a);
      item.appendChild(q);
      item.appendChild(a);
      wrap.appendChild(item);
    });
  }

  function setSampleNote(id) {
    var n = document.getElementById(id);
    if (!n) { return; }
    if (data.showSampleNote) { n.textContent = data.sampleNoteText || ''; }
    else { n.remove(); }
  }

  /* --- 4) スクロールでフェードイン ------------------------------------------ */
  function initReveal() {
    var targets = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(targets, function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(targets, function (t) { io.observe(t); });
  }

  /* --- 5) 追従CTA（200pxを超えたら表示） ------------------------------------ */
  function initStickyCta() {
    var bar = document.getElementById('sticky-cta');
    if (!bar) { return; }
    bar.hidden = false;
    var SHOW_AT = 200;
    var ticking = false;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      bar.classList.toggle('is-visible', y > SHOW_AT);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* --- 6) CTAクリックの計測 -------------------------------------------------- */
  function pushCtaEvent(location) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'cta_click',          // GTMのトリガー名はこれに合わせる
      lp: 'midcareer_teacher',     // LP別に分解するための識別子（他LPと共通の付け方）
      cta_type: 'line_register',
      cta_location: location,      // hero / after_reasons / after_cases / final / sticky_bar
      page_type: 'lp_teacher'
    });

    /* ▼ Metaピクセルを直接入れる場合はこの位置で送る（GTM経由ならGTM側で設定する）
       if (typeof fbq === 'function') {
         fbq('track', 'Lead', { content_name: 'line_register', content_category: location });
       }
    */
  }

  function initCtaTracking() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest ? e.target.closest('[data-cta]') : null;
      if (!target) { return; }
      pushCtaEvent(target.getAttribute('data-cta'));
    }, false);
  }

  /* --- 起動 ------------------------------------------------------------------ */
  function init() {
    renderCases();
    renderAdvisors();
    renderFaqs();
    initReveal();      // ← カード描画のあとに呼ぶこと（生成要素も監視対象にするため）
    initStickyCta();
    initCtaTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
