/* =========================================================
   STORE FRONTEND (upgraded)
   New: saved cart, quantity buttons, sort, offers-only filter,
   WhatsApp order (set whatsapp in config.js), Esc key, safer HTML.
   Real accounts and payments still need a secure backend.
   ========================================================= */
(() => {
  "use strict";

  const config = Object.assign(
    { brandName: "2 BROTHERS", locale: "en-SA", currency: "SAR", colors: {}, tagline: "", contact: {}, social: {} },
    window.STORE_CONFIG
  );
  const products = window.STORE_PRODUCTS || [];
  const categories = window.STORE_CATEGORIES || [];
  const $ = (selector) => document.querySelector(selector);
  const money = (amount) => new Intl.NumberFormat(config.locale, {
    style: "currency", currency: config.currency, maximumFractionDigits: 2
  }).format(amount);
  const esc = (text) => String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const priceOf = (p) => p.offerPrice ?? p.price;
  const categoryName = (id) => categories.find((c) => c.id === id)?.name || "Collection";

  const CART_KEY = "2brothers-cart";
  let toastTimer;

  // Only id + quantity are saved, so prices always come fresh from products.js
  function loadCart() {
    try {
      return (JSON.parse(localStorage.getItem(CART_KEY)) || [])
        .map(({ id, quantity }) => {
          const product = products.find((p) => p.id === id);
          return product ? { ...product, quantity } : null;
        }).filter(Boolean);
    } catch { return []; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity })))); } catch {}
  }
  let cart = loadCart();
  const cartTotal = () => cart.reduce((sum, item) => sum + priceOf(item) * item.quantity, 0);

  function applyBrandSettings() {
    document.title = `${config.brandName} | Online Store`;
    document.querySelectorAll("[data-brand-name]").forEach((node) => { node.textContent = config.brandName; });
    if (config.tagline) document.querySelectorAll(".brand small").forEach((node) => { node.textContent = config.tagline; });
    const cssVars = { primary: "--brand", primaryLight: "--brand-light", cyan: "--cyan", red: "--offer-red", yellow: "--accent-yellow", pink: "--pink", background: "--background", text: "--ink" };
    Object.entries(cssVars).forEach(([key, cssVar]) => {
      if (config.colors[key]) document.documentElement.style.setProperty(cssVar, config.colors[key]);
    });
    $("#year").textContent = new Date().getFullYear();

    // Footer links come from config.js; empty ones are hidden instead of pointing to "#"
    const social = { Facebook: config.social.facebook, Instagram: config.social.instagram, YouTube: config.social.youtube };
    document.querySelectorAll(".social-links a").forEach((link) => {
      const url = social[link.getAttribute("aria-label")];
      if (url) { link.href = url; link.target = "_blank"; link.rel = "noopener"; }
      else link.style.display = "none";
    });
    const contact = document.querySelector('a[href^="mailto:"]');
    if (contact) {
      if (config.contact.email) contact.href = `mailto:${config.contact.email}`;
      else contact.style.display = "none";
    }
  }

  function renderCategories() {
    $("#categoryGrid").innerHTML = categories.map((c) => `
      <button class="category-card" data-category="${esc(c.id)}">
        <img src="${esc(c.image)}" alt="" loading="lazy">
        <span>${esc(c.name)}</span><b>Explore →</b>
      </button>`).join("");
    $("#categoryFilter").insertAdjacentHTML("beforeend",
      categories.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join(""));
  }

  function renderProducts() {
    const query = $("#searchInput").value.trim().toLowerCase();
    const selected = $("#categoryFilter").value;
    const offersOnly = $("#offersOnly").checked;
    const sort = $("#sortSelect").value;

    const filtered = products.filter((p) =>
      (selected === "all" || p.category === selected) &&
      (!offersOnly || p.offerPrice) &&
      (p.name.toLowerCase().includes(query) || categoryName(p.category).toLowerCase().includes(query)));

    if (sort === "low") filtered.sort((a, b) => priceOf(a) - priceOf(b));
    if (sort === "high") filtered.sort((a, b) => priceOf(b) - priceOf(a));
    if (sort === "rating") filtered.sort((a, b) => b.rating - a.rating);

    $("#productGrid").innerHTML = filtered.length ? filtered.map((p) => `
      <article class="product-card">
        <div class="product-image">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
          ${p.badge ? `<span class="product-badge">${esc(p.badge)}</span>` : ""}
          <button class="quick-add" data-add="${p.id}" aria-label="Add ${esc(p.name)} to cart">+</button>
        </div>
        <div class="product-info">
          <span class="product-category">${esc(categoryName(p.category))}</span>
          <h3>${esc(p.name)}</h3>
          <div class="product-rating">★ ${p.rating.toFixed(1)} <span>· Demo rating</span></div>
          <div class="price-row"><strong>${money(priceOf(p))}</strong>
          ${p.offerPrice ? `<del>${money(p.price)}</del>` : ""}</div>
        </div>
      </article>`).join("")
      : `<p class="empty-state">No products match. Clear the search or filters to see everything.</p>`;
  }

  function updateCart() {
    $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    $("#cartItems").innerHTML = cart.length ? cart.map((item) => `
      <div class="cart-line">
        <img src="${esc(item.image)}" alt="">
        <div>
          <strong>${esc(item.name)}</strong>
          <small>${money(priceOf(item))}</small>
          <div class="qty">
            <button data-qty="${item.id}:-1" aria-label="Decrease quantity of ${esc(item.name)}">−</button>
            <span aria-live="polite">${item.quantity}</span>
            <button data-qty="${item.id}:1" aria-label="Increase quantity of ${esc(item.name)}">+</button>
          </div>
        </div>
        <button data-remove="${item.id}" aria-label="Remove ${esc(item.name)}">×</button>
      </div>`).join("")
      : `<p class="empty-state">Your cart is empty. Tap + on any product to add it.</p>`;
    $("#cartTotal").textContent = money(cartTotal());
    const checkout = $("#checkoutButton");
    checkout.disabled = !cart.length;
    checkout.textContent = config.contact.whatsapp ? "Order on WhatsApp" : "Continue to checkout";
    saveCart();
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }

  const drawer = $("#cartDrawer");
  function setCartOpen(open) {
    drawer.classList.toggle("open", open);
    $("#drawerBackdrop").classList.toggle("visible", open);
    drawer.inert = !open;
    drawer.setAttribute("aria-hidden", String(!open));
    (open ? $("#closeCart") : $("#cartButton")).focus();
  }

  function setNavOpen(open) {
    $(".main-nav").classList.toggle("nav-open", open);
    $("#menuButton").setAttribute("aria-expanded", String(open));
  }

  function checkout() {
    if (!cart.length) return;
    if (!config.contact.whatsapp) return showToast("Demo only — secure checkout will be added with the backend.");
    const lines = cart.map((i) => `• ${i.name} × ${i.quantity} — ${money(priceOf(i) * i.quantity)}`);
    const text = `Hello ${config.brandName}, I'd like to order:\n${lines.join("\n")}\nTotal: ${money(cartTotal())}`;
    window.open(`https://wa.me/${String(config.contact.whatsapp).replace(/\D/g, "")}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    const removeButton = event.target.closest("[data-remove]");
    const qtyButton = event.target.closest("[data-qty]");
    const categoryButton = event.target.closest("[data-category]");

    if (addButton) {
      const product = products.find((p) => p.id === Number(addButton.dataset.add));
      if (product) {
        const existing = cart.find((i) => i.id === product.id);
        existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
        updateCart();
        showToast("Added to your cart");
      }
    }
    if (qtyButton) {
      const [id, change] = qtyButton.dataset.qty.split(":").map(Number);
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.quantity += change;
        if (item.quantity < 1) cart = cart.filter((i) => i.id !== id);
        updateCart();
      }
    }
    if (removeButton) {
      cart = cart.filter((i) => i.id !== Number(removeButton.dataset.remove));
      updateCart();
    }
    if (categoryButton) {
      $("#categoryFilter").value = categoryButton.dataset.category;
      $("#searchInput").value = "";
      $("#offersOnly").checked = false;
      renderProducts();
      $("#products").scrollIntoView({ behavior: "smooth" });
    }
    if (event.target.closest("[data-offers]")) {
      $("#offersOnly").checked = true;
      renderProducts();
    }
    if (event.target.closest(".main-nav a")) setNavOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (drawer.classList.contains("open")) setCartOpen(false);
    setNavOpen(false);
  });

  $("#searchInput").addEventListener("input", renderProducts);
  ["#categoryFilter", "#sortSelect", "#offersOnly"].forEach((id) => $(id).addEventListener("change", renderProducts));
  $("#cartButton").addEventListener("click", () => setCartOpen(true));
  $("#closeCart").addEventListener("click", () => setCartOpen(false));
  $("#drawerBackdrop").addEventListener("click", () => setCartOpen(false));
  $("#checkoutButton").addEventListener("click", checkout);
  $("#accountButton").addEventListener("click", () => $("#accountDialog").showModal());
  $("#accountOkay").addEventListener("click", () => $("#accountDialog").close());
  $("#menuButton").addEventListener("click", () => setNavOpen(!$(".main-nav").classList.contains("nav-open")));

  drawer.inert = true;
  applyBrandSettings();
  renderCategories();
  renderProducts();
  updateCart();
})();
