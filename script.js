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
