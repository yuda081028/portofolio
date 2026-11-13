const products = [
  { id: 1, name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 18000, stock: 24, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80' },
  { id: 2, name: 'Es Teh Lemon', category: 'Minuman', price: 12000, stock: 32, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80' },
  { id: 3, name: 'Matcha Latte', category: 'Minuman', price: 22000, stock: 18, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=600&q=80' },
  { id: 4, name: 'Roti Bakar Cokelat', category: 'Makanan', price: 16000, stock: 15, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80' },
  { id: 5, name: 'Croissant Butter', category: 'Makanan', price: 14000, stock: 12, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
  { id: 6, name: 'Tumbler Stainless', category: 'Lainnya', price: 65000, stock: 8, image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80' }
];

let cart = [];
let customers = [];
let currentCategory = 'Semua';
let paymentMethod = 'Tunai';
let toastTimer;

const rupiah = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount).replace(/\u00a0/g, ' ');
const productGrid = document.querySelector('#product-grid');
const customerDialog = document.querySelector('.customer-dialog');
const receiptDialog = document.querySelector('.receipt-dialog');

document.querySelector('[data-current-date]').textContent = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

function showToast(message) {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function renderProducts() {
  const search = document.querySelector('#product-search').value.trim().toLocaleLowerCase('id');
  const visibleProducts = products.filter((product) => {
    const matchesCategory = currentCategory === 'Semua' || product.category === currentCategory;
    return matchesCategory && product.name.toLocaleLowerCase('id').includes(search);
  });

  productGrid.innerHTML = visibleProducts.length ? visibleProducts.map((product) => {
    const quantityInCart = cart.find((item) => item.id === product.id)?.quantity || 0;
    return `<article class="product-card">
      <div class="product-image" data-art="${product.id}"><div class="product-art" aria-hidden="true"><span>${product.category.toLocaleUpperCase('id')}</span><strong>0${product.id}</strong></div><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="product-category">${product.category}</span></div>
      <div class="product-info"><h3 title="${product.name}">${product.name}</h3><p class="product-stock">Stok ${product.stock - quantityInCart} tersedia</p>
        <div class="product-bottom"><strong class="product-price">${rupiah(product.price)}</strong><button class="add-product" type="button" data-add-product="${product.id}" aria-label="Tambah ${product.name}" ${quantityInCart >= product.stock ? 'disabled' : ''}>+</button></div>
      </div>
    </article>`;
  }).join('') : '<div class="no-products">Produk tidak ditemukan.</div>';

  productGrid.querySelectorAll('.product-image img').forEach((image) => {
    if (image.complete && image.naturalWidth > 0) image.parentElement.classList.add('image-loaded');
    else image.addEventListener('load', () => image.parentElement.classList.add('image-loaded'), { once: true });
    image.addEventListener('error', () => image.parentElement.classList.add('image-fallback'), { once: true });
  });
}

function renderCart() {
  const cartItems = document.querySelector('[data-cart-items]');
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = quantity; });
  document.querySelector('[data-subtotal]').textContent = rupiah(total);
  document.querySelector('[data-total]').textContent = rupiah(total);
  document.querySelector('[data-clear-cart]').disabled = !cart.length;
  document.querySelector('[data-go-payment]').disabled = !cart.length;
  document.querySelector('[data-payment-dot]').hidden = !cart.length;
  document.querySelector('[data-order-count]').textContent = `${quantity}`;
  document.querySelector('[data-summary-items]').textContent = `${quantity} item`;
  document.querySelector('[data-payment-subtotal]').textContent = rupiah(total);
  document.querySelector('[data-payment-total]').textContent = rupiah(total);
  document.querySelector('[data-payment-items]').innerHTML = cart.map((item) => `
    <div class="payment-item">
      <div class="payment-item-name"><strong>${item.name}</strong><small>${rupiah(item.price)} / item</small></div>
      ${quantityControls(item)}
      <span class="payment-item-total">${rupiah(item.price * item.quantity)}</span>
    </div>`).join('');
  document.querySelector('[data-payment-empty]').hidden = cart.length > 0;
  document.querySelector('[data-complete-payment]').disabled = !cart.length;

  if (!cart.length) {
    cartItems.innerHTML = '<div class="cart-empty"><span aria-hidden="true">＋</span><strong>Belum ada produk</strong><small>Pilih produk untuk memulai transaksi.</small></div>';
  } else {
    cartItems.innerHTML = cart.map((item) => `
      <div class="cart-row">
        <div><div class="cart-item-name" title="${item.name}">${item.name}</div><span class="cart-item-price">${rupiah(item.price)} / item</span>${quantityControls(item)}</div>
        <strong class="cart-row-total">${rupiah(item.price * item.quantity)}</strong>
      </div>`).join('');
  }
  updateChange();
  renderProducts();
}

function quantityControls(item) {
  return `<div class="quantity-controls" aria-label="Jumlah ${item.name}">
    <button type="button" data-quantity="${item.id}" data-delta="-1" aria-label="Kurangi ${item.name}">−</button>
    <span>${item.quantity}</span>
    <button type="button" data-quantity="${item.id}" data-delta="1" aria-label="Tambah ${item.name}">+</button>
  </div>`;
}

function updateChange() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const received = Number(document.querySelector('#cash-received').value) || 0;
  document.querySelector('[data-change]').textContent = rupiah(Math.max(0, received - total));
}

function setPage(pageName) {
  document.querySelectorAll('[data-view]').forEach((page) => {
    const active = page.dataset.view === pageName;
    page.hidden = !active;
    page.classList.toggle('is-visible', active);
  });
  document.querySelectorAll('.side-link').forEach((link) => link.classList.toggle('is-active', link.dataset.page === pageName));
  const pageLabels = { products: 'Produk', customers: 'Pelanggan', payment: 'Pembayaran' };
  document.querySelector('[data-breadcrumb]').textContent = pageLabels[pageName];
  document.querySelector('#sidebar').classList.remove('is-open');
  document.querySelector('.mobile-menu').setAttribute('aria-expanded', 'false');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCustomers(searchTerm = '') {
  const search = searchTerm.trim().toLocaleLowerCase('id');
  const filtered = customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLocaleLowerCase('id').includes(search));
  document.querySelector('[data-customer-count]').textContent = customers.length;
  document.querySelector('#customer-rows').innerHTML = filtered.map((customer) => `
    <tr><td><span class="customer-cell"><span class="customer-avatar">${customer.name.trim().charAt(0).toLocaleUpperCase('id')}</span>${customer.name}</span></td><td>${customer.phone}</td><td>${customer.email || '—'}</td><td><span class="status-pill">Aktif</span></td></tr>`).join('');
  document.querySelector('[data-customer-empty]').hidden = filtered.length > 0;
  const selector = document.querySelector('#payment-customer');
  const selected = selector.value;
  selector.innerHTML = '<option value="">Pelanggan umum</option>' + customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join('');
  if (customers.some((customer) => customer.id === selected)) selector.value = selected;
}

document.querySelectorAll('.side-link').forEach((link) => link.addEventListener('click', () => setPage(link.dataset.page)));
document.querySelector('#product-search').addEventListener('input', renderProducts);
document.querySelector('#customer-search').addEventListener('input', (event) => renderCustomers(event.target.value));
document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
  currentCategory = button.dataset.category;
  document.querySelectorAll('[data-category]').forEach((chip) => chip.classList.toggle('is-selected', chip === button));
  renderProducts();
}));

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-add-product]');
  if (!button) return;
  const product = products.find((item) => item.id === Number(button.dataset.addProduct));
  const existing = cart.find((item) => item.id === product.id);
  if (existing && existing.quantity >= product.stock) return;
  if (existing) existing.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  renderCart();
});

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quantity]');
  if (!button) return;
  const item = cart.find((entry) => entry.id === Number(button.dataset.quantity));
  if (!item) return;
  item.quantity += Number(button.dataset.delta);
  if (item.quantity <= 0) cart = cart.filter((entry) => entry.id !== item.id);
  renderCart();
});

document.querySelector('[data-clear-cart]').addEventListener('click', () => {
  cart = [];
  renderCart();
  showToast('Keranjang berhasil dikosongkan.');
});
document.querySelector('[data-go-payment]').addEventListener('click', () => setPage('payment'));
document.querySelectorAll('[data-back-products]').forEach((button) => button.addEventListener('click', () => setPage('products')));
document.querySelector('[data-open-customer]').addEventListener('click', () => {
  document.querySelector('#customer-form').reset();
  customerDialog.showModal();
});
document.querySelectorAll('[data-close-customer]').forEach((button) => button.addEventListener('click', () => customerDialog.close()));
customerDialog.addEventListener('click', (event) => { if (event.target === customerDialog) customerDialog.close(); });

document.querySelector('#customer-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const customer = {
    id: `customer-${Date.now()}`,
    name: String(formData.get('name')).trim(),
    phone: String(formData.get('phone')).trim(),
    email: String(formData.get('email')).trim()
  };
  if (customers.some((entry) => entry.phone === customer.phone)) {
    showToast('Nomor telepon tersebut sudah terdaftar.');
    return;
  }
  customers.unshift(customer);
  event.currentTarget.reset();
  customerDialog.close();
  renderCustomers(document.querySelector('#customer-search').value);
  showToast('Pelanggan berhasil ditambahkan.');
});

document.querySelectorAll('[data-method]').forEach((button) => button.addEventListener('click', () => {
  paymentMethod = button.dataset.method;
  document.querySelectorAll('[data-method]').forEach((option) => option.classList.toggle('is-selected', option === button));
  document.querySelector('[data-cash-field]').hidden = paymentMethod !== 'Tunai';
}));
document.querySelector('#cash-received').addEventListener('input', updateChange);
document.querySelector('[data-complete-payment]').addEventListener('click', () => {
  if (!cart.length) return;
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const received = Number(document.querySelector('#cash-received').value) || 0;
  if (paymentMethod === 'Tunai' && received < total) {
    showToast('Jumlah uang diterima belum mencukupi.');
    document.querySelector('#cash-received').focus();
    return;
  }
  const receiptCode = `TRX-${Date.now().toString().slice(-6)}`;
  document.querySelector('[data-receipt-total]').textContent = rupiah(total);
  document.querySelector('[data-receipt-number]').textContent = `${receiptCode} · ${paymentMethod}`;
  receiptDialog.showModal();
});
document.querySelector('[data-close-receipt]').addEventListener('click', () => {
  receiptDialog.close();
  cart = [];
  document.querySelector('#cash-received').value = '';
  renderCart();
  setPage('products');
  showToast('Transaksi demo berhasil diselesaikan.');
});
receiptDialog.addEventListener('click', (event) => { if (event.target === receiptDialog) receiptDialog.close(); });

document.querySelector('.mobile-menu').addEventListener('click', (event) => {
  const button = event.currentTarget;
  const isOpen = button.getAttribute('aria-expanded') === 'true';
  button.setAttribute('aria-expanded', String(!isOpen));
  document.querySelector('#sidebar').classList.toggle('is-open', !isOpen);
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase('id') === 'k') {
    event.preventDefault();
    setPage('products');
    document.querySelector('#product-search').focus();
  }
  if (event.key === 'Escape') document.querySelector('#sidebar').classList.remove('is-open');
});

renderCustomers();
renderCart();
