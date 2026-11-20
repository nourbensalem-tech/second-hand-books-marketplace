// ── DATA ──
const BOOKS = {
    "don-quichotte":  { title:"Don Quichotte",       author:"Miguel de Cervantes",        price:32, condition:"Très bon état", img:"livre1.png" },
    "two-cities":     { title:"A Tale of Two Cities", author:"Charles Dickens",            price:27, condition:"Bon état",      img:"livre2.png" },
    "petit-prince":   { title:"Le Petit Prince",      author:"Antoine de Saint-Exupéry",   price:22, condition:"Comme neuf",   img:"livre3.png" },
    "harry-potter":   { title:"Harry Potter",         author:"J.K. Rowling",               price:40, condition:"Bon état",      img:"livre4.png" },
    "hobbit":         { title:"The Hobbit",            author:"J.R.R. Tolkien",             price:35, condition:"Très bon état", img:"livre5.png" },
};

let cart = JSON.parse(localStorage.getItem('leafloop_cart') || '[]');
let shippingCost = 0;
let promoDiscount = 0;

// ── SAVE & LOAD ──
function saveCart() {
    localStorage.setItem('leafloop_cart', JSON.stringify(cart));
}

// Public API for other pages to add items
window.addToCart = function(bookId) {
    const book = BOOKS[bookId];
    if (!book) return;
    const existing = cart.find(i => i.id === bookId);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ id: bookId, qty: 1, ...book });
    }
    saveCart();
    updateCartCount();
    showToast(`✅ "${book.title}" ajouté au panier !`, 'success');
};

// ── RENDER ──
function renderCart() {
    const list = document.getElementById('cartItemsList');
    const empty = document.getElementById('cartEmpty');
    const btn = document.getElementById('checkoutBtn');

    list.innerHTML = '';

    if (cart.length === 0) {
        empty.classList.add('show');
        btn.disabled = true;
        updateTotals();
        return;
    }

    empty.classList.remove('show');
    btn.disabled = false;

    cart.forEach(item => {
        const el = document.createElement('div');
        el.className = 'cart-item';
        el.dataset.id = item.id;
        el.innerHTML = `
            <img class="cart-item-img" src="${item.img}" alt="${item.title}"
                 onerror="this.outerHTML='<div class=\\'cart-item-img-placeholder\\'><i class=\\'fa fa-book\\'></i></div>'">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-author">${item.author}</div>
                <div class="cart-item-condition"><i class="fa fa-star" style="font-size:.65rem;"></i>${item.condition}</div>
                <div class="cart-item-price">${(item.price * item.qty).toFixed(0)} DT</div>
            </div>
            <div class="cart-item-controls">
                <div class="qty-control">
                    <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
                    <span class="qty-num">${item.qty}</span>
                    <button class="qty-btn" onclick="changeQty('${item.id}', +1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeItem('${item.id}')">
                    <i class="fa fa-trash"></i> Retirer
                </button>
            </div>
        `;
        list.appendChild(el);
    });

    updateTotals();
    updateCartCount();
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty = Math.max(1, item.qty + delta);
    saveCart();
    renderCart();
}

function removeItem(id) {
    const el = document.querySelector(`.cart-item[data-id="${id}"]`);
    if (el) {
        el.classList.add('removing');
        setTimeout(() => {
            cart = cart.filter(i => i.id !== id);
            saveCart();
            renderCart();
        }, 300);
    }
}

function updateTotals() {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const total = Math.max(0, subtotal + shippingCost - promoDiscount);
    document.getElementById('subtotalVal').textContent = subtotal.toFixed(0) + ' DT';
    document.getElementById('shippingVal').textContent = shippingCost === 0 ? 'Gratuit' : shippingCost + ' DT';
    document.getElementById('totalVal').textContent = total.toFixed(0) + ' DT';
}

function updateCartCount() {
    const total = cart.reduce((s, i) => s + i.qty, 0);
    const el = document.getElementById('cartCount');
    if (el) {
        el.textContent = total;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
    }
}

// ── SHIPPING ──
function selectShipping(el, cost) {
    document.querySelectorAll('.ship-opt').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
    shippingCost = cost;
    updateTotals();
}

// ── PROMO ──
const PROMOS = { 'LEAF10': 10, 'LOOP20': 20, 'BOOKCYCLE': 15 };
function applyPromo() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    if (PROMOS[code]) {
        promoDiscount = PROMOS[code];
        document.getElementById('promoRow').style.display = 'flex';
        document.getElementById('promoVal').textContent = `-${promoDiscount} DT`;
        updateTotals();
        showToast(`🎉 Code "${code}" appliqué ! -${promoDiscount} DT`, 'success');
    } else {
        showToast('❌ Code promo invalide.', '');
    }
}

// ── CHECKOUT ──
function openCheckout() {
    if (cart.length === 0) return;
    document.getElementById('checkoutModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal() {
    document.getElementById('checkoutModal').classList.remove('active');
    document.body.style.overflow = '';
}
function closeOnBackdrop(e) {
    if (e.target === document.getElementById('checkoutModal')) closeModal();
}
function clearCartAndClose() {
    cart = [];
    saveCart();
    closeModal();
    renderCart();
    showToast('✅ Merci ! Votre commande a été passée.', 'success');
    setTimeout(() => { window.location.href = 'acceuil2.html'; }, 1800);
}

// ── TOAST ──
function showToast(msg, type) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast show' + (type === 'success' ? ' success' : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── INIT ──
renderCart();

// Escape key
document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

