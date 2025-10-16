// =============================
// Firebase Setup
// =============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDgplNJfWpHKu_pHIROonwE6zj-4zUSetA",
  authDomain: "ecommerce-52a65.firebaseapp.com",
  projectId: "ecommerce-52a65",
  storageBucket: "ecommerce-52a65.appspot.com",
  messagingSenderId: "510866427688",
  appId: "1:510866427688:web:f730f3ffa83fd15a390a1d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================
// Cart Logic (localStorage + Qty Control)
// =============================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Cache DOM elements (performance boost)
const cartCount = document.getElementById("cartCount");
const cartPage = document.getElementById("cartPage");
const cartList = document.getElementById("cartList");
const cartTotal = document.getElementById("cartTotal");
const cartIcon = document.getElementById("cartIcon");
const closeCart = document.getElementById("closeCart");
const refreshBtn = document.getElementById("refreshBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Render cart UI
function renderCart() {
  cartList.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    // Apply discount if available
    const finalPrice =
      item.price && item.discount
        ? (item.price - (item.price * item.discount) / 100).toFixed(2)
        : Number(item.price).toFixed(2);

    total += parseFloat(finalPrice) * item.qty;

    // Create cart item element
    const li = document.createElement("li");
    li.innerHTML = `
        ${item.image ? `<img src="${item.image}" alt="${item.name}" />` : ""}
        <div class="info" style="flex:1">
          <strong>${item.name}</strong><br/>
          ${
            item.discount
              ? `<span style="text-decoration:line-through;">$${Number(
                  item.price
                ).toFixed(2)}</span>
                 <span style="color:green;font-weight:bold;">$${finalPrice}</span>`
              : `$${Number(item.price).toFixed(2)}`
          }
          <br/>
          Subtotal: $${(parseFloat(finalPrice) * item.qty).toFixed(2)}
          <br/>
          <div style="margin-top:8px; display:inline-flex; align-items:center;">
            <button class="decrease" data-index="${index}">➖</button>
            <span style="margin:0 10px; min-width:24px; text-align:center;">${
              item.qty
            }</span>
            <button class="increase" data-index="${index}">➕</button>
          </div>
        </div>
        <div>
          <button class="remove" data-index="${index}">🗑</button>
        </div>
      `;
    cartList.appendChild(li);
  });

  // === Event binding for cart controls ===
  cartList.querySelectorAll(".increase").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const i = +e.currentTarget.dataset.index;
      cart[i].qty++;
      saveCart();
      renderCart();
    })
  );

  cartList.querySelectorAll(".decrease").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const i = +e.currentTarget.dataset.index;
      if (cart[i].qty > 1) {
        cart[i].qty--;
      } else {
        cart.splice(i, 1); // remove item if qty = 0
      }
      saveCart();
      renderCart();
    })
  );

  cartList.querySelectorAll(".remove").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const i = +e.currentTarget.dataset.index;
      cart.splice(i, 1);
      saveCart();
      renderCart();
    })
  );

  // Update cart summary
  cartCount.textContent = cart.reduce((sum, it) => sum + (it.qty || 0), 0);
  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

// Add product to cart
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    product.qty = 1;
    cart.push(product);
  }
  saveCart();
  renderCart();
}

// =============================
// Cart UI Events
// =============================
cartIcon.addEventListener("click", () => {
  cartPage.style.display = "flex";
  cartPage.setAttribute("aria-hidden", "false");
});
closeCart.addEventListener("click", () => {
  cartPage.style.display = "none";
  cartPage.setAttribute("aria-hidden", "true");
});
refreshBtn.addEventListener("click", () => location.reload());

// Init cart render
renderCart();

// =============================
// Product Loader (Firestore)
// =============================
const params = new URLSearchParams(window.location.search);
const cat = params.get("cat");
const id = params.get("id");

async function loadProduct() {
  if (!cat || !id) {
    document.body.innerHTML = "<h2>Invalid Product</h2>";
    return;
  }

  try {
    const docRef = doc(db, "Food", cat, "Items", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      document.body.innerHTML = "<h2>Product not found</h2>";
      return;
    }

    const data = docSnap.data();

    // Fill product details
    document.getElementById("prodName").textContent = data.name || "";
    document.getElementById("prodId").textContent = data.id || id;
    document.getElementById("prodCat").textContent = cat;
    document.getElementById("prodType").textContent = data.type || "";
    document.getElementById("prodPrice").textContent = data.price ?? "0";
    document.getElementById("prodSize").textContent = data.size || "N/A";
    document.getElementById("prodDiscount").textContent = data.discount ?? 0;
    document.getElementById("prodStatus").textContent = data.status || "";
    document.getElementById("prodDesc").textContent = data.description || "";

    // =============================
    // Product Images
    // =============================
    const imagesDiv = document.getElementById("prodImages");
    const mainImg = document.getElementById("mainImg");

    let images = [];
    let currentIndex = 0;
    imagesDiv.innerHTML = "";

    if (Array.isArray(data.images) && data.images.length) {
      images = data.images;
      mainImg.src = images[0];

      // Thumbnails
      images.forEach((img, index) => {
        const thumb = document.createElement("img");
        thumb.src = img;
        thumb.alt = `thumb-${index}`;
        thumb.addEventListener("click", () => {
          mainImg.src = img;
          currentIndex = index;
        });
        imagesDiv.appendChild(thumb);
      });
    } else {
      mainImg.src = "https://via.placeholder.com/500x400?text=No+Image";
    }

    // =============================
    // Price Display (with Discount)
    // =============================
    const priceContainer = document.getElementById("priceContainer");
    const originalPrice = parseFloat(data.price) || 0;
    const discount = parseFloat(data.discount) || 0;

    if (discount > 0) {
      const discountedPrice = (originalPrice * (1 - discount / 100)).toFixed(2);
      priceContainer.innerHTML = `
          <span style="text-decoration: line-through; color: gray; margin-right: 10px;">
            $${originalPrice.toFixed(2)}
          </span>
          <span style="color: red; font-weight: bold;">
            $${discountedPrice}
          </span>
        `;
    } else {
      priceContainer.textContent = `$${originalPrice.toFixed(2)}`;
    }

    // =============================
    // Add to Cart Button
    // =============================
    document.getElementById("addToCartBtn").addEventListener("click", () => {
      addToCart({
        id,
        category: cat,
        name: data.name || "Product",
        price: Number(data.price) || 0,
        discount: Number(data.discount) || 0,
        image: images.length ? images[0] : "https://via.placeholder.com/150",
      });
    });

    // =============================
    // Zoom Effect
    // =============================
    const mainImageContainer = document.querySelector(".main-image");
    mainImg.addEventListener("mousemove", (e) => {
      const rect = mainImageContainer.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      mainImg.style.transformOrigin = `${x}% ${y}%`;
      mainImg.classList.add("zoomed");
    });
    mainImg.addEventListener("mouseleave", () => {
      mainImg.classList.remove("zoomed");
      mainImg.style.transformOrigin = "center center";
    });

    // =============================
    // Fullscreen View
    // =============================
    const overlay = document.getElementById("fullscreenOverlay");
    const fullscreenImg = document.getElementById("fullscreenImg");
    const closeBtn = document.getElementById("closeBtn");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

    function showImage(index) {
      if (!images.length) return;
      currentIndex = (index + images.length) % images.length;
      fullscreenImg.src = images[currentIndex];
    }

    mainImg.addEventListener("click", () => {
      if (!images.length) return;
      fullscreenImg.src = mainImg.src;
      overlay.style.display = "flex";
      overlay.setAttribute("aria-hidden", "false");
      currentIndex = images.indexOf(mainImg.src);
    });

    closeBtn.addEventListener("click", () => {
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.style.display = "none";
        overlay.setAttribute("aria-hidden", "true");
      }
    });

    prevBtn.addEventListener("click", () => showImage(currentIndex - 1));
    nextBtn.addEventListener("click", () => showImage(currentIndex + 1));

    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
      if (overlay.style.display === "flex") {
        if (e.key === "ArrowLeft") showImage(currentIndex - 1);
        if (e.key === "ArrowRight") showImage(currentIndex + 1);
        if (e.key === "Escape") {
          overlay.style.display = "none";
          overlay.setAttribute("aria-hidden", "true");
        }
      }
    });
  } catch (err) {
    console.error("Error loading product:", err);
    document.body.innerHTML = "<h2>Error loading product</h2>";
  }
}

// Start loading product
loadProduct();

// =============================
// Checkout Button
// =============================
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Your cart is empty!");
  } else {
    alert("Proceeding to checkout...");
    window.location.href = "/checkout.html";
  }
});
