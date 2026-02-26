function splitTextElement(el, options = {}) {
  if (!el || el.dataset.splitReady === "true") return;

  const originalText = el.textContent.trim();
  if (!originalText) return;

  const staggerMs = options.staggerMs ?? 36;
  el.textContent = "";

  [...originalText].forEach((char, index) => {
    const span = document.createElement("span");
    span.className = "split-char";
    span.style.setProperty("--i", String(index));
    span.style.animationDelay = `${index * staggerMs}ms`;
    span.textContent = char === " " ? "\u00A0" : char;
    el.appendChild(span);
  });

  el.dataset.splitReady = "true";
}

function replaySplitAnimation(el, staggerMs = 30) {
  const chars = el.querySelectorAll(".split-char");

  chars.forEach((charEl) => {
    charEl.style.animation = "none";
  });

  void el.offsetWidth;

  chars.forEach((charEl, index) => {
    charEl.style.animation = "";
    charEl.style.animationDelay = `${index * staggerMs}ms`;
  });
}

function initSplitText(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    splitTextElement(el);
    el.addEventListener("mouseenter", () => replaySplitAnimation(el));
  });
}

function initScrollReveal(selector) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  elements.forEach((el, index) => {
    el.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
  });

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  elements.forEach((el) => observer.observe(el));
}

function initStickyHeader() {
  const header = document.querySelector(".header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 18);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initScrollProgress() {
  const progress = document.querySelector(".scroll-progress");
  if (!progress) return;

  const updateProgress = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const value = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    progress.style.setProperty("--scroll", `${Math.min(100, Math.max(0, value))}%`);
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function initHamburgerMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navItems = document.querySelectorAll(".nav-links a");

  if (!hamburger || !navLinks) return;

  const closeMenu = () => {
    hamburger.classList.remove("is-active");
    navLinks.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  const openMenu = () => {
    hamburger.classList.add("is-active");
    navLinks.classList.add("is-open");
    hamburger.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.contains("is-open");
    if (isOpen) closeMenu();
    else openMenu();
  });

  navItems.forEach((item) => item.addEventListener("click", closeMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });
}

function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const headerHeight = document.querySelector(".header")?.offsetHeight ?? 0;
      const y = target.getBoundingClientRect().top + window.pageYOffset - headerHeight + 1;

      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });
}

function initCoffeeCardHover() {
  const cards = document.querySelectorAll(".product-card");
  if (!cards.length) return;

  const canHover = window.matchMedia("(hover: hover)").matches;
  if (!canHover) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = (0.5 - (y / rect.height)) * 5;

      card.style.transform = `translateY(-8px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
      card.classList.add("is-hovered");
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
      card.classList.remove("is-hovered");
    });
  });
}

function initMenuFilter() {
  const buttons = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".product-card");
  if (!buttons.length || !cards.length) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      cards.forEach((card) => {
        const category = card.dataset.category;
        const show = filter === "all" || category === filter;
        card.classList.toggle("is-hidden", !show);
      });
    });
  });
}

function initPointerGlow() {
  const target = document.querySelector(".interactive-surface");
  if (!target) return;

  const update = (event) => {
    const x = Math.round((event.clientX / window.innerWidth) * 100);
    const y = Math.round((event.clientY / window.innerHeight) * 100);
    target.style.setProperty("--mx", `${x}%`);
    target.style.setProperty("--my", `${y}%`);
  };

  window.addEventListener("mousemove", update, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initSplitText(".split-text");
  initScrollReveal(".reveal-on-scroll");
  initStickyHeader();
  initScrollProgress();
  initHamburgerMenu();
  initSmoothScroll();
  initCoffeeCardHover();
  initMenuFilter();
  initPointerGlow();
});
