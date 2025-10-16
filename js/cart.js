// ---------- Selectors ----------
const cartIcon = document.getElementById("cartIcon");
const cartModal = document.getElementById("cartModal");
const cartItems = document.getElementById("cartItems");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const checkoutBtn = document.getElementById("checkoutBtn");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

// ---------- Initialize Cart ----------
export let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ---------- Update Count ----------
export function updateCartCount() {
  if (cartCount) {
    const totalCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
    cartCount.textContent = totalCount;
  }
}

// ---------- Show Toast Message ----------
function showMessage(msgText, color = "#28a745") {
  const msg = document.createElement("div");
  msg.textContent = msgText;
  msg.style.cssText = `
    position: fixed; top: 15px; right: 15px;
    background: ${color}; color: white;
    padding: 8px 14px; border-radius: 6px;
    z-index: 9999; 
    font-size: 14px;
    animation: fadeout 2s forwards;
  `;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2000);
}

// ---------- Render Cart ----------
export function renderCart() {
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItems.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "0.00";
    return;
  }

  cart.forEach((item, index) => {
    const final = parseFloat(item.finalPrice || item.price) || 0;
    const subtotal = final * item.qty;
    total += subtotal;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
      <div class="cart-item-left">
        <img src="${item.image}" alt="${item.name}" 
             style="width:60px;height:60px;object-fit:cover;border-radius:8px;">
      </div>
      <div class="cart-item-right">
        <div class="cart-item-info">
          <span class="cart-name">${item.name}</span>
          <span class="cart-price">$${final.toFixed(2)}</span>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn decrease" data-index="${index}">-</button>
          <span class="qty">${item.qty}</span>
          <button class="qty-btn increase" data-index="${index}">+</button>
          <button class="remove-btn" data-index="${index}>🗑</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  cartTotal.textContent = total.toFixed(2);
  attachCartButtonEvents();
}

// ---------- Button Events ----------
function attachCartButtonEvents() {
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.target.getAttribute("data-index");
      cart.splice(idx, 1);
      saveCart();
      showMessage("🗑 Item removed", "#dc3545");
    });
  });

  document.querySelectorAll(".increase").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.target.getAttribute("data-index");
      cart[idx].qty++;
      saveCart();
      showMessage("🔼 Quantity increased");
    });
  });

  document.querySelectorAll(".decrease").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.target.getAttribute("data-index");
      if (cart[idx].qty > 1) {
        cart[idx].qty--;
        showMessage("🔽 Quantity decreased");
      } else {
        cart.splice(idx, 1);
        showMessage("🗑 Item removed", "#dc3545");
      }
      saveCart();
    });
  });
}

// ---------- Save + Re-render ----------
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  renderCart();
}

// ---------- Add To Cart ----------
export function addToCart(data, id) {
  const price = parseFloat(data.price) || 0;
  const discount = parseFloat(data.discount) || 0;
  const finalPrice =
    discount > 0 ? (price * (1 - discount / 100)).toFixed(2) : price.toFixed(2);

  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty++;
    showMessage("🛒 Quantity increased!");
  } else {
    const item = {
      id,
      name: data.name,
      price,
      discount,
      finalPrice,
      image: data.image || data.images?.[0] || "",
      qty: 1,
    };
    cart.push(item);
    showMessage("✅ Added to cart!");
  }

  saveCart();
}

// ---------- Modal Behavior ----------
if (cartIcon && cartModal && cartOverlay) {
  cartIcon.addEventListener("click", () => {
    renderCart();
    cartModal.classList.add("open");
    cartOverlay.classList.add("active");
  });

  closeCart?.addEventListener("click", () => {
    cartModal.classList.remove("open");
    cartOverlay.classList.remove("active");
  });

  cartOverlay.addEventListener("click", () => {
    cartModal.classList.remove("open");
    cartOverlay.classList.remove("active");
  });
}

// ---------- Checkout ----------
checkoutBtn?.addEventListener("click", () => {
  if (!cart || cart.length === 0){
    alert("Your cart is empty.");
    return;
  }

  localStorage.setItem("checkoutCart", JSON.stringify(cart));

  window.location.href = "checkout.html";
});

// ---------- Initialize ----------
window.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
});
