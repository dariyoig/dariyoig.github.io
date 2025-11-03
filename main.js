"use strict";

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initOverlay();
  initStickyNav();
  syncHeroNavHeight();
  initBackToTop();
  loadProjects();
  loadCerts();

  window.addEventListener("resize", debounce(syncHeroNavHeight, 150));
});

// ============================================
// HELPERS
// ============================================
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str || "");
  return div.innerHTML;
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

// ============================================
// YEAR (Footer)
// ============================================
function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
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
// STICKY NAVBAR (overlay)
// ============================================
function initStickyNav() {
  const hero = document.getElementById("hero");
  const overlay = document.getElementById("nav-overlay");

  if (!hero || !overlay) return;

  let shown = false;

  function update() {
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const threshold = heroBottom - 120;

    if (scrollY >= threshold && !shown) {
      overlay.classList.add("show");
      shown = true;
    } else if (scrollY < threshold && shown) {
      overlay.classList.remove("show");
      shown = false;
    }
  }

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

  window.addEventListener("resize", debounce(update, 150));
  update();
}

// ============================================
// HERO NAV HEIGHT SYNC
// ============================================
function syncHeroNavHeight() {
  const nav = document.getElementById("main-nav");
  if (!nav) return;
  const h = nav.offsetHeight || 220;
  document.documentElement.style.setProperty("--hero-nav-h", `${h}px`);
}

// ============================================
// BACK TO TOP
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
    window.scrollTo(reduce ? { top: 0 } : { top: 0, behavior: "smooth" });
  });

  update();
}

// ============================================
// PROJECTS
// ============================================
const FALLBACK_PROJECTS = [
  {
    title: "QA Portfolio Website",
    description: "Modern portfolio showcasing QA skills, projects, and certifications.",
    tags: ["HTML", "CSS", "JavaScript"],
    url: "https://dariyoig.github.io",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80&auto=format&fit=crop",
  },
  {
    title: "Playwright Test Suite",
    description: "E2E automated testing framework with Page Object Model.",
    tags: ["JavaScript", "Playwright", "Testing"],
    url: "#",
    image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&q=80&auto=format&fit=crop",
  },
];

async function loadProjects() {
  const mountLeft = document.getElementById("projects-list-left");
  const mountRight = document.getElementById("projects-list-right");
  if (!mountLeft || !mountRight) return;

  try {
    const res = await fetch("./data/projects.json");
    let items = res.ok ? await res.json() : FALLBACK_PROJECTS;
    if (!Array.isArray(items) || !items.length) items = FALLBACK_PROJECTS;
    if (items.length % 2 === 1) items = items.slice(0, -1);
    renderProjects(mountLeft, mountRight, items);
  } catch {
    renderProjects(mountLeft, mountRight, FALLBACK_PROJECTS);
  }
}

function renderProjects(mountLeft, mountRight, items) {
  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 === 1);
  mountLeft.innerHTML = leftItems.map(toProjectCard).join("");
  mountRight.innerHTML = rightItems.map(toProjectCard).join("");
}

function toProjectCard(p) {
  const tags = (p.tags || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const link = p.url
    ? `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(p.title || "project")}">View Project →</a>`
    : "";
  const img = p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.title || "Project")}" class="card-img" loading="lazy" />` : "";

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
// CERTIFICATIONS
// ============================================
async function loadCerts() {
  const mount = document.getElementById("certs-list");
  const viewer = document.getElementById("cert-pdf-viewer");
  const placeholder = document.getElementById("pdf-viewer-placeholder");

  if (!mount) return;

  try {
    const res = await fetch("./data/certifications.json");
    const items = res.ok ? await res.json() : [];

    if (Array.isArray(items) && items.length) {
      renderCerts(mount, items, viewer, placeholder);

      const firstCert = items[0];
      if (firstCert?.pdf && viewer && placeholder) {
        loadCertPdf(firstCert.pdf, viewer, placeholder);
        mount.querySelector(".cert-item")?.classList.add("active");
      }
    } else {
      mount.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">No certifications available yet.</li>';
    }
  } catch {
    mount.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">Failed to load certifications.</li>';
  }
}

function toCertCard(c) {
  const title = escapeHtml(c.name || "Certificate");
  const issuer = escapeHtml(c.issuer || "Issuer");
  const date = c.date ? ` · ${escapeHtml(c.date)}` : "";
  const thumb = c.thumb || "";

  return `
    <li class="cert-item">
      <div class="cert-left">
        <div class="cert-thumb">
          ${thumb ? `<img src="${escapeAttr(thumb)}" alt="${title} thumbnail" loading="lazy" />` : ""}
        </div>
        <div class="cert-body">
          <h4>${title} · ${issuer}${date}</h4>
        </div>
      </div>
      <div class="cert-arrow" aria-hidden="true">→</div>
    </li>`;
}

function renderCerts(mount, items, viewer, placeholder) {
  mount.innerHTML = items.map(toCertCard).join("");

  mount.querySelectorAll(".cert-item").forEach((item, idx) => {
    const pdf = items[idx]?.pdf;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `View ${items[idx]?.name || "certificate"}`);

    const handleClick = () => {
      mount.querySelectorAll(".cert-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");
      if (pdf && viewer && placeholder) {
        loadCertPdf(pdf, viewer, placeholder);
      }
    };

    item.addEventListener("click", handleClick);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    });
  });
}

function loadCertPdf(url, viewer, placeholder) {
  if (!viewer || !placeholder) return;
  viewer.src = url;
  viewer.classList.add("active");
  placeholder.classList.add("hidden");
}
