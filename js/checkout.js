// Cart Data
const CART_KEY = "romandCart";
const addCartButtons = document.querySelectorAll(".add-cart");
const cartCount = document.querySelector("#cart-count");

// get cart
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

// update cart count
function updateCartCount() {
  const cart = getCart();
  const totalQuantity = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0,
  );
  if (cartCount) {
    cartCount.textContent = totalQuantity;
  }
}

// Add to Cart Function
function addToCart(productCard) {
  if (!productCard) return;

  const id =
    productCard.dataset.id ||
    productCard.querySelector(".product-number")?.textContent?.trim() ||
    "01";
  const name = productCard.dataset.name || "";
  const price = Number(productCard.dataset.price) || 0;
  const image = productCard.dataset.image || "";
  const description = productCard.dataset.description || "";

  const cart = getCart();
  const existingProduct = cart.find((item) => item.id == id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      image: image,
      description: description,
      quantity: 1,
    });
  }

  saveCart(cart);
  updateCartCount();

  // Feedback animasi tombol
  const button = productCard.querySelector(".add-cart");
  if (button) {
    const originalText = button.textContent;
    button.textContent = "ADDED ✓";
    button.style.backgroundColor = "#edf13c";
    button.style.color = "#111";

    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = "";
      button.style.color = "";
    }, 1000);
  }
}

// Button Event
addCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const productCard = button.closest(".product-card");
    addToCart(productCard);
  });
});

// Update cart count on page load
updateCartCount();
