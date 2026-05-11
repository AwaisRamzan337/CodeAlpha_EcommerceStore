let cart = [];
let allProducts = [];
let wishlist = [];
let currentCategory = 'all';

// =====================
// INIT
// =====================
async function init() {
    await checkUser();
    await loadProducts();
    startCountdown();
    loadWishlistFromStorage();
}

// =====================
// HAMBURGER MENU
// =====================
function toggleMenu() {
    const nav = document.getElementById('navLinks');
    nav.classList.toggle('open');
}

// =====================
// USER CHECK
// =====================
async function checkUser() {
    const res = await fetch('/me');
    const data = await res.json();
    if (data.loggedIn) {
        document.getElementById('userInfo').textContent = `👑 ${data.username}`;
        document.getElementById('loginBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'inline';
        document.getElementById('profileBtn').style.display = 'inline';
    } else {
        document.getElementById('loginBtn').style.display = 'inline';
        document.getElementById('logoutBtn').style.display = 'none';
        document.getElementById('profileBtn').style.display = 'none';
    }
}

// =====================
// LOAD PRODUCTS
// =====================
async function loadProducts() {
    // Skeleton dikhao
    document.getElementById('skeletonGrid').style.display = 'grid';
    document.getElementById('productsGrid').style.display = 'none';

    // Fake delay for skeleton effect
    await new Promise(resolve => setTimeout(resolve, 1200));

    const res = await fetch('/api/products');
    allProducts = await res.json();

    // Skeleton hatao
    document.getElementById('skeletonGrid').style.display = 'none';
    document.getElementById('productsGrid').style.display = 'grid';

    renderProducts(allProducts);
}

// =====================
// RENDER PRODUCTS
// =====================
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');

    if (products.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:60px; color:var(--muted)">
                <div style="font-size:50px">🔍</div>
                <h3 style="margin-top:15px; font-family:'Poppins',sans-serif">No products found!</h3>
            </div>`;
        return;
    }

    grid.innerHTML = products.map(p => `
        <div class="product-card" onclick="viewProduct(${p.id})">
            <span class="badge">NEW</span>
            <button class="wishlist-btn"
                onclick="event.stopPropagation(); toggleWishlist(${p.id}, '${p.name}', ${p.price}, '${p.image}', '${p.description}', this)">
                ${wishlist.find(w => w.id === p.id) ? '❤️' : '🤍'}
            </button>
            <span class="emoji">${p.image}</span>
            <h3>${p.name}</h3>
            <p class="desc">${p.description}</p>
            <div class="stars">⭐⭐⭐⭐⭐</div>
            <div class="price">$${p.price}</div>
            <button class="btn-cart"
                onclick="event.stopPropagation(); addToCart('${p.name}', ${p.price})">
                + Add to Cart
            </button>
        </div>
    `).join('');
}

// =====================
// PRODUCT DETAILS
// =====================
function viewProduct(id) {
    window.location.href = `/product/${id}`;
}

// =====================
// SEARCH & FILTER
// =====================
function filterProducts() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const price = document.getElementById('priceFilter').value;

    let filtered = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search) ||
                           p.description.toLowerCase().includes(search);
        const matchCat = currentCategory === 'all' || p.category === currentCategory;
        let matchPrice = true;
        if (price === 'low') matchPrice = p.price < 200;
        else if (price === 'mid') matchPrice = p.price >= 200 && p.price <= 500;
        else if (price === 'high') matchPrice = p.price > 500;
        return matchSearch && matchCat && matchPrice;
    });

    renderProducts(filtered);
}

function setCat(cat, el) {
    currentCategory = cat;
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    filterProducts();
}

// =====================
// CART
// =====================
function addToCart(name, price) {
    cart.push({ name, price });
    renderCart();
    showToast(`✅ ${name} added to cart!`, 'success');
}

function removeFromCart(index) {
    const removed = cart[index].name;
    cart.splice(index, 1);
    renderCart();
    showToast(`❌ ${removed} removed!`, 'error');
}

function renderCart() {
    const cartDiv = document.getElementById('cartItems');
    const totalDiv = document.getElementById('cartTotal');
    const countEl = document.getElementById('cartCount');

    countEl.textContent = cart.length;

    if (cart.length === 0) {
        cartDiv.innerHTML = '<p style="color:var(--muted)">Your cart is empty.</p>';
        totalDiv.textContent = '';
        return;
    }

    cartDiv.innerHTML = cart.map((item, i) => `
        <div class="cart-item">
            <span class="cart-item-name">👑 ${item.name}</span>
            <span>
                <span class="cart-item-price">$${item.price}</span>
                <button class="remove-btn" onclick="removeFromCart(${i})">✕ Remove</button>
            </span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalDiv.textContent = `Total: $${total}`;
}

// =====================
// CHECKOUT
// =====================
function goCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    localStorage.setItem('checkoutCart', JSON.stringify(cart));
    window.location.href = '/checkout';
}

// =====================
// WISHLIST
// =====================
function loadWishlistFromStorage() {
    const saved = localStorage.getItem('wishlist');
    if (saved) wishlist = JSON.parse(saved);
}

function toggleWishlist(id, name, price, image, description, btn) {
    const index = wishlist.findIndex(w => w.id === id);
    if (index === -1) {
        wishlist.push({ id, name, price, image, description });
        btn.textContent = '❤️';
        showToast(`❤️ ${name} added to wishlist!`, 'success');
    } else {
        wishlist.splice(index, 1);
        btn.textContent = '🤍';
        showToast(`💔 ${name} removed from wishlist!`, 'error');
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// =====================
// TOAST
// =====================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// =====================
// COUNTDOWN
// =====================
function startCountdown() {
    let time = 3 * 60 * 60;
    const el = document.getElementById('countdown');
    setInterval(() => {
        const h = String(Math.floor(time / 3600)).padStart(2, '0');
        const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
        const s = String(time % 60).padStart(2, '0');
        el.textContent = `${h}:${m}:${s}`;
        if (time > 0) time--;
    }, 1000);
}

// START
init();