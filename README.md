# 2 BROTHERS — E-commerce Frontend Demo

A clean, responsive storefront and a separate admin-dashboard visual demo.

## Files

- `index.html` — storefront structure
- `style.css` — storefront styling and responsive layouts
- `config.js` — brand name, currency, colours and contact/social settings
- `products.js` — editable sample categories and product catalogue
- `script.js` — storefront interactions (search, category filter and demo cart)
- `admin/` — separate admin dashboard demo
- `assets/` — reserved for your own local images and logo

## Preview locally

Open `index.html` in a browser. For GitHub Pages, publish the repository root as the Pages source.

## Change the temporary business name

Open `config.js` and edit `brandName`. The visible brand name and browser title use this setting.

## Change the colours

Edit the `colors` values in `config.js`. The CSS variables in `style.css` provide fallback defaults.

## Edit categories and products

Open `products.js`. Each product has an `id`, `name`, `category`, `price`, optional `offerPrice`, `rating`, `badge`, and `image`.

Prices in this demo are sample SAR amounts. Confirm your actual currency, prices, product details, stock, delivery terms and image rights before launch.

## Important: demo limitations

This package is a frontend prototype. It does **not** include production-ready:
- customer registration, secure login or unique customer IDs
- database storage or persistent cart/orders
- real admin authentication or role permissions
- payment gateway, checkout, refunds or delivery tracking
- GPS address capture
- push notification subscriptions or sending
- lottery execution, reward eligibility or customer messaging

Those features need a backend, database, secure authentication, server-side validation and appropriate service integrations. Do not publish private customer information or use the demo admin page as a real admin login.

Product photos are remote Unsplash image URLs for visual preview. Replace them with images you own or are licensed to use. Google Fonts and remote images require an internet connection.
