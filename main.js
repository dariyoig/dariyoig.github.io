// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initYear();
  initOverlay();
  initStickyHeader(); // new
  loadProjects();
  loadCerts();
});

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
  const showOverlay = !!window.__UNDER_CONSTRUCTION__;

  if (overlay) {
    overlay.classList.toggle("show", showOverlay);
    document.documentElement.style.overflow = showOverlay ? "hidden" : "";
  }
}

// ============================================
// STICKY HEADER
// ============================================
function initStickyHeader() {
  const header = document.getElementById("site-header");
  const sentinel = document.getElementById("nav-sentinel");
  if (!header || !sentinel || !("IntersectionObserver" in window)) return;

  const io = new IntersectionObserver(
    ([entry]) => {
      // When sentinel is out of view (scrolled past hero), header is stuck
      header.classList.toggle("is-stuck", !entry.isIntersecting);
    },
    { rootMargin: "0px 0px 0px 0px", threshold: 0 }
  );

  io.observe(sentinel);
}

// ============================================
// PROJECTS (from JSON or fallback)
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
  const mount = document.getElementById("projects-list");
  if (!mount) return;

  try {
    const res = await fetch("./data/projects.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();
    renderProjects(mount, items && items.length ? items : FALLBACK_PROJECTS);
  } catch (err) {
    console.warn("Failed to load projects.json, using fallback:", err);
    renderProjects(mount, FALLBACK_PROJECTS);
  }
}

function renderProjects(mount, items) {
  mount.innerHTML = items.map(toProjectCard).join("");
}

function toProjectCard(p) {
  const tags = (p.tags || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
  const link = p.url ? `<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener">View Project →</a>` : "";
  const img = p.image ? `<img src="${escapeAttr(p.image)}" alt="${escapeAttr(p.title || "Project image")}" class="card-img" loading="lazy" />` : "";

  return `
  <article class="card">
    ${img}
    <h3>${escapeHtml(p.title || "Untitled Project")}</h3>
    <p>${escapeHtml(p.description || "No description available.")}</p>
    <ul class="tags">${tags}</ul>
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
    renderCerts(mount, items && items.length ? items : FALLBACK_CERTS);
  } catch (err) {
    console.warn("Failed to load certifications.json, using fallback:", err);
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
// HELPERS
// ============================================
function escapeHtml(str) {
  return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str);
}
