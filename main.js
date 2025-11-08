"use strict";

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initOverlay();
  initStickyNav();
  syncHeroNavHeight();
  initBackToTop();
  loadProjects();
  loadCerts();
  initNavScroll();
  initAvatarReload(); // Add this

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
    url: "https://github.com/dariyoig/dariyoig.github.io",
    image: "./images/thumb_projects_portfolio.png",
  },
  {
    title: "Playwright course project",
    description: "Project to be finished during the QA Automation course at Skillo.",
    tags: ["JavaScript", "Playwright", "Testing"],
    url: "https://github.com/dariyoig/qa-automation-course",
    image: "./images/thumb_project_playwrightCourse.jfif",
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
    ? `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(p.title || "project")}">View Project Code→</a>`
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
  const mountQA = document.getElementById("certs-list-qa");
  const mountDev = document.getElementById("certs-list-dev");

  if (!mountQA || !mountDev) return;

  try {
    const res = await fetch("./data/certifications.json");
    const items = res.ok ? await res.json() : [];

    if (Array.isArray(items) && items.length) {
      // Filter items by category (assuming 'category' field: 'qa' or 'dev')
      const qaItems = items.filter((item) => item.category === "qa");
      const devItems = items.filter((item) => item.category === "dev");

      renderCerts(mountQA, qaItems);
      renderCerts(mountDev, devItems);
    } else {
      mountQA.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">No QA certifications available yet.</li>';
      mountDev.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">No Development certifications available yet.</li>';
    }
  } catch {
    mountQA.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">Failed to load QA certifications.</li>';
    mountDev.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">Failed to load Development certifications.</li>';
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
      <div class="cert-right">
        <span class="cert-view-icon" aria-hidden="true">🔗</span>
      </div>
    </li>`;
}

function renderCerts(mount, items) {
  mount.innerHTML = items.map(toCertCard).join("");

  mount.querySelectorAll(".cert-item").forEach((item, idx) => {
    const pdf = items[idx]?.pdf;
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `View ${items[idx]?.name || "certificate"}`);

    const handleClick = () => {
      if (pdf) {
        openPdfModal(pdf);
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

function openPdfModal(pdfUrl) {
  const modal = document.getElementById("pdf-modal");
  const iframe = document.getElementById("pdf-iframe");
  const closeBtn = document.getElementById("pdf-modal-close");

  if (modal && iframe) {
    iframe.src = pdfUrl;
    modal.classList.add("show");

    const closeModal = () => {
      modal.classList.remove("show");
      iframe.src = "";
    };

    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }
}

// ============================================
// NAV SCROLL WITHOUT URL CHANGE
// ============================================
function initNavScroll() {
  document.querySelectorAll(".nav-list-vertical a, .nav-overlay-list a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = a.getAttribute("href");
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

// ============================================
// AVATAR RELOAD
// ============================================
function initAvatarReload() {
  const avatar = document.querySelector(".avatar");
  if (avatar) {
    avatar.addEventListener("click", () => location.reload());
  }
}
