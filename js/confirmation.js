const orderIdElement = document.querySelector("#order-id");
const orderItemsElement = document.querySelector("#order-items");
const itemCountElement = document.querySelector("#item-count");

const subtotalElement = document.querySelector("#order-subtotal");
const shippingElement = document.querySelector("#order-shipping");
const totalElement = document.querySelector("#order-total");

const shippingMethodElement = document.querySelector("#shipping-method");
const paymentMethodElement = document.querySelector("#payment-method");

// Format price
function formatPrice(price) {
  return `Rp${Number(price).toLocaleString("id-ID")}`;
}

// FOrmat method
function formatMethod(method) {
  if (!method) return "-";

  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

// get order id
const params = new URLSearchParams(window.location.search);
const orderId = params.get("orderId");

if (!orderId) {
  orderItemsElement.innerHTML = `
    <p class="loading">
      Order ID tidak ditemukan.
    </p>
  `;
} else {
  loadOrder(orderId);
}

// Load order
async function loadOrder(orderId) {
  try {
    const response = await fetch(
      `/api/orders/${orderId}`,
    );

    if (!response.ok) {
      throw new Error("Gagal mengambil data order.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Order tidak ditemukan.");
    }

    const order = data.order;

// Order id
    orderIdElement.textContent = `#${order.id}`;

// Items
    orderItemsElement.innerHTML = "";

    let totalQuantity = 0;

    order.items.forEach((item) => {
      totalQuantity += Number(item.quantity);

      const itemElement = document.createElement("div");

      itemElement.className = "order-item";

      itemElement.innerHTML = `
        <div class="order-item-info">
          <span class="order-item-name">
            ${item.name}
          </span>

          <span class="order-item-quantity">
            Qty ${item.quantity}
          </span>
        </div>

        <span class="order-item-price">
          ${formatPrice(item.subtotal)}
        </span>
      `;

      orderItemsElement.appendChild(itemElement);
    });

    itemCountElement.textContent =
      `${totalQuantity} ${totalQuantity === 1 ? "ITEM" : "ITEMS"}`;

// Summary
    subtotalElement.textContent =
      formatPrice(order.subtotal);

    shippingElement.textContent =
      formatPrice(order.shippingCost);

    totalElement.textContent =
      formatPrice(order.total);

// Shipping payment
    shippingMethodElement.textContent =
      formatMethod(order.shipping);

    paymentMethodElement.textContent =
      formatMethod(order.payment);

  } catch (error) {
    console.error("ERROR:", error);

    orderItemsElement.innerHTML = `
      <p class="loading">
        Gagal mengambil data order.
      </p>
    `;
  }
}