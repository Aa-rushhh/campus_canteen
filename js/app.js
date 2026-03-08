/* ==========================================
   Smart Campus Canteen — Shared JavaScript
   ========================================== */

// --- Cart Storage Helpers ---
const CART_KEY = 'canteen_cart';
const ORDER_KEY = 'canteen_order';
const ORDERS_HISTORY_KEY = 'canteen_orders_history';
const MENU_KEY = 'canteen_menu_items';
const CONVENIENCE_FEE = 15;

// --- Default Menu Items ---
const DEFAULT_MENU = [
  { id: 1, name: 'Avocado Toast', price: 140, category: 'breakfast', type: 'veg', image: 'assets/images/avocado toast.jpeg', desc: 'Sourdough topped with smashed avocado, chili flakes, and radish.' },
  { id: 2, name: 'Classic Pancakes', price: 120, category: 'breakfast', type: 'veg', image: 'assets/images/pancakes.jpeg', desc: 'Fluffy buttermilk pancakes served with maple syrup and butter.' },
  { id: 3, name: 'Chicken Caesar Wrap', price: 160, category: 'lunch', type: 'nonveg', image: 'assets/images/chicken caeser wrap.jpeg', desc: 'Grilled chicken, romaine lettuce, and parmesan in a flour tortilla.' },
  { id: 4, name: 'Paneer Burrito Bowl', price: 150, category: 'lunch', type: 'veg', image: 'assets/images/paneer burrito wrap.jpeg', desc: 'Spiced paneer, cilantro lime rice, black beans, and salsa fresca.' },
  { id: 5, name: 'Loaded Nachos', price: 120, category: 'snacks', type: 'veg', image: 'assets/images/loaded nachos.jpeg', desc: 'Corn chips topped with cheese sauce, jalapeños, and sour cream.' },
  { id: 6, name: 'Peri Peri Fries', price: 110, category: 'snacks', type: 'veg', image: 'assets/images/peri peri fries.jpeg', desc: 'Crispy golden fries tossed in spicy peri-peri seasoning.' },
  { id: 7, name: 'Cold Coffee', price: 90, category: 'beverages', type: 'veg', image: 'assets/images/cold coffee.jpeg', desc: 'Classic chilled espresso blended with milk and creamy foam.' },
  { id: 8, name: 'Iced Matcha Latte', price: 120, category: 'beverages', type: 'veg', image: 'assets/images/iced matcha.jpeg', desc: 'Premium stone-ground green tea whisked with cold milk.' }
];

const CATEGORY_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch Special', snacks: 'Evening Snacks', beverages: 'Beverages' };

function loadMenuItems() {
  try {
    const data = localStorage.getItem(MENU_KEY);
    if (data) return JSON.parse(data);
    // First time: save defaults
    localStorage.setItem(MENU_KEY, JSON.stringify(DEFAULT_MENU));
    return [...DEFAULT_MENU];
  } catch (e) {
    return [...DEFAULT_MENU];
  }
}

function saveMenuItems(items) {
  localStorage.setItem(MENU_KEY, JSON.stringify(items));
}

// --- Page Load Animation ---
function initPageAnimation() {
  const main = document.querySelector('main, .dashboard-wrap, .orders-wrap, .revenue-main, .reports-main');
  if (!main) return;
  main.style.opacity = '0';
  main.style.transform = 'translateY(18px)';
  main.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      main.style.opacity = '1';
      main.style.transform = 'translateY(0)';
    });
  });
}

// --- Admin Menu Page ---
function initAdminMenu() {
  const grid = document.getElementById('admin-menu-grid');
  if (!grid) return;
  renderAdminMenuCards();

  // Add New Item button
  const addBtn = document.getElementById('admin-add-item-btn');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showMenuItemModal();
    });
  }
}

function renderAdminMenuCards() {
  const grid = document.getElementById('admin-menu-grid');
  if (!grid) return;
  const items = loadMenuItems();

  grid.innerHTML = items.map(item => `
    <div class="food-card glass-card card-shadow card-hover" data-item-id="${item.id}">
      <div class="card-image image-gradient">
        <div class="splash-bg"></div>
        <div class="card-image-bg" style="background-image:url('${item.image}')"></div>
        <span class="card-badge badge-${item.type === 'veg' ? 'veg' : 'nonveg'}">${item.type === 'veg' ? 'Veg' : 'Non-Veg'}</span>
        <span class="card-price-badge">₹${item.price}</span>
      </div>
      <div class="card-body">
        <h3 style="font-weight:700;font-size:1.25rem;font-family:var(--font-display);margin-bottom:4px">${item.name}</h3>
        <p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:24px">${CATEGORY_LABELS[item.category] || item.category}</p>
        <div style="display:flex;gap:12px">
          <button class="admin-card-btn" onclick="editMenuItem(${item.id})"><span class="material-symbols-outlined" style="font-size:18px">edit</span>Edit</button>
          <button class="admin-card-btn" onclick="deleteMenuItem(${item.id})"><span class="material-symbols-outlined" style="font-size:18px">delete</span>Delete</button>
        </div>
      </div>
    </div>
  `).join('');

  // Update sidebar counts
  const totalEl = document.getElementById('admin-menu-total');
  const activeEl = document.getElementById('admin-menu-active');
  if (totalEl) totalEl.textContent = items.length;
  if (activeEl) activeEl.textContent = items.length;
}

function editMenuItem(id) {
  const items = loadMenuItems();
  const item = items.find(i => i.id === id);
  if (!item) return;
  showMenuItemModal(item);
}

function deleteMenuItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  let items = loadMenuItems();
  items = items.filter(i => i.id !== id);
  saveMenuItems(items);
  renderAdminMenuCards();
  showToast('Item deleted successfully');
}

function showMenuItemModal(existingItem) {
  // Remove existing modal
  const old = document.getElementById('menu-item-modal');
  if (old) old.remove();

  const isEdit = !!existingItem;
  const modal = document.createElement('div');
  modal.id = 'menu-item-modal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);backdrop-filter:blur(4px);';
  modal.innerHTML = `
    <div style="background:white;border-radius:24px;padding:40px;width:420px;max-width:90%;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);animation:modalIn 0.3s ease">
      <h3 style="font-size:1.25rem;font-weight:700;font-family:var(--font-display);margin-bottom:24px">${isEdit ? 'Edit Item' : 'Add New Item'}</h3>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Item Name</label>
          <input id="modal-name" type="text" value="${isEdit ? existingItem.name : ''}" style="width:100%;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;box-sizing:border-box" />
        </div>
        <div>
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Price (₹)</label>
          <input id="modal-price" type="number" value="${isEdit ? existingItem.price : ''}" style="width:100%;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;box-sizing:border-box" />
        </div>
        <div>
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Category</label>
          <select id="modal-category" style="width:100%;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;box-sizing:border-box;background:white">
            <option value="breakfast" ${isEdit && existingItem.category === 'breakfast' ? 'selected' : ''}>Breakfast</option>
            <option value="lunch" ${isEdit && existingItem.category === 'lunch' ? 'selected' : ''}>Lunch Special</option>
            <option value="snacks" ${isEdit && existingItem.category === 'snacks' ? 'selected' : ''}>Evening Snacks</option>
            <option value="beverages" ${isEdit && existingItem.category === 'beverages' ? 'selected' : ''}>Beverages</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Type</label>
          <select id="modal-type" style="width:100%;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;box-sizing:border-box;background:white">
            <option value="veg" ${isEdit && existingItem.type === 'veg' ? 'selected' : ''}>Veg</option>
            <option value="nonveg" ${isEdit && existingItem.type !== 'veg' ? 'selected' : ''}>Non-Veg</option>
          </select>
        </div>
        <div>
          <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#64748b;margin-bottom:6px">Description</label>
          <textarea id="modal-desc" rows="2" style="width:100%;padding:12px 16px;border:1px solid #e2e8f0;border-radius:12px;font-size:14px;resize:none;box-sizing:border-box">${isEdit ? existingItem.desc : ''}</textarea>
        </div>
      </div>
      <div style="display:flex;gap:12px;margin-top:28px">
        <button onclick="saveMenuItemFromModal(${isEdit ? existingItem.id : 'null'})" style="flex:1;padding:14px;border-radius:12px;background:#1a1a1a;color:white;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;transition:all 0.3s;cursor:pointer;border:none">${isEdit ? 'Update Item' : 'Add Item'}</button>
        <button onclick="document.getElementById('menu-item-modal').remove()" style="flex:1;padding:14px;border-radius:12px;background:#f1f5f9;color:#475569;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.15em;transition:all 0.3s;cursor:pointer;border:none">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

function saveMenuItemFromModal(existingId) {
  const name = document.getElementById('modal-name').value.trim();
  const price = parseInt(document.getElementById('modal-price').value);
  const category = document.getElementById('modal-category').value;
  const type = document.getElementById('modal-type').value;
  const desc = document.getElementById('modal-desc').value.trim();

  if (!name || !price || price <= 0) {
    showToast('Please fill in name and a valid price');
    return;
  }

  let items = loadMenuItems();

  if (existingId) {
    // Edit existing
    const item = items.find(i => i.id === existingId);
    if (item) {
      item.name = name;
      item.price = price;
      item.category = category;
      item.type = type;
      item.desc = desc || item.desc;
    }
    showToast('Item updated successfully!');
  } else {
    // Add new
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    items.push({
      id: newId, name, price, category, type, desc: desc || 'Delicious item freshly prepared.',
      image: type === 'veg' ? 'assets/images/loaded nachos.jpeg' : 'assets/images/chicken caeser wrap.jpeg'
    });
    showToast('New item added!');
  }

  saveMenuItems(items);
  renderAdminMenuCards();
  document.getElementById('menu-item-modal').remove();
}

// --- Dynamic Student Menu Rendering ---
function initStudentMenu() {
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  // Check if page is student menu (not admin)
  if (document.getElementById('admin-menu-grid')) return;

  const items = loadMenuItems();
  grid.innerHTML = items.map(item => `
    <div class="food-card glass-card card-shadow card-hover" data-category="${item.category}">
      <div class="card-image image-gradient">
        <div class="splash-bg"></div>
        <div class="card-image-bg" style="background-image:url('${item.image}')"></div>
        <span class="card-badge badge-${item.type === 'veg' ? 'veg' : 'nonveg'}">${item.type === 'veg' ? 'Veg' : 'Non-Veg'}</span>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3 class="card-name">${item.name}</h3><span class="card-price">₹${item.price}</span>
        </div>
        <p class="card-desc">${item.desc}</p>
        <div class="card-footer"><span class="card-category">${CATEGORY_LABELS[item.category] || item.category}</span><button class="btn-premium card-action-btn" onclick="addToCart('${item.name.replace(/'/g, "\\'")}',${item.price},'${item.image}')">Add to Cart</button></div>
      </div>
    </div>
  `).join('');
}

function loadCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function getCartItems() {
  return loadCart();
}

function saveOrder(orderData) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(orderData));
}

function loadOrder() {
  try {
    const data = localStorage.getItem(ORDER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function loadOrderHistory() {
  try {
    const data = localStorage.getItem(ORDERS_HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

function saveOrderHistory(orders) {
  localStorage.setItem(ORDERS_HISTORY_KEY, JSON.stringify(orders));
}

// --- Generate Order ID ---
function generateOrderId() {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${num}`;
}

// --- Shared Card Filtering (Search + Category) ---
let activeCategory = 'all';
let searchQuery = '';

function filterCards() {
  const cards = document.querySelectorAll('.food-card');
  const query = searchQuery.toLowerCase().trim();

  cards.forEach(card => {
    const cardName = (card.querySelector('.card-name') || card.querySelector('h3'));
    const cardDesc = card.querySelector('.card-desc');
    const cardCategory = card.querySelector('.card-category');
    
    const name = cardName ? cardName.textContent.toLowerCase() : '';
    const desc = cardDesc ? cardDesc.textContent.toLowerCase() : '';
    const category = cardCategory ? cardCategory.textContent.toLowerCase() : '';
    const dataCategory = card.dataset.category || '';

    const matchesCategory = activeCategory === 'all' || dataCategory === activeCategory;
    const matchesSearch = !query || name.includes(query) || desc.includes(query) || category.includes(query);

    card.style.display = (matchesCategory && matchesSearch) ? '' : 'none';
  });

  // Show "no results" message if needed
  const grid = document.getElementById('menu-grid');
  if (!grid) return;
  let noResults = grid.querySelector('.no-results-msg');
  const visibleCards = grid.querySelectorAll('.food-card:not([style*="display: none"])');

  if (visibleCards.length === 0 && query) {
    if (!noResults) {
      noResults = document.createElement('div');
      noResults.className = 'no-results-msg';
      noResults.style.cssText = 'grid-column:1/-1;text-align:center;padding:64px 0;color:#94a3b8;';
      grid.appendChild(noResults);
    }
    noResults.innerHTML = `
      <span class="material-symbols-outlined" style="font-size:48px;opacity:0.3;display:block;margin-bottom:12px">search_off</span>
      <p style="font-size:14px;font-weight:600">No results for "${searchQuery}"</p>
      <p style="font-size:12px;margin-top:4px;font-weight:300">Try a different search term</p>
    `;
    noResults.style.display = '';
  } else if (noResults) {
    noResults.style.display = 'none';
  }
}

// --- Filter Chips ---
function initFilterChips() {
  const chips = document.querySelectorAll('.filter-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.category;
      filterCards();
    });
  });
}

// --- Search ---
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    filterCards();
  });

  // Also handle Enter key to prevent form submission
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.preventDefault();
  });
}

// --- Cart UI (Menu Page Sidebar) ---
function updateCartUI() {
  const cartItemsEl = document.getElementById('cart-items');
  const cartCountEl = document.getElementById('cart-count');
  const cartBadgeEl = document.getElementById('cart-badge');
  const subtotalEl = document.getElementById('cart-subtotal');
  const totalEl = document.getElementById('cart-total');
  const convenienceEl = document.getElementById('cart-convenience');

  const items = getCartItems();

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const convenience = items.length > 0 ? CONVENIENCE_FEE : 0;
  const total = subtotal + convenience;

  if (cartCountEl) cartCountEl.textContent = `${totalItems} Selected`;
  if (cartBadgeEl) {
    cartBadgeEl.textContent = totalItems;
    cartBadgeEl.style.display = totalItems > 0 ? '' : 'none';
  }
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal}`;
  if (totalEl) totalEl.textContent = `₹${total}`;
  if (convenienceEl) convenienceEl.textContent = `₹${convenience}`;

  if (!cartItemsEl) return;

  if (items.length === 0) {
    cartItemsEl.innerHTML = `
      <div style="text-align:center;padding:32px 0;color:#94a3b8">
        <span class="material-symbols-outlined" style="font-size:48px;opacity:0.3;margin-bottom:12px;display:block">shopping_cart</span>
        <p style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em">Your cart is empty</p>
        <p style="font-size:11px;margin-top:4px;font-weight:300">Add items from the menu to get started</p>
      </div>`;
    return;
  }

  cartItemsEl.innerHTML = items.map(item => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-image" style="background-image: url('${item.image}')"></div>
      <div class="cart-item-details">
        <div class="cart-item-header">
          <h4>${item.name}</h4>
          <button class="cart-remove-btn" onclick="removeFromCart(${item.id})">
            <span class="material-symbols-outlined" style="font-size:18px">close</span>
          </button>
        </div>
        <div class="cart-item-controls">
          <div class="qty-control">
            <button onclick="updateQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateQty(${item.id}, 1)">+</button>
          </div>
          <span class="cart-item-price">₹${item.price * item.qty}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(name, price, image) {
  const items = getCartItems();
  const existing = items.find(item => item.name === name);

  if (existing) {
    existing.qty++;
  } else {
    items.push({
      id: Date.now(),
      name,
      price,
      qty: 1,
      image
    });
  }

  saveCart(items);
  updateCartUI();

  // Flash cart badge
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.style.transform = 'scale(1.3)';
    setTimeout(() => badge.style.transform = 'scale(1)', 200);
  }

  // Show a subtle toast notification
  showToast(`${name} added to cart!`);
}

function removeFromCart(id) {
  let items = getCartItems();
  items = items.filter(item => item.id !== id);
  saveCart(items);
  updateCartUI();
}

function updateQty(id, delta) {
  const items = getCartItems();
  const item = items.find(i => i.id === id);
  if (item) {
    item.qty = Math.max(1, item.qty + delta);
    saveCart(items);
    updateCartUI();
  }
}

// --- Toast Notification ---
function showToast(message) {
  // Remove existing toast
  const existing = document.querySelector('.cart-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px">check_circle</span> ${message}`;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1a1a1a;
    color: white;
    padding: 14px 28px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// --- Checkout Page ---
function initCheckoutPage() {
  const checkoutItemsEl = document.getElementById('checkout-items');
  if (!checkoutItemsEl) return;

  const items = getCartItems();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const convenience = items.length > 0 ? CONVENIENCE_FEE : 0;
  const total = subtotal + convenience;

  // Render order items
  if (items.length === 0) {
    checkoutItemsEl.innerHTML = `
      <div style="text-align:center;padding:24px 0;color:#94a3b8">
        <p style="font-size:13px;font-weight:600">No items in your cart</p>
        <a href="menu.html" style="font-size:12px;color:#1a1a1a;font-weight:700;text-decoration:underline;margin-top:8px;display:inline-block">Browse Menu</a>
      </div>`;
  } else {
    checkoutItemsEl.innerHTML = items.map(item => `
      <div class="checkout-order-item">
        <div class="checkout-order-thumb" style="background-image:url('${item.image}')"></div>
        <div style="flex:1">
          <h4 style="font-weight:700;font-size:0.875rem">${item.name}</h4>
          <p style="font-size:11px;color:#94a3b8">Qty: ${item.qty}</p>
        </div>
        <span style="font-weight:700;font-size:0.875rem">₹${item.price * item.qty}</span>
      </div>
    `).join('');
  }

  // Update pricing
  const checkoutSubtotal = document.getElementById('checkout-subtotal');
  const checkoutConvenience = document.getElementById('checkout-convenience');
  const checkoutTotal = document.getElementById('checkout-total');
  if (checkoutSubtotal) checkoutSubtotal.textContent = `₹${subtotal}`;
  if (checkoutConvenience) checkoutConvenience.textContent = `₹${convenience}`;
  if (checkoutTotal) checkoutTotal.textContent = `₹${total}`;

  // Update cart badge
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
  const cartBadgeEl = document.getElementById('cart-badge');
  if (cartBadgeEl) {
    cartBadgeEl.textContent = totalItems;
    cartBadgeEl.style.display = totalItems > 0 ? '' : 'none';
  }
}

// --- Place Order ---
function placeOrder() {
  const items = getCartItems();
  if (items.length === 0) {
    showToast('Your cart is empty!');
    return;
  }

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal + CONVENIENCE_FEE;
  const orderId = generateOrderId();
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();

  const order = {
    id: orderId,
    items: items,
    subtotal,
    convenience: CONVENIENCE_FEE,
    total,
    placedAt: timeStr,
    placedTimestamp: now.getTime()
  };

  saveOrder(order);
  // Add to order history
  const history = loadOrderHistory();
  history.unshift({
    id: orderId,
    student: 'Arjun Mehta',
    items: items.map(i => i.name + (i.qty > 1 ? ' ×' + i.qty : '')).join(', '),
    total,
    pickupTime: timeStr,
    status: 'Preparing',
    placedTimestamp: now.getTime()
  });
  saveOrderHistory(history);
  // Clear cart
  saveCart([]);
  // Navigate to track order
  window.location.href = 'track-order.html';
}

// --- Track Order Page ---
function initTrackOrderPage() {
  const orderItemsEl = document.getElementById('order-items');
  if (!orderItemsEl) return;

  const order = loadOrder();

  if (!order) {
    orderItemsEl.innerHTML = `
      <div style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;padding:16px 0">
        No order found. <a href="menu.html" style="color:white;text-decoration:underline">Browse Menu</a>
      </div>`;
    return;
  }

  // Update order ID in heading
  const headingP = document.querySelector('.page-heading p');
  if (headingP) {
    headingP.textContent = `Your order #${order.id} is being prepared fresh. We'll notify you when it's ready.`;
  }

  // Update order placed time
  const orderTimeEl = document.getElementById('order-placed-time');
  if (orderTimeEl) orderTimeEl.textContent = order.placedAt;

  // Render order items
  orderItemsEl.innerHTML = order.items.map(item => `
    <div style="display:flex;justify-content:space-between;color:rgba(255,255,255,0.7);font-size:0.875rem">
      <span>${item.name}${item.qty > 1 ? ' ×' + item.qty : ''}</span>
      <span style="font-weight:700;color:white">₹${item.price * item.qty}</span>
    </div>
  `).join('');

  // Update pricing
  const orderSubtotal = document.getElementById('order-subtotal');
  const orderConvenience = document.getElementById('order-convenience');
  const orderTotal = document.getElementById('order-total');
  if (orderSubtotal) orderSubtotal.textContent = `₹${order.subtotal}`;
  if (orderConvenience) orderConvenience.textContent = `₹${order.convenience}`;
  if (orderTotal) orderTotal.textContent = `₹${order.total}`;

  // Update cart badge (should be 0 after order)
  const cartBadgeEl = document.getElementById('cart-badge');
  if (cartBadgeEl) {
    cartBadgeEl.textContent = '0';
    cartBadgeEl.style.display = 'none';
  }
}

// --- Pickup Time Selection ---
function initPickupTime() {
  const btns = document.querySelectorAll('.pickup-time-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => {
        b.classList.remove('active');
        b.style.background = '';
        b.style.color = '';
      });
      btn.classList.add('active');
      btn.style.background = '#1a1a1a';
      btn.style.color = 'white';
    });
  });
}

// --- Payment Method Selection ---
function initPaymentMethod() {
  const methods = document.querySelectorAll('.payment-method');
  methods.forEach(method => {
    method.addEventListener('click', () => {
      methods.forEach(m => {
        m.style.opacity = m === method ? '1' : '0.6';
        m.style.borderColor = m === method ? 'rgba(26,26,26,0.2)' : 'transparent';
        // Update radio dot
        const dot = m.querySelector('.radio-dot');
        if (dot) {
          dot.style.display = m === method ? 'block' : 'none';
        }
      });
    });
  });
}

// --- Countdown Timer ---
function initCountdown() {
  const minEl = document.getElementById('countdown-min');
  const secEl = document.getElementById('countdown-sec');

  if (!minEl || !secEl) return;

  let totalSeconds = 12 * 60 + 45;

  setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      minEl.textContent = mins;
      secEl.textContent = secs.toString().padStart(2, '0');
    }
  }, 1000);
}

// --- Admin Sidebar Navigation ---
function initAdminNav() {
  const links = document.querySelectorAll('.nav-link, .icon-nav-btn');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        window.location.href = href;
      }
    });
  });
}

// --- Admin Dashboard Stats ---
function initDashboard() {
  const totalEl = document.getElementById('dash-total-orders');
  if (!totalEl) return;

  const history = loadOrderHistory();
  const activeOrders = history.filter(o => o.status !== 'Completed');
  const totalRevenue = history.reduce((sum, o) => sum + (o.total || 0), 0);

  // Total orders
  totalEl.textContent = history.length;
  const noteEl = document.getElementById('dash-orders-note');
  if (noteEl) noteEl.textContent = history.length > 0 ? `${history.length} order${history.length !== 1 ? 's' : ''} placed` : 'No orders yet';

  // Revenue
  const revEl = document.getElementById('dash-revenue');
  if (revEl) revEl.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  const revNote = document.getElementById('dash-revenue-note');
  if (revNote) revNote.textContent = history.length > 0 ? 'Total earnings' : 'No revenue yet';

  // Active orders
  const activeEl = document.getElementById('dash-active-orders');
  if (activeEl) activeEl.textContent = activeOrders.length;

  // Most popular item — count item occurrences across all orders
  const itemCounts = {};
  history.forEach(order => {
    const itemNames = order.items ? order.items.split(', ') : [];
    itemNames.forEach(name => {
      // Strip quantity like ' ×2'
      const cleanName = name.replace(/ ×\d+$/, '');
      itemCounts[cleanName] = (itemCounts[cleanName] || 0) + 1;
    });
  });

  const popularEl = document.getElementById('dash-popular-item');
  const popularCountEl = document.getElementById('dash-popular-count');
  if (Object.keys(itemCounts).length > 0) {
    const topItem = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0];
    if (popularEl) popularEl.textContent = topItem[0];
    if (popularCountEl) popularCountEl.textContent = `${topItem[1]} order${topItem[1] !== 1 ? 's' : ''}`;
  } else {
    if (popularEl) popularEl.textContent = '—';
    if (popularCountEl) popularCountEl.textContent = 'No data yet';
  }
}

// --- Admin Revenue Page ---
function initRevenuePage() {
  const revEl = document.getElementById('rev-today-revenue');
  if (!revEl) return;

  const history = loadOrderHistory();
  const totalRevenue = history.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalOrders = history.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const fees = totalOrders * CONVENIENCE_FEE;
  const productRev = totalRevenue - fees;

  // Populate summary stats
  revEl.textContent = `₹${totalRevenue.toLocaleString('en-IN')}`;
  const avgEl = document.getElementById('rev-avg-order');
  if (avgEl) avgEl.textContent = `₹${avgOrder.toLocaleString('en-IN')}`;
  const ordersEl = document.getElementById('rev-total-orders');
  if (ordersEl) ordersEl.textContent = totalOrders;
  const prodRevEl = document.getElementById('rev-product-rev');
  if (prodRevEl) prodRevEl.textContent = `₹${productRev.toLocaleString('en-IN')}`;
  const feesEl = document.getElementById('rev-fees');
  if (feesEl) feesEl.textContent = `₹${fees.toLocaleString('en-IN')}`;

  // Top Selling Products — count item occurrences and compute revenue
  const menuItems = loadMenuItems();
  const itemStats = {};
  history.forEach(order => {
    const itemNames = order.items ? order.items.split(', ') : [];
    itemNames.forEach(name => {
      const cleanName = name.replace(/ ×\d+$/, '');
      if (!itemStats[cleanName]) itemStats[cleanName] = { count: 0, revenue: 0 };
      itemStats[cleanName].count += 1;
      // Find price from menu
      const menuItem = menuItems.find(m => m.name === cleanName);
      if (menuItem) itemStats[cleanName].revenue += menuItem.price;
    });
  });

  const topProducts = Object.entries(itemStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  const container = document.getElementById('rev-top-products');
  if (!container) return;

  if (topProducts.length === 0) {
    container.innerHTML = '<p style="color:#94a3b8;font-size:14px;padding:16px">No orders yet. Place orders from the student menu to see data here.</p>';
    return;
  }

  container.innerHTML = topProducts.map(([name, stats]) => {
    const menuItem = menuItems.find(m => m.name === name);
    const img = menuItem ? menuItem.image : 'assets/images/loaded nachos.jpeg';
    return `
      <div class="top-product">
        <div style="width:56px;height:56px;border-radius:12px;overflow:hidden">
          <img src="${img}" style="width:100%;height:100%;object-fit:cover" alt="${name}" />
        </div>
        <div style="flex:1">
          <h4 style="font-weight:700;font-size:0.875rem">${name}</h4>
          <p style="font-size:11px;color:#94a3b8">${stats.count} order${stats.count !== 1 ? 's' : ''}</p>
        </div>
        <div style="text-align:right">
          <p style="font-weight:700;font-size:0.875rem">₹${stats.revenue.toLocaleString('en-IN')}</p>
        </div>
      </div>
    `;
  }).join('');
}

// --- Initialize on DOM Ready ---
document.addEventListener('DOMContentLoaded', () => {
  initPageAnimation();
  initStudentMenu();
  initFilterChips();
  initSearch();
  initPickupTime();
  initPaymentMethod();
  initCountdown();
  initAdminNav();
  initAdminMenu();
  initDashboard();
  initRevenuePage();
  updateCartUI();
  initCheckoutPage();
  initTrackOrderPage();
  initAdminOrders();
});

// --- Admin Orders Page ---
function initAdminOrders() {
  const ordersTableBody = document.getElementById('admin-orders-body');
  if (!ordersTableBody) return;

  const history = loadOrderHistory();
  const orderCountEl = document.getElementById('admin-orders-count');
  const activeCountEl = document.getElementById('admin-active-count');
  const completedCountEl = document.getElementById('admin-completed-count');

  const activeOrders = history.filter(o => o.status !== 'Completed');
  const completedOrders = history.filter(o => o.status === 'Completed');

  if (orderCountEl) orderCountEl.textContent = `Showing ${history.length} order${history.length !== 1 ? 's' : ''}`;
  if (activeCountEl) {
    activeCountEl.textContent = activeOrders.length;
  }
  if (completedCountEl) {
    completedCountEl.textContent = completedOrders.length;
  }

  if (history.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;padding:48px 0;color:#94a3b8">
          <span class="material-symbols-outlined" style="font-size:48px;opacity:0.3;display:block;margin-bottom:12px">receipt_long</span>
          <p style="font-size:14px;font-weight:600">No orders yet</p>
          <p style="font-size:12px;margin-top:4px;font-weight:300">Orders placed by students will appear here</p>
        </td>
      </tr>`;
    return;
  }

  ordersTableBody.innerHTML = history.map(order => {
    let badgeStyle = '';
    if (order.status === 'Preparing') {
      badgeStyle = 'background:#FEF3C7;color:#92400E;border:1px solid #FDE68A';
    } else if (order.status === 'Ready') {
      badgeStyle = 'background:rgba(15,23,42,0.1);color:#0f172a;border:1px solid rgba(15,23,42,0.2)';
    } else {
      badgeStyle = 'background:rgba(16,185,129,0.1);color:#065f46;border:1px solid rgba(16,185,129,0.2)';
    }

    return `
      <tr>
        <td><span style="font-weight:700">#${order.id}</span></td>
        <td>${order.student}</td>
        <td>${order.items}</td>
        <td>${order.pickupTime}</td>
        <td>
          <select class="status-select" style="${badgeStyle}" onchange="updateOrderStatus('${order.id}', this.value, this)">
            <option ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
            <option ${order.status === 'Ready' ? 'selected' : ''}>Ready</option>
            <option ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
          </select>
        </td>
      </tr>`;
  }).join('');
}

function updateOrderStatus(orderId, newStatus, selectEl) {
  const history = loadOrderHistory();
  const order = history.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrderHistory(history);

    // Update select styling
    if (newStatus === 'Preparing') {
      selectEl.style.background = '#FEF3C7';
      selectEl.style.color = '#92400E';
      selectEl.style.borderColor = '#FDE68A';
    } else if (newStatus === 'Ready') {
      selectEl.style.background = 'rgba(15,23,42,0.1)';
      selectEl.style.color = '#0f172a';
      selectEl.style.borderColor = 'rgba(15,23,42,0.2)';
    } else {
      selectEl.style.background = 'rgba(16,185,129,0.1)';
      selectEl.style.color = '#065f46';
      selectEl.style.borderColor = 'rgba(16,185,129,0.2)';
    }

    // Update counts
    const activeCountEl = document.getElementById('admin-active-count');
    const completedCountEl = document.getElementById('admin-completed-count');
    const activeOrders = history.filter(o => o.status !== 'Completed');
    const completedOrders = history.filter(o => o.status === 'Completed');
    if (activeCountEl) activeCountEl.textContent = activeOrders.length;
    if (completedCountEl) completedCountEl.textContent = completedOrders.length;
  }
}
