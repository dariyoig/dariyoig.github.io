"use strict";

/**
 * Initialize all application features
 */
document.addEventListener("DOMContentLoaded", () => {
  initStickyNav();
  initBackToTop();
  loadProjects();
  loadCerts();
  initNavScroll();
  initAvatarReload();
});

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
function debounce(fn, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = String(str || "");
  return div.innerHTML;
}

/**
 * Escape attribute special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

/**
 * Initialize sticky navigation overlay
 */
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

/**
 * Initialize back to top button
 */
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

/**
 * Load and render projects
 */
async function loadProjects() {
  const mountLeft = document.getElementById("projects-list-left");
  const mountRight = document.getElementById("projects-list-right");
  if (!mountLeft || !mountRight) return;

  try {
    const res = await fetch("./data/projects.json");
    if (!res.ok) throw new Error("Failed to fetch projects");

    const items = await res.json();
    if (!Array.isArray(items) || !items.length) {
      throw new Error("Invalid projects data");
    }

    const evenItems = items.length % 2 === 0 ? items : items.slice(0, -1);
    renderProjects(mountLeft, mountRight, evenItems);
  } catch (error) {
    console.error("Error loading projects:", error);
    mountLeft.innerHTML = '<p style="padding:20px;text-align:center;color:var(--text-muted);">Failed to load projects.</p>';
    mountRight.innerHTML = "";
  }
}

/**
 * Render projects into left and right columns
 * @param {HTMLElement} mountLeft - Left column mount point
 * @param {HTMLElement} mountRight - Right column mount point
 * @param {Array} items - Project items
 */
function renderProjects(mountLeft, mountRight, items) {
  const leftItems = items.filter((_, i) => i % 2 === 0);
  const rightItems = items.filter((_, i) => i % 2 === 1);
  mountLeft.innerHTML = leftItems.map(toProjectCard).join("");
  mountRight.innerHTML = rightItems.map(toProjectCard).join("");
}

/**
 * Convert project object to HTML card
 * @param {Object} p - Project object
 * @returns {string} HTML string
 */
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

/**
 * Load and render certifications
 */
async function loadCerts() {
  const mountQA = document.getElementById("certs-list-qa");
  const mountDev = document.getElementById("certs-list-dev");
  if (!mountQA || !mountDev) return;

  try {
    const res = await fetch("./data/certifications.json");
    if (!res.ok) throw new Error("Failed to fetch certifications");

    const items = await res.json();
    if (!Array.isArray(items) || !items.length) {
      throw new Error("Invalid certifications data");
    }

    const qaItems = items.filter((item) => item.category === "qa");
    const devItems = items.filter((item) => item.category === "dev");

    renderCerts(mountQA, qaItems);
    renderCerts(mountDev, devItems);
  } catch (error) {
    console.error("Error loading certifications:", error);
    mountQA.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">Failed to load certifications.</li>';
    mountDev.innerHTML = '<li style="padding:20px;text-align:center;color:var(--text-muted);">Failed to load certifications.</li>';
  }
}

/**
 * Convert certification object to HTML card
 * @param {Object} c - Certification object
 * @returns {string} HTML string
 */
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

/**
 * Render certifications and attach event listeners
 * @param {HTMLElement} mount - Mount point
 * @param {Array} items - Certification items
 */
function renderCerts(mount, items) {
  mount.innerHTML = items.map(toCertCard).join("");

  mount.querySelectorAll(".cert-item").forEach((item, idx) => {
    const pdf = items[idx]?.pdf;
    if (!pdf) return;

    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `View ${items[idx]?.name || "certificate"}`);

    const handleClick = () => openPdfModal(pdf);

    item.addEventListener("click", handleClick);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    });
  });
}

/**
 * Open PDF modal with cleanup
 * @param {string} pdfUrl - URL of PDF file
 */
function openPdfModal(pdfUrl) {
  const modal = document.getElementById("pdf-modal");
  const iframe = document.getElementById("pdf-iframe");
  const closeBtn = document.getElementById("pdf-modal-close");
  if (!modal || !iframe || !closeBtn) return;

  iframe.src = pdfUrl;
  modal.classList.add("show");

  const closeModal = () => {
    modal.classList.remove("show");
    iframe.src = "";
    document.removeEventListener("keydown", handleEscape);
    modal.removeEventListener("click", handleBackdropClick);
    closeBtn.removeEventListener("click", closeModal);
  };

  const handleEscape = (e) => {
    if (e.key === "Escape") closeModal();
  };

  const handleBackdropClick = (e) => {
    if (e.target === modal) closeModal();
  };

  closeBtn.addEventListener("click", closeModal, { once: true });
  modal.addEventListener("click", handleBackdropClick);
  document.addEventListener("keydown", handleEscape);
}

/**
 * Initialize smooth scrolling for navigation links
 */
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

/**
 * Initialize avatar click to reload page
 */
function initAvatarReload() {
  const avatar = document.querySelector(".avatar");
  if (!avatar) return;

  avatar.addEventListener("click", () => {
    try {
      location.reload();
    } catch (error) {
      console.error("Failed to reload page:", error);
    }
  });
}
