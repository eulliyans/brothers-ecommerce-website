/* Admin dashboard demo: reads the sample catalogue only. */
(() => {
  "use strict";
  const config = window.STORE_CONFIG;
  const products = window.STORE_PRODUCTS;
  document.querySelectorAll("[data-brand-name]").forEach((node) => node.textContent = config.brandName);
  const currency = (value) => new Intl.NumberFormat(config.locale, { style: "currency", currency: config.currency, maximumFractionDigits: 0 }).format(value);
  const table = document.querySelector("#productTable");

  function renderTable() {
    document.querySelector("#productCount").textContent = products.length;
    table.innerHTML = products.map((product) => {
      const category = window.STORE_CATEGORIES.find((item) => item.id === product.category)?.name || "Other";
      return `<tr><td><span class="product-cell"><img src="${product.image}" alt="">${product.name}</span></td><td>${category}</td><td>${currency(product.price)}</td><td>${product.offerPrice ? currency(product.offerPrice) : "—"}</td><td><span class="stock-tag">Sample listing</span></td></tr>`;
    }).join("");
  }
  document.querySelector("#refreshProducts").addEventListener("click", renderTable);
  document.querySelector("#sidebarToggle").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));
  renderTable();
})();
