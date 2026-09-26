const CART_KEY = "romandCart";

const checkoutItems = document.querySelector("#checkout-items");
const subtotalElement = document.querySelector("#checkout-subtotal");
const shippingElement = document.querySelector("#checkout-shipping");
const totalElement = document.querySelector("#checkout-total");

const payButton = document.querySelector("#pay-button");

// get cart
function getCart() {
  const cart = localStorage.getItem(CART_KEY);

  if (!cart) {
    return [];
  }

  try {
    return JSON.parse(cart);
  } catch (error) {
    console.error("Cart tidak valid:", error);

    return [];
  }
}

// format price
function formatPrice(price) {
  return `Rp${Number(price).toLocaleString("id-ID")}`;
}

// get shipping
function getShippingCost() {
  const selectedShipping = document.querySelector(
    'input[name="shipping"]:checked',
  );

  if (!selectedShipping) {
    alert("Please select shipping method.");
    return;
  }
  const shipping = selectedShipping.value;

  if (selectedShipping.value === "express") {
    return 30000;
  }

  return 15000;
}

// render order
function renderOrder() {
  const cart = getCart();

  checkoutItems.innerHTML = "";

  if (cart.length === 0) {
    checkoutItems.innerHTML = `
      <p>
        Your bag is empty.
      </p>
    `;

    subtotalElement.textContent = "Rp0";
    shippingElement.textContent = "Rp0";
    totalElement.textContent = "Rp0";

    payButton.disabled = true;

    return;
  }

  let subtotal = 0;

  cart.forEach((item) => {
    const itemTotal = Number(item.price) * Number(item.quantity);

    subtotal += itemTotal;

    const itemElement = document.createElement("div");

    itemElement.className = "checkout-item";

    itemElement.innerHTML = `
      <div class="checkout-item-image">

        <img
          src="${item.image}"
          alt="${item.name}"
        />

      </div>


      <div class="checkout-item-info">

        <h3>
          ${item.name}
        </h3>

        <p>
          Qty ${item.quantity}
        </p>

      </div>


      <span class="checkout-item-price">
        ${formatPrice(itemTotal)}
      </span>
    `;

    checkoutItems.appendChild(itemElement);
  });

  updateTotal(subtotal);
}

// update total
function updateTotal(subtotal) {
  const shipping = getShippingCost();

  const total = subtotal + shipping;

  subtotalElement.textContent = formatPrice(subtotal);

  shippingElement.textContent = formatPrice(shipping);

  totalElement.textContent = formatPrice(total);
}

// shipping change
const shippingOptions = document.querySelectorAll('input[name="shipping"]');

shippingOptions.forEach((option) => {
  option.addEventListener("change", () => {
    const cart = getCart();

    const subtotal = cart.reduce(
      (total, item) => total + Number(item.price) * Number(item.quantity),
      0,
    );

    updateTotal(subtotal);
  });
});

// pay now
payButton.addEventListener("click", () => {
  const cart = getCart();

  if (cart.length === 0) {
    alert("Your bag is empty.");
    return;
  }

  const email = document.querySelector("#email").value.trim();
  const firstName = document.querySelector("#first-name").value.trim();
  const lastName = document.querySelector("#last-name").value.trim();
  const address = document.querySelector("#address").value.trim();
  const city = document.querySelector("#city").value.trim();
  const province = document.querySelector("#province").value.trim();
  const postalCode = document.querySelector("#postal-code").value.trim();
  const phone = document.querySelector("#phone").value.trim();

  if (
    !email ||
    !firstName ||
    !lastName ||
    !address ||
    !city ||
    !province ||
    !postalCode ||
    !phone
  ) {
    alert("Please complete all required information.");
    return;
  }

  const selectedShipping = document.querySelector(
    'input[name="shipping"]:checked',
  );

  if (!selectedShipping) {
    alert("Please select a shipping method.");
    return;
  }

  const selectedPayment = document.querySelector(
    'input[name="payment"]:checked',
  );

  if (!selectedPayment) {
    alert("Please select a payment method.");
    return;
  }

  const shipping = selectedShipping.value;
  const payment = selectedPayment.value;

  const orderData = {
    customer: {
      email: email,
      firstName: firstName,
      lastName: lastName,
      address: address,
      city: city,
      province: province,
      postalCode: postalCode,
      phone: phone,
    },
    shipping: shipping,
    payment: payment,
    items: cart,
  };

  console.log("ORDER DATA:", orderData);

  fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Gagal mengirim order ke backend.");
      }

      return response.json();
    })
    .then((data) => {
      console.log("RESPONSE BACKEND:", data);

      if (!data.success) {
        throw new Error(data.message || "Order gagal diproses.");
      }

      console.log("ORDER BERHASIL, MENGHAPUS CART");

      localStorage.removeItem(CART_KEY);

      console.log("CART SETELAH DIHAPUS:", localStorage.getItem(CART_KEY));

      window.location.href = `confirmation.html?orderId=${data.orderId}&total=${data.total}`;
    })

    .catch((error) => {
      console.error("ERROR:", error);
      alert("Gagal terhubung ke backend.");
    });
});

renderOrder();
