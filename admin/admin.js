/* Admin dashboard demo: reads the sample catalogue only. */
(() => {
  "use strict";

  const config = Object.assign({ brandName: "2 BROTHERS", locale: "en-SA", currency: "SAR", colors: {} }, window.STORE_CONFIG);
  const products = window.STORE_PRODUCTS || [];
  const categories = window.STORE_CATEGORIES || [];
  const $ = (selector) => document.querySelector(selector);
  const esc = (text) => String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (value) => new Intl.NumberFormat(config.locale, {
    style: "currency", currency: config.currency, maximumFractionDigits: 0
  }).format(value);
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "Other";

  // Brand name and colours come from config.js
  document.querySelectorAll("[data-brand-name]").forEach((node) => { node.textContent = config.brandName; });
  document.title = `${config.brandName} Admin | Demo`;
  const cssVars = { primary: "--brand", primaryLight: "--brand2", cyan: "--cyan" };
  Object.entries(cssVars).forEach(([key, cssVar]) => {
    if (config.colors[key]) document.documentElement.style.setProperty(cssVar, config.colors[key]);
  });

  function renderTable() {
    const query = $("#productSearch").value.trim().toLowerCase();
    const list = products.filter((p) =>
      p.name.toLowerCase().includes(query) || categoryName(p.category).toLowerCase().includes(query));
    const offers = products.filter((p) => p.offerPrice).length;

    $("#productCount").textContent = products.length;
    $("#productNote").textContent = `${offers} on offer · ${categories.length} categories`;
    $("#productTable").innerHTML = list.length ? list.map((p) => `
      <tr>
        <td><span class="product-cell"><img src="${esc(p.image)}" alt="" loading="lazy">${esc(p.name)}</span></td>
        <td>${esc(categoryName(p.category))}</td>
        <td>${money(p.price)}</td>
        <td>${p.offerPrice ? money(p.offerPrice) : "—"}</td>
        <td><span class="stock-tag${p.offerPrice ? " offer" : ""}">${p.offerPrice ? "On offer" : "Sample listing"}</span></td>
      </tr>`).join("")
      : `<tr><td colspan="5" class="empty-row">No products match your search.</td></tr>`;
  }

  // Sidebar (mobile) + active link + breadcrumb
  const sidebar = $("#sidebar");
  const toggle = $("#sidebarToggle");
  const backdrop = $("#sidebarBackdrop");
  const links = [...document.querySelectorAll(".side-link")];

  function setSidebar(open) {
    sidebar.classList.toggle("open", open);
    backdrop.classList.toggle("visible", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  function setActive(hash) {
    const link = links.find((l) => l.getAttribute("href") === hash) || links[0];
    links.forEach((l) => l.classList.toggle("active", l === link));
    $("#crumbCurrent").textContent = link.querySelector("span").textContent;
  }

  toggle.addEventListener("click", () => setSidebar(!sidebar.classList.contains("open")));
  backdrop.addEventListener("click", () => setSidebar(false));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") setSidebar(false); });
  links.forEach((link) => link.addEventListener("click", () => { setActive(link.getAttribute("href")); setSidebar(false); }));

  $("#productSearch").addEventListener("input", renderTable);
  $("#refreshProducts").addEventListener("click", () => { $("#productSearch").value = ""; renderTable(); });

  setActive(location.hash);
  renderTable();
})();
