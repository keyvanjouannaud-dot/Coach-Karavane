/* ============================================================
   COACH KARAVANE — script.js
   Boutique statique, panier localStorage, aucun paiement réel.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DONNÉES PRODUITS ----------
     Chaque produit a un tableau "images" : FACE puis DOS.
     Quand tu enverras des photos séparées, remplace juste les
     fichiers dans assets/images/ en gardant les mêmes noms,
     ou ajoute nouvelles entrées ici (front/back fonctionnent
     déjà en carrousel avec flèches + points). */
  const PRODUCTS = [
    {
      id: 'listeux',
      name: 'LISTEUX TEE',
      price: 30,
      badge: 'LIMITED',
      desc: 'Le classique Coach Karavane. Une pièce pensée pour ceux qui connaissent les règles.',
      coverIndex: 0,
      images: [
        { src: 'assets/images/listeux-tee-front.jpg', label: 'FACE' },
        { src: 'assets/images/listeux-tee-back.jpg', label: 'DOS' }
      ]
    },
    {
      id: 'batard',
      name: 'AH BÂTARD TEE',
      price: 30,
      badge: 'EXCLUSIVE',
      desc: 'Aucun contexte nécessaire. Ceux qui savent savent.',
      coverIndex: 1,
      images: [
        { src: 'assets/images/ah-batard-tee-front.jpg', label: 'FACE' },
        { src: 'assets/images/ah-batard-tee-back.jpg', label: 'DOS' }
      ]
    },
    {
      id: 'puter',
      name: 'PUTER SOLO TEE',
      price: 30,
      badge: 'LIMITED',
      desc: 'Pas de deuxième chance. Pas de deuxième liste.',
      coverIndex: 1,
      images: [
        { src: 'assets/images/puter-solo-tee-front.jpg', label: 'FACE' },
        { src: 'assets/images/puter-solo-tee-back.jpg', label: 'DOS' }
      ]
    },
    {
      id: 'hoodie',
      name: 'KARAVANERIE HOODIE',
      price: 50,
      badge: 'PREMIUM',
      desc: "La pièce centrale de la collection. La Karavanerie n'est jamais fini.",
      coverIndex: 1,
      images: [
        { src: 'assets/images/karavanerie-hoodie-front.jpg', label: 'FACE' },
        { src: 'assets/images/karavanerie-hoodie-back.jpg', label: 'DOS' }
      ]
    }
  ];

  /* Visuels éditoriaux pour la section LOOKBOOK de la home.
     Vide pour l'instant : ajoute des chemins ici quand tu m'envoies
     de nouvelles images (ex: 'assets/images/lookbook-1.jpg') et la
     section s'affichera automatiquement. */
  const LOOKBOOK_IMAGES = [];

  const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const CART_KEY = 'ck_cart_v1';

  /* ---------- ÉTAT ---------- */
  let cart = loadCart();
  let activeProduct = null;
  let activeImageIndex = 0;
  let selectedSize = null;
  let qty = 1;

  /* ---------- UTILS ---------- */
  function formatPrice(n) {
    return n.toFixed(0) + ' €';
  }

  function loadCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart() {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (e) {
      /* localStorage indisponible : le panier reste en mémoire pour la session */
    }
  }

  /* ---------- LOOKBOOK ---------- */
  function renderLookbook() {
    const section = document.getElementById('lookbook');
    const grid = document.getElementById('lookbookGrid');
    if (!LOOKBOOK_IMAGES.length) {
      section.classList.remove('has-images');
      return;
    }
    grid.innerHTML = LOOKBOOK_IMAGES.map(function (src) {
      return '<img src="' + src + '" alt="Coach Karavane" loading="lazy">';
    }).join('');
    section.classList.add('has-images');
  }

  /* ---------- RENDU GRILLE PRODUITS ---------- */
  const productGrid = document.getElementById('productGrid');

  function renderProducts() {
    productGrid.innerHTML = PRODUCTS.map(function (p, i) {
      const cover = p.images[p.coverIndex] || p.images[0];
      return (
        '<article class="product-card" data-id="' + p.id + '" style="animation-delay:' + (i * 0.08) + 's">' +
          '<div class="product-img">' +
            '<img src="' + cover.src + '" alt="' + p.name + '" loading="lazy">' +
            '<span class="badge">' + p.badge + '</span>' +
          '</div>' +
          '<div class="product-info">' +
            '<p class="product-name">' + p.name + '</p>' +
            '<p class="product-price">' + formatPrice(p.price) + '</p>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    Array.prototype.forEach.call(productGrid.querySelectorAll('.product-card'), function (card) {
      card.addEventListener('click', function () {
        openModal(card.getAttribute('data-id'));
      });
    });
  }

  /* ---------- MODAL FICHE PRODUIT ---------- */
  const productModal = document.getElementById('productModal');
  const modalImg = document.getElementById('modalImg');
  const modalBadge = document.getElementById('modalBadge');
  const faceTag = document.getElementById('faceTag');
  const carouselPrev = document.getElementById('carouselPrev');
  const carouselNext = document.getElementById('carouselNext');
  const carouselDots = document.getElementById('carouselDots');
  const modalName = document.getElementById('modalName');
  const modalPrice = document.getElementById('modalPrice');
  const modalDesc = document.getElementById('modalDesc');
  const sizeOptionsEl = document.getElementById('sizeOptions');
  const sizeLabelEl = document.getElementById('sizeLabel');
  const qtyValueEl = document.getElementById('qtyValue');
  const addToCartBtn = document.getElementById('addToCartBtn');

  function renderCarouselImage() {
    const img = activeProduct.images[activeImageIndex];
    modalImg.src = img.src;
    modalImg.alt = activeProduct.name + ' — ' + img.label;
    faceTag.textContent = img.label;

    const multi = activeProduct.images.length > 1;
    carouselPrev.classList.toggle('hidden', !multi);
    carouselNext.classList.toggle('hidden', !multi);

    carouselDots.innerHTML = multi
      ? activeProduct.images.map(function (_, i) {
          return '<span class="' + (i === activeImageIndex ? 'active' : '') + '"></span>';
        }).join('')
      : '';
  }

  function goToImage(delta) {
    const len = activeProduct.images.length;
    activeImageIndex = (activeImageIndex + delta + len) % len;
    renderCarouselImage();
  }

  carouselPrev.addEventListener('click', function () { goToImage(-1); });
  carouselNext.addEventListener('click', function () { goToImage(1); });

  function openModal(productId) {
    const p = PRODUCTS.find(function (x) { return x.id === productId; });
    if (!p) return;

    activeProduct = p;
    activeImageIndex = p.coverIndex || 0;
    selectedSize = null;
    qty = 1;

    renderCarouselImage();
    modalBadge.textContent = p.badge;
    modalName.textContent = p.name;
    modalPrice.textContent = formatPrice(p.price);
    modalDesc.textContent = p.desc;
    qtyValueEl.textContent = '1';
    sizeLabelEl.textContent = 'CHOISIS TA TAILLE';
    sizeLabelEl.classList.remove('warn');

    sizeOptionsEl.innerHTML = SIZES.map(function (s) {
      return '<button class="size-opt" data-size="' + s + '">' + s + '</button>';
    }).join('');

    Array.prototype.forEach.call(sizeOptionsEl.querySelectorAll('.size-opt'), function (btn) {
      btn.addEventListener('click', function () {
        selectedSize = btn.getAttribute('data-size');
        Array.prototype.forEach.call(sizeOptionsEl.querySelectorAll('.size-opt'), function (b) {
          b.classList.toggle('selected', b === btn);
        });
        sizeLabelEl.textContent = 'TAILLE';
        sizeLabelEl.classList.remove('warn');
      });
    });

    productModal.classList.add('open');
    productModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    productModal.classList.remove('open');
    productModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('modalClose').addEventListener('click', closeModal);
  productModal.addEventListener('click', function (e) {
    if (e.target === productModal) closeModal();
  });

  document.getElementById('qtyMinus').addEventListener('click', function () {
    qty = Math.max(1, qty - 1);
    qtyValueEl.textContent = String(qty);
  });
  document.getElementById('qtyPlus').addEventListener('click', function () {
    qty = Math.min(10, qty + 1);
    qtyValueEl.textContent = String(qty);
  });

  addToCartBtn.addEventListener('click', function () {
    if (!selectedSize) {
      sizeLabelEl.textContent = 'CHOISIS TA TAILLE';
      sizeLabelEl.classList.add('warn');
      sizeOptionsEl.classList.add('shake');
      setTimeout(function () { sizeOptionsEl.classList.remove('shake'); }, 400);
      return;
    }
    addToCart(activeProduct, selectedSize, qty);
    closeModal();
    openCart();
  });

  /* ---------- PANIER ---------- */
  function addToCart(product, size, quantity) {
    const cover = product.images[product.coverIndex] || product.images[0];
    const existing = cart.find(function (item) {
      return item.id === product.id && item.size === size;
    });
    if (existing) {
      existing.qty += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        size: size,
        price: product.price,
        img: cover.src,
        qty: quantity
      });
    }
    saveCart();
    renderCart();
  }

  function updateQty(id, size, delta) {
    const item = cart.find(function (x) { return x.id === id && x.size === size; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      cart = cart.filter(function (x) { return !(x.id === id && x.size === size); });
    }
    saveCart();
    renderCart();
  }

  function removeItem(id, size) {
    cart = cart.filter(function (x) { return !(x.id === id && x.size === size); });
    saveCart();
    renderCart();
  }

  const cartItemsEl = document.getElementById('cartItems');
  const cartEmptyEl = document.getElementById('cartEmpty');
  const cartFooterEl = document.getElementById('cartFooter');
  const cartCountEl = document.getElementById('cartCount');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartTotalEl = document.getElementById('cartTotal');

  function renderCart() {
    const totalQty = cart.reduce(function (sum, i) { return sum + i.qty; }, 0);
    cartCountEl.textContent = String(totalQty);

    if (cart.length === 0) {
      cartItemsEl.classList.add('hidden');
      cartFooterEl.classList.add('hidden');
      cartEmptyEl.classList.remove('hidden');
      return;
    }

    cartItemsEl.classList.remove('hidden');
    cartFooterEl.classList.remove('hidden');
    cartEmptyEl.classList.add('hidden');

    cartItemsEl.innerHTML = cart.map(function (item) {
      const lineTotal = item.price * item.qty;
      return (
        '<div class="cart-item" data-id="' + item.id + '" data-size="' + item.size + '">' +
          '<img src="' + item.img + '" alt="' + item.name + '">' +
          '<div class="cart-item-info">' +
            '<p class="cart-item-name">' + item.name + '</p>' +
            '<p class="cart-item-size">Taille : ' + item.size + '</p>' +
            '<div class="cart-item-row">' +
              '<div class="cart-item-qty">' +
                '<button class="qty-dec" aria-label="Diminuer">−</button>' +
                '<span>' + item.qty + '</span>' +
                '<button class="qty-inc" aria-label="Augmenter">+</button>' +
              '</div>' +
              '<span class="cart-item-price">' + formatPrice(lineTotal) + '</span>' +
            '</div>' +
            '<button class="cart-item-remove">Supprimer</button>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    Array.prototype.forEach.call(cartItemsEl.querySelectorAll('.cart-item'), function (row) {
      const id = row.getAttribute('data-id');
      const size = row.getAttribute('data-size');
      row.querySelector('.qty-inc').addEventListener('click', function () { updateQty(id, size, 1); });
      row.querySelector('.qty-dec').addEventListener('click', function () { updateQty(id, size, -1); });
      row.querySelector('.cart-item-remove').addEventListener('click', function () { removeItem(id, size); });
    });

    const subtotal = cart.reduce(function (sum, i) { return sum + i.price * i.qty; }, 0);
    cartSubtotalEl.textContent = formatPrice(subtotal);
    cartTotalEl.textContent = formatPrice(subtotal);
  }

  /* ---------- DRAWER PANIER ---------- */
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');

  function openCart() {
    cartOverlay.classList.add('open');
    cartDrawer.classList.add('open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartOverlay.classList.remove('open');
    cartDrawer.classList.remove('open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('cartBtn').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  /* ---------- CHECKOUT — LA BLAGUE ---------- */
  const checkoutScreen = document.getElementById('checkoutScreen');
  const checkoutLoading = document.getElementById('checkoutLoading');
  const checkoutReveal = document.getElementById('checkoutReveal');

  document.getElementById('checkoutBtn').addEventListener('click', function () {
    if (cart.length === 0) return;

    closeCart();
    checkoutScreen.classList.add('open');
    checkoutScreen.setAttribute('aria-hidden', 'false');
    checkoutLoading.style.display = 'block';
    checkoutReveal.classList.remove('show');
    document.body.style.overflow = 'hidden';

    setTimeout(function () {
      checkoutLoading.style.display = 'none';
      checkoutReveal.classList.add('show');
    }, 1800);
  });

  document.getElementById('backToShopBtn').addEventListener('click', function () {
    checkoutScreen.classList.remove('open');
    checkoutScreen.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.location.hash = '#shop';
  });

  /* ---------- NAV MOBILE ---------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mobileNav = document.getElementById('mobileNav');

  burgerBtn.addEventListener('click', function () {
    const isOpen = mobileNav.classList.toggle('open');
    burgerBtn.classList.toggle('open', isOpen);
    burgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  Array.prototype.forEach.call(mobileNav.querySelectorAll('.mobile-link'), function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('open');
      burgerBtn.classList.remove('open');
      burgerBtn.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- REVEAL ON SCROLL ---------- */
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- BRAISES FLOTTANTES ---------- */
  function initEmbers() {
    const container = document.getElementById('embers');
    if (!container) return;
    const count = window.innerWidth < 700 ? 14 : 24;
    let html = '';
    for (let i = 0; i < count; i++) {
      const left = Math.random() * 100;
      const duration = 6 + Math.random() * 8;
      const delay = Math.random() * 10;
      const drift = (Math.random() * 60 - 30).toFixed(0) + 'px';
      const size = (3 + Math.random() * 3).toFixed(1) + 'px';
      html += '<span style="left:' + left + '%; width:' + size + '; height:' + size +
        '; animation-duration:' + duration + 's; animation-delay:-' + delay + 's; --drift:' + drift + ';"></span>';
    }
    container.innerHTML = html;
  }

  /* ---------- INIT ---------- */
  renderProducts();
  renderLookbook();
  renderCart();
  initReveal();
  initEmbers();
})();
