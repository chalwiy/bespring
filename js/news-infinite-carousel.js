(() => {
  window.InfiniteNewsCarouselPending = true;
  const boot = () => {
  const carousels = [
    {
      selector: "[data-exhibition-carousel]",
      current: "[data-current]",
      prev: "[data-prev]",
      next: "[data-next]",
      interval: 5500
    },
    {
      selector: "[data-guide-carousel]",
      current: "[data-guide-current]",
      prev: "[data-guide-prev]",
      next: "[data-guide-next]",
      interval: 6200
    }
  ];

  const initialize = config => {
    const root = document.querySelector(config.selector);
    if (!root) return;

    const viewport = root.querySelector(".exhibition-viewport");
    const track = root.querySelector(".exhibition-track");
    const cards = [...track.children].filter(card => card.classList.contains("news-entry"));
    const current = root.querySelector(config.current);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!viewport || !track || cards.length < 2) return;

    cards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.inert = true;
      clone.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
      clone.querySelectorAll("a, button, input, select, textarea, [tabindex]")
        .forEach(element => element.setAttribute("tabindex", "-1"));
      track.appendChild(clone);
    });

    root.dataset.infiniteReady = "true";

    const rtl = getComputedStyle(viewport).direction === "rtl";
    const gap = () => parseFloat(getComputedStyle(track).columnGap) || 20;
    const step = () => cards[0].getBoundingClientRect().width + gap();
    const position = () => Math.max(
      0,
      Math.min(cards.length * 2 - 1, Math.round(Math.abs(viewport.scrollLeft) / step()))
    );
    const logicalIndex = () => position() % cards.length;
    const targetLeft = index => (rtl ? -1 : 1) * index * step();
    const scrollToIndex = (index, behavior) => {
      const left = targetLeft(index);
      if (behavior === "auto") {
        const previousBehavior = viewport.style.scrollBehavior;
        viewport.style.scrollBehavior = "auto";
        viewport.scrollTo({ left, behavior: "auto" });
        viewport.style.scrollBehavior = previousBehavior;
      } else {
        viewport.scrollTo({ left, behavior });
      }
    };

    let timer;
    let resetTimer;
    let scrollFrame;

    const update = () => {
      if (current) current.textContent = String(logicalIndex() + 1);
    };

    const scheduleReset = index => {
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        scrollToIndex(index - cards.length, "auto");
        update();
      }, 700);
    };

    const move = direction => {
      window.clearTimeout(resetTimer);
      let base = position();
      if (base >= cards.length) {
        base -= cards.length;
        scrollToIndex(base, "auto");
      }

      if (direction > 0) {
        const next = base + 1;
        scrollToIndex(next, reduced ? "auto" : "smooth");
        if (next >= cards.length) scheduleReset(next);
      } else {
        const previous = base === 0 ? cards.length - 1 : base - 1;
        scrollToIndex(previous, reduced ? "auto" : "smooth");
      }
    };

    const stop = () => window.clearInterval(timer);
    const start = () => {
      stop();
      if (!reduced) timer = window.setInterval(() => move(1), config.interval);
    };

    root.querySelector(config.prev)?.addEventListener("click", () => move(-1));
    root.querySelector(config.next)?.addEventListener("click", () => move(1));
    viewport.addEventListener("scroll", () => {
      window.cancelAnimationFrame(scrollFrame);
      scrollFrame = window.requestAnimationFrame(update);
    }, { passive: true });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    window.addEventListener("resize", () => {
      window.clearTimeout(resetTimer);
      scrollToIndex(logicalIndex(), "auto");
    });

    update();
    start();
  };

  carousels.forEach(initialize);
  window.InfiniteNewsCarouselPending = false;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
