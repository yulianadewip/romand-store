const CART_KEY = "romandCart";

const bagItems = document.querySelector("#bag-items");
const bagCount = document.querySelector("#bag-count");

const subtotalElement = document.querySelector("#subtotal");
const totalElement = document.querySelector("#total");

const emptyBag = document.querySelector("#empty-bag");
const bagContent = document.querySelector(".bag-content");

const checkoutButton = document.querySelector("#checkout-button");

// Get cart
function getCart() {
  const cart = localStorage.getItem(CART_KEY);

  if (!cart) {
    return [];
  }

  try {
    return JSON.parse(cart);
  } catch (error) {
    console.error("Cart data tidak valid:", error);
    return [];
  }
}

// save cart
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Format price
function formatPrice(price) {
  return `Rp${Number(price).toLocaleString("id-ID")}`;
}

// update bag count
function updateBagCount(cart) {
  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  bagCount.textContent = totalQuantity;
}

// render bag
function renderBag() {
  const cart = getCart();

  updateBagCount(cart);

  bagItems.innerHTML = "";

  // empty bag
  if (cart.length === 0) {
    bagContent.style.display = "none";
    emptyBag.style.display = "block";

    subtotalElement.textContent = "Rp0";
    totalElement.textContent = "Rp0";

    return;
  }

  // show bag
  bagContent.style.display = "grid";
  emptyBag.style.display = "none";

  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = Number(item.price) * item.quantity;

    subtotal += itemTotal;

    const article = document.createElement("article");

    article.className = "bag-item";

    article.innerHTML = `
      <div class="bag-item-image">
        <img
          src="${item.image}"
          alt="${item.name}"
        />
      </div>

      <div class="bag-item-info">

        <span class="bag-item-number">
          ${item.id}
        </span>

        <h2 class="bag-item-name">
          ${item.name}
        </h2>

        <p class="bag-item-description">
          ${item.description || ""}
        </p>

        <div class="bag-item-bottom">

          <div>
            <p class="bag-item-price">
              ${formatPrice(item.price)}
            </p>

            <button
              class="remove-item"
              data-id="${item.id}"
            >
              REMOVE
            </button>
          </div>

          <div class="quantity-control">

            <button
              class="quantity-button decrease"
              data-id="${item.id}"
            >
              −
            </button>

            <span class="quantity-number">
              ${item.quantity}
            </span>

            <button
              class="quantity-button increase"
              data-id="${item.id}"
            >
              +
            </button>

          </div>

        </div>

      </div>
    `;

    bagItems.appendChild(article);
  });

  // update total
  subtotalElement.textContent = formatPrice(subtotal);
  totalElement.textContent = formatPrice(subtotal);
}

// Mengubah jumlah produk
function changeQuantity(id, amount) {
  const cart = getCart();

  const item = cart.find((product) => product.id === id);

  if (!item) {
    return;
  }

  item.quantity += amount;

  // Remove item if quantity becomes 0
  if (item.quantity <= 0) {
    const updatedCart = cart.filter((product) => product.id !== id);

    saveCart(updatedCart);
  } else {
    saveCart(cart);
  }

  renderBag();
}

// Mengurangi item barang
function removeItem(id) {
  const cart = getCart();

  const updatedCart = cart.filter((item) => item.id !== id);

  saveCart(updatedCart);

  renderBag();
}

bagItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) {
    return;
  }

  const id = button.dataset.id;

  if (!id) {
    return;
  }

  // plus
  if (button.classList.contains("increase")) {
    changeQuantity(id, 1);
  }

  // minus
  if (button.classList.contains("decrease")) {
    changeQuantity(id, -1);
  }

  // remove
  if (button.classList.contains("remove-item")) {
    removeItem(id);
  }
});

checkoutButton.addEventListener("click", (event) => {
  event.preventDefault();

  const cart = getCart();

  if (cart.length === 0) {
    return;
  }

  // Untuk sementara menuju halaman checkout
  window.location.href = "checkout-detail.html";
});

renderBag();
