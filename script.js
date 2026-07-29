/* AI Alo — interaction layer (premium microstates, not arcade) */

(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  // ── Scroll progress ──────────────────────────────────
  const bar = $("#progress-bar");
  function updateProgress() {
    if (!bar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    bar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  // ── Mobile nav ───────────────────────────────────────
  const toggle = $("#nav-toggle");
  const menu = $("#mobile-menu");

  function setMenu(open) {
    if (!menu || !toggle) return;
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    setMenu(menu.hidden);
  });

  menu?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", (e) => {
    if (!menu || menu.hidden) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });

  // ── Experience accordions ────────────────────────────
  $$(".exp-item").forEach((item) => {
    const btn = item.querySelector(".exp-head");
    btn?.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      // Optional: keep multiple open for scanning — still professional
      item.classList.toggle("is-open", !open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  });

  // ── Skill boards ─────────────────────────────────────
  $$(".skill-board").forEach((board) => {
    const btn = board.querySelector(".skill-board-head");
    btn?.addEventListener("click", () => {
      const open = board.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  // Pin skill chips (subtle collectible highlight)
  const pinnedLabel = $("#skill-pinned");
  function updatePinned() {
    const n = $$(".skill-chip.is-pinned").length;
    if (pinnedLabel) pinnedLabel.textContent = String(n);
  }

  $$("[data-skill]").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.toggle("is-pinned");
      updatePinned();
    });
  });

  // ── Interest tiles ───────────────────────────────────
  const status = $("#interest-status");
  const tiles = $$(".interest-tile");

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      const wasActive = tile.classList.contains("is-active");
      tiles.forEach((t) => {
        t.classList.remove("is-active");
        t.setAttribute("aria-expanded", "false");
      });
      if (!wasActive) {
        tile.classList.add("is-active");
        tile.setAttribute("aria-expanded", "true");
        const label = tile.querySelector(".interest-label")?.textContent || "";
        if (status) status.textContent = label;
      } else if (status) {
        status.textContent = "Explore a tile";
      }
    });
  });

  // ── Scroll reveal ────────────────────────────────────
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => obs.observe(el));

  // ── Stat strip count-up ───────────────────────────────
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (prefersReducedMotion || !target) {
      el.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statNums = $$(".stat-num");
  if (statNums.length) {
    const statObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            statNums.forEach(animateCount);
            statObs.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    statObs.observe(statNums[0]);
  }

  // ── Live embed scaling (device-preview trick) ────────
  // The embedded site has no mobile nav collapse, so on narrow
  // screens we render it at its fixed desktop width and scale the
  // whole iframe down to fit, rather than letting it reflow.
  (function () {
    const wrap = $("#live-embed-frame");
    const frame = $("#live-embed-iframe");
    if (!wrap || !frame) return;

    const LOGICAL_WIDTH = 1280;

    function applyScale() {
      const containerW = wrap.clientWidth;
      const containerH = wrap.clientHeight;
      const scale = containerW / LOGICAL_WIDTH;
      frame.style.height = containerH / scale + "px";
      frame.style.transform = `scale(${scale})`;
    }

    applyScale();

    let resizeTimer;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applyScale, 150);
      },
      { passive: true }
    );
  })();

  // ── Hero network visualization (proof of skill, not decor) ──
  (function () {
    const canvas = document.getElementById("hero-network");
    const hero = canvas?.closest(".hero");
    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const NODE_COUNT = 48;
    const LINK_DIST = 130;
    const GOLD = "201, 168, 76";

    let w = 0, h = 0, dpr = 1, nodes = [], running = false, frame = null;

    function resize() {
      const rect = hero.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 0.9,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      if (!reduceMotion) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0 || n.y > h) n.vy *= -1;
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(${GOLD}, ${(1 - dist / LINK_DIST) * 0.22})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.fillStyle = `rgba(${GOLD}, 0.6)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      draw();
      if (running && !reduceMotion) frame = requestAnimationFrame(loop);
    }

    function start() {
      if (running) return;
      running = true;
      loop();
    }

    function stop() {
      running = false;
      if (frame) cancelAnimationFrame(frame);
    }

    resize();
    seed();
    draw();

    if (!reduceMotion) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
        { threshold: 0 }
      );
      io.observe(hero);
    }

    let resizeTimer;
    window.addEventListener(
      "resize",
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resize();
          seed();
          draw();
        }, 150);
      },
      { passive: true }
    );
  })();

  // ── Nav shadow on scroll ─────────────────────────────
  const nav = $(".nav");
  function navDepth() {
    if (!nav) return;
    nav.style.boxShadow =
      window.scrollY > 8 ? "0 1px 0 var(--line)" : "none";
  }
  window.addEventListener("scroll", navDepth, { passive: true });
  navDepth();
})();
