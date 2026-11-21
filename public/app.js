// Snacks Distribution Wholesale — pallet meter, quote cart, signup/login and forms. No framework.
(function () {
  var D = window.__D || {}, MIN = window.__MIN || 250, IN = window.__IN === 1;
  var KEY = "sdw-cart", PKEY = "sdw-prices", PAYPAL_MAX = 3000, PAYID_MAX = 10000;
  var get = function (k) { try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch (e) { return {}; } };
  var put = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(n); };
  var clamp = function (n) { n = parseInt(n, 10); return isNaN(n) ? 0 : Math.max(0, Math.min(999, n)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  function totals() {
    var c = get(KEY), pr = get(PKEY), cases = 0, sum = 0;
    Object.keys(c).forEach(function (s) { cases += c[s]; sum += c[s] * (pr[s] || 0); });
    return { cases: cases, sum: sum };
  }
  function setQty(slug, q, price) {
    var c = get(KEY); q = clamp(q);
    if (q > 0) c[slug] = q; else delete c[slug];
    put(KEY, c);
    if (price) { var pr = get(PKEY); pr[slug] = price; put(PKEY, pr); }
    refresh();
  }
  function refresh() {
    var x = totals(), pct = Math.min(100, (x.cases / MIN) * 100);
    $$("[data-cart-count]").forEach(function (b) { b.textContent = x.cases; });
    $$("[data-meter]").forEach(function (b) { b.style.width = pct + "%"; b.classList.toggle("full", x.cases >= MIN); });
    var bar = $("[data-bar]");
    if (bar) {
      bar.hidden = x.cases === 0;
      $("[data-bar-cases]").textContent = x.cases;
      $("[data-bar-pallets]").textContent = (x.cases / 50).toFixed(1);
      $("[data-bar-sum]").textContent = fmt(x.sum);
      bar.classList.toggle("ok", x.cases >= MIN);
    }
    var c = get(KEY);
    $$(".step").forEach(function (st) {
      var inp = st.querySelector("input"), v = c[st.dataset.slug] || 0;
      if (document.activeElement !== inp) inp.value = v;
      st.classList.toggle("on", v > 0);
    });
  }

  $$(".step").forEach(function (st) {
    var inp = st.querySelector("input"), price = parseFloat(st.dataset.price) || 0;
    st.addEventListener("click", function (e) {
      var d = e.target.dataset && e.target.dataset.d; if (!d) return;
      var step = (clamp(inp.value) === 0 && d === "1") ? 10 : 1; // first tap adds 10 cartons
      setQty(st.dataset.slug, clamp(inp.value) + step * parseInt(d, 10), price);
    });
    inp.addEventListener("change", function () { setQty(st.dataset.slug, inp.value, price); });
  });
  refresh();
  window.addEventListener("storage", refresh);

  function post(url, body) {
    return fetch(url, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); });
  }
  function formBody(form) { var b = {}; new FormData(form).forEach(function (v, k) { b[k] = v; }); return b; }
  function fail(form, btn, label, msg) {
    var err = $("[data-error]", form); err.textContent = msg || "Something went wrong. Please try again."; err.hidden = false;
    btn.disabled = false; btn.innerHTML = label;
    if (window.turnstile) try { window.turnstile.reset(); } catch (e) {}
  }

  // Signup + login
  $$("[data-auth]").forEach(function (form) {
    var abn = form.querySelector('[name="abn"]');
    if (abn) abn.addEventListener("input", function () {
      var d = abn.value.replace(/\D/g, "").slice(0, 11);
      abn.value = d.replace(/^(\d{2})(\d{0,3})(\d{0,3})(\d{0,3}).*/, function (_, a, b, c, e) { return [a, b, c, e].filter(Boolean).join(" "); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]'), label = btn.innerHTML;
      $("[data-error]", form).hidden = true; btn.disabled = true; btn.textContent = "One moment…";
      post("/api/" + form.dataset.auth, formBody(form)).then(function (r) {
        if (!r.ok) return fail(form, btn, label, r.error);
        var go = function () { location.href = form.dataset.next || "/shop"; };
        if (form.dataset.auth === "signup") adsConv("signup", "", go); else go();
      }).catch(function () { fail(form, btn, label); });
    });
  });

  // Cart page
  var linesEl = $("[data-cart-lines]");
  if (linesEl && D.products) {
    var pr = get(PKEY); Object.keys(D.products).forEach(function (s) { pr[s] = D.products[s][1]; }); put(PKEY, pr);
    var form = $("[data-order]"), payBy = $("[data-payby]");
    var day = function (o) { var d = new Date(); d.setDate(d.getDate() + o); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
    payBy.min = day(0); payBy.max = day(3); payBy.value = day(0);
    var render = function () {
      var c = get(KEY), slugs = Object.keys(c).filter(function (s) { return D.products[s]; }), cases = 0, sub = 0;
      Object.keys(c).forEach(function (s) { if (!D.products[s]) delete c[s]; }); put(KEY, c);
      if (!slugs.length) linesEl.innerHTML = '<p class="empty">Your quote cart is empty. <a href="/shop">Open the order sheet →</a></p>';
      else linesEl.innerHTML = slugs.map(function (s) {
        var p = D.products[s], q = c[s]; cases += q; sub += q * p[1];
        return '<div class="line"><div><b>' + esc(p[0]) + '</b><br><span class="muted small">' + esc(p[2]) + " · " + fmt(p[1]) +
          '</span></div><input type="number" min="0" max="999" value="' + q + '" data-q="' + esc(s) + '" aria-label="Cartons"><b>' + fmt(q * p[1]) + '</b><button type="button" class="x" data-rm="' + esc(s) + '" aria-label="Remove">×</button></div>';
      }).join("");
      $("[data-total-cases]").textContent = cases;
      $("[data-total-pallets]").textContent = (cases / 50).toFixed(1);
      $("[data-subtotal]").textContent = fmt(sub);
      $("[data-prog]").style.width = Math.min(100, (cases / MIN) * 100) + "%";
      var ok = cases >= MIN, msg = $("[data-min-msg]");
      msg.textContent = ok ? "Five pallets filled — send your order below." : (MIN - cases) + " more cartons to reach 5 pallets.";
      msg.className = "small " + (ok ? "good" : "warn");
      form.hidden = !ok;
      $$('input[name="payment"]', form).forEach(function (r) {
        var off = (r.value === "paypal" && sub > PAYPAL_MAX) || (r.value === "payid" && sub > PAYID_MAX);
        r.disabled = off; if (off && r.checked) r.checked = false; r.parentNode.classList.toggle("off", off);
      });
      refresh();
    };
    render();
    linesEl.addEventListener("change", function (e) {
      var s = e.target.dataset.q; if (!s) return;
      var c = get(KEY), q = clamp(e.target.value); if (q > 0) c[s] = q; else delete c[s]; put(KEY, c); render();
    });
    linesEl.addEventListener("click", function (e) {
      var s = e.target.dataset.rm; if (!s) return; var c = get(KEY); delete c[s]; put(KEY, c); render();
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]'), label = btn.innerHTML, body = formBody(form), c = get(KEY);
      body.items = Object.keys(c).map(function (s) { return { slug: s, qty: c[s] }; });
      $("[data-error]", form).hidden = true; btn.disabled = true; btn.textContent = "Sending…";
      post("/api/order", body).then(function (r) {
        if (!r.ok) return fail(form, btn, label, r.error);
        put(KEY, {}); adsConv("quote", r.orderNumber, function () { location.href = "/thanks?n=" + encodeURIComponent(r.orderNumber); });
      }).catch(function () { fail(form, btn, label); });
    });
  }

  // Contact form
  var cf = $("[data-contact]");
  if (cf) cf.addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = cf.querySelector('button[type="submit"]'), label = btn.innerHTML;
    btn.disabled = true;
    post("/api/contact", formBody(cf)).then(function (r) {
      if (!r.ok) return fail(cf, btn, label, r.error);
      cf.innerHTML = '<p class="good big">✓ Thanks — we\'ll reply within one business day.</p>';
    }).catch(function () { fail(cf, btn, label); });
  });

  // Google Ads conversion (see src/ads.ts); waits up to 1s for the hit, then carries on.
  function adsConv(kind, id, done) {
    var called = false, next = function () { if (!called) { called = true; done(); } };
    try {
      if (window.gtag && window.__ADS) {
        var p = { send_to: __ADS.id + "/" + __ADS[kind], event_callback: next };
        if (id) p.transaction_id = id;
        gtag("event", "conversion", p); setTimeout(next, 1000);
      } else next();
    } catch (e) { next(); }
  }
})();
