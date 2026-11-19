/*
 * motion.js (shared with tropicalsnackswholesale.eu) — reusable scroll animation engine (no dependencies, ~4 KB).
 * Works on any site: add the data-attributes below and include this file.
 *
 *  [data-story]            Tall section with a sticky stage. Scroll progress (0→1) drives everything inside.
 *    [data-chap]           Chapter text blocks — cross-fade with blur + lift as you scroll.
 *    [data-fly="i"]        Images belonging to chapter i — fly in from depth, float, fly out (3D).
 *    data-frames="/story/f-{i}.webp" data-frame-count="120"
 *                          Optional on [data-story]: plays an image sequence on a <canvas data-canvas>,
 *                          scrubbed by scroll (Apple-style). Export any video to frames:
 *                          ffmpeg -i clip.mp4 -vf "fps=24,scale=1600:-1" -c:v libwebp -q:v 70 f-%d.webp
 *    [data-dot]            Progress dots (one per chapter).
 *  [data-reveal]           Fades/lifts in when it enters the screen. data-reveal="left|right|zoom" for variants.
 *  [data-split]            Headline reveals word by word.
 *  [data-stagger]          Children reveal one after another.
 *  [data-count]            Number counts up from 0 when visible.
 *  [data-parallax="0.15"]  Moves slower/faster than the page.
 * Honors prefers-reduced-motion (everything shows instantly).
 */
(function () {
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  root.classList.add("js-motion");
  if (reduce) { root.classList.add("no-motion"); return; }

  // Split headlines into words (keeps text readable for screen readers and search engines).
  $$("[data-split]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span style="transition-delay:' + (i * 70) + 'ms">' + w + "</span></span>";
    }).join(" ");
  });
  $$("[data-stagger]").forEach(function (el) {
    Array.prototype.forEach.call(el.children, function (c, i) { c.style.transitionDelay = Math.min(i, 12) * 60 + "ms"; });
  });

  // Reveal on enter
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.hasAttribute("data-count")) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0 });
  $$("[data-reveal],[data-split],[data-stagger],[data-count]").forEach(function (el) { io.observe(el); });

  function countUp(el) {
    var end = parseFloat(el.getAttribute("data-count")), t0 = performance.now(), dur = 1400;
    (function tick(t) {
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // Scroll-driven parts
  var stories = $$("[data-story]").map(setupStory);
  var par = $$("[data-parallax]");
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function frame() {
    ticking = false;
    var vh = innerHeight;
    stories.forEach(function (s) { s.update(vh); });
    par.forEach(function (el) {
      var r = el.getBoundingClientRect(), k = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      el.style.transform = "translate3d(0," + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + "px,0)";
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  frame();

  function setupStory(sec) {
    var chaps = $$("[data-chap]", sec), n = chaps.length || 1;
    var flies = $$("[data-fly]", sec), dots = $$("[data-dot]", sec);
    var canvas = sec.querySelector("[data-canvas]"), frames = [], count = 0, lastFrame = -1;
    var pattern = sec.getAttribute("data-frames");
    if (canvas && pattern) {
      count = parseInt(sec.getAttribute("data-frame-count"), 10) || 0;
      for (var i = 1; i <= count; i++) { var im = new Image(); im.decoding = "async"; im.src = pattern.replace("{i}", i); frames.push(im); }
      sec.classList.add("has-frames");
    }
    // Each flying image gets a stable random-ish pose.
    flies.forEach(function (el, i) {
      el._r = ((i * 47) % 30) - 15; el._z = 1 + ((i * 31) % 5) / 10;
    });
    function drawFrame(p) {
      var idx = Math.min(count - 1, Math.max(0, Math.round(p * (count - 1))));
      if (idx === lastFrame) return;
      var img = frames[idx]; if (!img || !img.complete || !img.naturalWidth) return;
      lastFrame = idx;
      var c = canvas, w = c.clientWidth, h = c.clientHeight, d = devicePixelRatio || 1;
      if (c.width !== w * d) { c.width = w * d; c.height = h * d; }
      var ctx = c.getContext("2d"), s = Math.max(c.width / img.naturalWidth, c.height / img.naturalHeight);
      ctx.drawImage(img, (c.width - img.naturalWidth * s) / 2, (c.height - img.naturalHeight * s) / 2, img.naturalWidth * s, img.naturalHeight * s);
    }
    return {
      update: function (vh) {
        var r = sec.getBoundingClientRect(), total = r.height - vh;
        var p = Math.min(1, Math.max(0, -r.top / (total || 1)));
        sec.style.setProperty("--p", p.toFixed(4));
        var pos = p * n; // 0 … n
        chaps.forEach(function (c, i) {
          var d = pos - i - 0.5; // −0.5 … 0.5 while this chapter is active
          var a = Math.max(0, 1 - Math.max(0, Math.abs(d) - 0.28) * 4.5);
          if (i === 0 && d < 0) a = 1; if (i === n - 1 && d > 0) a = 1;
          c.style.opacity = a.toFixed(3);
          c.style.filter = a > 0.99 ? "none" : "blur(" + ((1 - a) * 14).toFixed(1) + "px)";
          c.style.transform = "translate3d(0," + ((1 - a) * (d > 0 ? -40 : 40)).toFixed(1) + "px,0)";
          c.style.pointerEvents = a > 0.5 ? "auto" : "none";
        });
        flies.forEach(function (el) {
          var i = parseInt(el.getAttribute("data-fly"), 10), d = pos - i - 0.5;
          if (i === 0 && d < 0) d = 0; if (i === n - 1 && d > 0) d = 0;
          var ad = Math.abs(d), vis = Math.max(0, 1 - Math.max(0, ad - 0.3) * 3.2);
          var y = d * -520 * el._z, z = -ad * 600, rot = el._r + d * 40, sc = 1 - ad * 0.35;
          el.style.opacity = vis.toFixed(3);
          el.style.transform = "translate3d(0," + y.toFixed(1) + "px," + z.toFixed(0) + "px) rotate(" + rot.toFixed(1) + "deg) scale(" + sc.toFixed(3) + ")";
        });
        dots.forEach(function (dt, i) { dt.classList.toggle("on", Math.min(n - 1, Math.floor(pos)) === i); });
        if (count) drawFrame(p);
      },
    };
  }
})();
