/* =========================================================
   STORE FRONTEND
   UI interactions only. Real accounts, payments, orders and
   push notifications require a secure backend integration.
   ========================================================= */
(() => {
  "use strict";

  const config = window.STORE_CONFIG;
  const products = window.STORE_PRODUCTS;
  const categories = window.STORE_CATEGORIES;
  const $ = (selector) => document.querySelector(selector);
  const money = (amount) => new Intl.NumberFormat(config.locale, {
    style: "currency", currency: config.currency, maximumFractionDigits: 2
  }).format(amount);

  let cart = [];
  let activeCategory = "all";

  function applyBrandSettings() {
    document.title = `${config.brandName} | Online Store`;
    document.querySelectorAll("[data-brand-name]").forEach((node) => {
      node.textContent = config.brandName;
    });
    document.documentElement.style.setProperty("--brand", config.colors.primary);
    document.documentElement.style.setProperty("--brand-light", config.colors.primaryLight);
    document.documentElement.style.setProperty("--cyan", config.colors.cyan);
    document.documentElement.style.setProperty("--offer-red", config.colors.red);
    document.documentElement.style.setProperty("--accent-yellow", config.colors.yellow);
    $("#year").textContent = new Date().getFullYear();
  }

  function renderCategories() {
    $("#categoryGrid").innerHTML = categories.map((category) => `
      <button class="category-card" data-category="${category.id}">
        <img src="${category.image}" alt="" loading="lazy">
        <span>${category.name}</span><b>Explore →</b>
      </button>`).join("");

    $("#categoryFilter").insertAdjacentHTML("beforeend",
      categories.map((category) => `<option value="${category.id}">${category.name}</option>`).join(""));
  }

  function renderProducts() {
    const query = $("#searchInput").value.trim().toLowerCase();
    const selected = $("#categoryFilter").value;
    const filtered = products.filter((product) => {
      const matchesCategory = selected === "all" || product.category === selected;
      const matchesQuery = product.name.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    $("#productGrid").innerHTML = filtered.length ? filtered.map((product) => `
      <article class="product-card">
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
          <button class="quick-add" data-add="${product.id}" aria-label="Add ${product.name} to cart">+</button>
        </div>
        <div class="product-info">
          <span class="product-category">${categories.find((item) => item.id === product.category)?.name || "Collection"}</span>
          <h3>${product.name}</h3>
          <div class="product-rating">★ ${product.rating.toFixed(1)} <span>· Demo rating</span></div>
          <div class="price-row"><strong>${money(product.offerPrice ?? product.price)}</strong>
          ${product.offerPrice ? `<del>${money(product.price)}</del>` : ""}</div>
        </div>
      </article>`).join("") : `<p class="empty-state">No products found. Try another search.</p>`;
  }

  function updateCart() {
    $("#cartCount").textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    $("#cartItems").innerHTML = cart.length ? cart.map((item) => `
      <div class="cart-line">
        <img src="${item.image}" alt="">
        <div><strong>${item.name}</strong><small>${money(item.offerPrice ?? item.price)} × ${item.quantity}</small></div>
        <button data-remove="${item.id}" aria-label="Remove ${item.name}">×</button>
      </div>`).join("") : `<p class="empty-state">Your cart is empty.</p>`;
    const total = cart.reduce((sum, item) => sum + (item.offerPrice ?? item.price) * item.quantity, 0);
    $("#cartTotal").textContent = money(total);
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2300);
  }

  function openCart() {
    $("#cartDrawer").classList.add("open");
    $("#drawerBackdrop").classList.add("visible");
    $("#cartDrawer").setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    $("#cartDrawer").classList.remove("open");
    $("#drawerBackdrop").classList.remove("visible");
    $("#cartDrawer").setAttribute("aria-hidden", "true");
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    const removeButton = event.target.closest("[data-remove]");
    const categoryButton = event.target.closest("[data-category]");

    if (addButton) {
      const product = products.find((item) => item.id === Number(addButton.dataset.add));
      if (product) {
        const existing = cart.find((item) => item.id === product.id);
        existing ? existing.quantity++ : cart.push({ ...product, quantity: 1 });
        updateCart();
        showToast("Added to your cart");
      }
    }
    if (removeButton) {
      cart = cart.filter((item) => item.id !== Number(removeButton.dataset.remove));
      updateCart();
    }
    if (categoryButton) {
      $("#categoryFilter").value = categoryButton.dataset.category;
      $("#products").scrollIntoView({ behavior: "smooth" });
      renderProducts();
    }
  });

  $("#searchInput").addEventListener("input", renderProducts);
  $("#categoryFilter").addEventListener("change", renderProducts);
  $("#cartButton").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#drawerBackdrop").addEventListener("click", closeCart);
  $("#checkoutButton").addEventListener("click", () => showToast("Demo only — secure checkout will be added with the backend."));
  $("#accountButton").addEventListener("click", () => $("#accountDialog").showModal());
  $("#accountOkay").addEventListener("click", () => $("#accountDialog").close());
  $("#menuButton").addEventListener("click", () => $(".main-nav").classList.toggle("nav-open"));

  applyBrandSettings();
  renderCategories();
  renderProducts();
  updateCart();
})();