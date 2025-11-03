"use strict";

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initOverlay();
  initStickyNav();
  loadProjects();
  loadCerts();
  initBackToTop(); // add back-to-top
});

// ============================================
// YEAR (Footer)
// ============================================
function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// ============================================
// UNDER CONSTRUCTION OVERLAY
// ============================================
function initOverlay() {
  const overlay = document.getElementById("uc-overlay");
  const showOverlay = window.__UNDER_CONSTRUCTION__ === true;

  if (overlay) {
    overlay.classList.toggle("show", showOverlay);
    document.documentElement.style.overflow = showOverlay ? "hidden" : "";
  }
}

// ============================================
// STICKY NAVBAR (transforms on scroll)
// ============================================
function initStickyNav() {
  const nav = document.getElementById("main-nav");
  const hero = document.getElementById("hero");

  if (!nav || !hero) return;

  const heroHeight = hero.offsetHeight;
  let isSticky = false;
  let placeholder = null;

  function handleScroll() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollY >= heroHeight - 100 && !isSticky) {
      // Create placeholder with smooth height transition
      placeholder = document.createElement("div");
      placeholder.style.height = "0px";
      placeholder.style.visibility = "hidden";
      placeholder.style.transition = "height 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)"; /* butter-smooth */
      placeholder.style.overflow = "hidden";
      nav.parentNode.insertBefore(placeholder, nav);

      // Trigger reflow and animate height
      setTimeout(() => {
        placeholder.style.height = nav.offsetHeight + "px";
      }, 10);

      nav.classList.remove("hiding");
      nav.classList.add("sticky");
      isSticky = true;
    } else if (scrollY < heroHeight - 100 && isSticky) {
      // Animate placeholder height to 0 before removing
      if (placeholder && placeholder.parentNode) {
        placeholder.style.height = "0px";
        setTimeout(() => {
          if (placeholder && placeholder.parentNode) {
            placeholder.parentNode.removeChild(placeholder);
            placeholder = null;
          }
        }, 800); /* match увеличеното време */
      }

      nav.classList.add("hiding");
      setTimeout(() => {
        nav.classList.remove("sticky", "hiding");
      }, 800); /* match увеличеното време */
      isSticky = false;
    }
  }

  // Throttle scroll event for performance
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ============================================
// PROJECTS (from JSON or fallback) - 2 column split
// ============================================
const FALLBACK_PROJECTS = [
  {
    title: "Playwright Training Exercises",
    description: "Practice tasks covering locators, assertions, and page objects.",
    tags: ["JavaScript", "Playwright", "Testing"],
    url: "#",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80&auto=format&fit=crop",
  },
  {
    title: "Portfolio Website (WIP)",
    description: "Dark, minimal portfolio with data-driven sections.",
    tags: ["HTML", "CSS", "Vanilla JS"],
    url: "#",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80&auto=format&fit=crop",
  },
  {
    title: "Demo E2E Tests",
    description: "Automated tests for a demo store with CI integration.",
    tags: ["E2E", "Playwright", "CI/CD"],
    url: "#",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80&auto=format&fit=crop",
  },
];

async function loadProjects() {
  const mountLeft = document.getElementById("projects-list-left");
  const mountRight = document.getElementById("projects-list-right");
  if (!mountLeft || !mountRight) return;

  try {
    const res = await fetch("./data/projects.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let items = await res.json();
    if (!Array.isArray(items) || !items.length) items = FALLBACK_PROJECTS;
    if (items.length % 2 === 1) items = items.slice(0, -1); // drop last to make even
    renderProjects(mountLeft, mountRight, items);
  } catch (err) {
    console.warn("Failed to load projects.json, using fallback:", err.message);
    let items = FALLBACK_PROJECTS.slice();
    if (items.length % 2 === 1) items = items.slice(0, -1);
    renderProjects(mountLeft, mountRight, items);
  }
}

function renderProjects(mountLeft, mountRight, items) {
  const leftItems = items.filter((_, i) => i % 2 === 0); // even indices (0, 2, 4...)
  const rightItems = items.filter((_, i) => i % 2 === 1); // odd indices (1, 3, 5...)

  mountLeft.innerHTML = leftItems.map(toProjectCard).join("");
  mountRight.innerHTML = rightItems.map(toProjectCard).join("");
}

function toProjectCard(p) {
  const tags = (p.tags || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const link = p.url ? `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer">View Project →</a>` : "";
  const img = p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.title || "Project image")}" class="card-img" loading="lazy" />` : "";

  return `
  <article class="card" role="listitem">
    ${img}
    <h3>${escapeHtml(p.title || "Untitled Project")}</h3>
    <p>${escapeHtml(p.description || "No description available.")}</p>
    <ul class="tags" role="list">${tags}</ul>
    ${link}
  </article>`;
}

// ============================================
// CERTIFICATIONS (from JSON or fallback)
// ============================================
const FALLBACK_CERTS = [
  { name: "🎓 QA Fundamentals", issuer: "Placeholder Academy", date: "Jan 2024" },
  { name: "💻 JavaScript Basics", issuer: "Placeholder Institute", date: "Feb 2024" },
  { name: "🎭 Playwright Essentials", issuer: "Placeholder Labs", date: "Mar 2024" },
];

async function loadCerts() {
  const mount = document.getElementById("certs-list");
  if (!mount) return;

  try {
    const res = await fetch("./data/certifications.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();
    renderCerts(mount, Array.isArray(items) && items.length ? items : FALLBACK_CERTS);
  } catch (err) {
    console.warn("Failed to load certifications.json, using fallback:", err.message);
    renderCerts(mount, FALLBACK_CERTS);
  }
}

function renderCerts(mount, items) {
  mount.innerHTML = items.map(toCertItem).join("");
}

function toCertItem(c) {
  const date = c.date ? ` — ${escapeHtml(c.date)}` : "";
  return `<li><strong>${escapeHtml(c.name || "Certificate")}</strong> · ${escapeHtml(c.issuer || "Issuer")}${date}</li>`;
}

// ============================================
// BACK TO TOP BUTTON
// ============================================
function initBackToTop() {
  const btn = document.getElementById("back-to-top");
  if (!btn) return;

  const threshold = 400;
  let shown = false;

  function update() {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    if (y > threshold && !shown) {
      btn.classList.add("show");
      shown = true;
    } else if (y <= threshold && shown) {
      btn.classList.remove("show");
      shown = false;
    }
  }

  // throttle with rAF
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
      ticking = true;
    }
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // initial state
  update();
}

// ============================================
// HELPERS
// ============================================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str);
  return div.innerHTML;
}

function escapeAttr(str) {
  return escapeHtml(str);
}
