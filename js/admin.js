const ordersTableBody = document.querySelector("#orders-table-body");

const totalOrdersElement = document.querySelector("#total-orders");
const pendingOrdersElement = document.querySelector("#pending-orders");
const totalSalesElement = document.querySelector("#total-sales");

const refreshButton = document.querySelector("#refresh-button");

// Modal elements
const orderModal = document.querySelector("#order-modal");
const closeModalButton = document.querySelector("#close-modal");

const modalOrderId = document.querySelector("#modal-order-id");

const modalCustomerName = document.querySelector("#modal-customer-name");

const modalCustomerEmail = document.querySelector("#modal-customer-email");

const modalCustomerPhone = document.querySelector("#modal-customer-phone");

const modalCustomerAddress = document.querySelector("#modal-customer-address");

const modalOrderItems = document.querySelector("#modal-order-items");

const modalSubtotal = document.querySelector("#modal-subtotal");

const modalShippingCost = document.querySelector("#modal-shipping-cost");

const modalTotal = document.querySelector("#modal-total");

const modalShippingMethod = document.querySelector("#modal-shipping-method");

const modalPaymentMethod = document.querySelector("#modal-payment-method");

const modalCity = document.querySelector("#modal-city");

const modalProvince = document.querySelector("#modal-province");

const modalPostalCode = document.querySelector("#modal-postal-code");

const modalStatus = document.querySelector("#modal-status");

const saveStatusButton = document.querySelector("#save-status-button");

const statusMessage = document.querySelector("#status-message");

let currentOrderId = null;

// Format function
function formatPrice(price) {
  return `Rp${Number(price).toLocaleString("id-ID")}`;
}

function formatMethod(method) {
  if (!method) return "-";

  return method
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(dateString) {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Load all orders
async function loadOrders() {
  ordersTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="loading">
        Loading orders...
      </td>
    </tr>
  `;

  try {
    const response = await fetch("api/orders");

    if (!response.ok) {
      throw new Error("Gagal mengambil data orders.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Gagal mengambil data orders.");
    }

    const orders = data.orders;

    renderSummary(orders);
    renderOrders(orders);
  } catch (error) {
    console.error("ERROR:", error);

    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="loading">
          Gagal mengambil data orders.
        </td>
      </tr>
    `;
  }
}

// Summary
function renderSummary(orders) {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending",
  ).length;

  const totalSales = orders.reduce(
    (total, order) => total + Number(order.total),
    0,
  );

  totalOrdersElement.textContent = totalOrders;

  pendingOrdersElement.textContent = pendingOrders;

  totalSalesElement.textContent = formatPrice(totalSales);
}

// Render orders
function renderOrders(orders) {
  if (orders.length === 0) {
    ordersTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="loading">
          Belum ada order.
        </td>
      </tr>
    `;

    return;
  }

  ordersTableBody.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <span class="order-id">
          #${order.id}
        </span>
      </td>

      <td>
        <span class="customer-name">
          ${order.firstName} ${order.lastName}
        </span>

        <span class="customer-email">
          ${order.email}
        </span>
      </td>

      <td>
        ${formatMethod(order.shipping)}
      </td>

      <td>
        ${formatMethod(order.payment)}
      </td>

      <td>
        <span class="total-price">
          ${formatPrice(order.total)}
        </span>
      </td>

      <td>
        <span class="status-badge">
          ${formatMethod(order.status)}
        </span>
      </td>

      <td>
        ${formatDate(order.createdAt)}
      </td>

      <td>
        <button
          class="view-button"
          data-order-id="${order.id}"
        >
          VIEW
        </button>
      </td>
    `;

    ordersTableBody.appendChild(row);
  });

  // Pasang event listener ke semua tombol VIEW
  const viewButtons = document.querySelectorAll(".view-button");

  viewButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const orderId = button.dataset.orderId;

      openOrderDetail(orderId);
    });
  });
}

// Open order detail
async function openOrderDetail(orderId) {
  // Buka modal
  orderModal.classList.add("active");

  // Tampilkan loading
  modalOrderId.textContent = "Loading...";

  modalOrderItems.innerHTML = `
    <div class="loading">
      Loading order detail...
    </div>
  `;

  try {
    const response = await fetch(`/api/orders/${orderId}`);

    if (!response.ok) {
      throw new Error("Gagal mengambil detail order.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Order tidak ditemukan.");
    }

    const order = data.order;

    renderOrderDetail(order);
  } catch (error) {
    console.error("ERROR DETAIL ORDER:", error);

    modalOrderId.textContent = "ERROR";

    modalOrderItems.innerHTML = `
      <div class="loading">
        Gagal mengambil detail order.
      </div>
    `;
  }
}

// Updata order status
async function updateOrderStatus() {
  if (!currentOrderId) {
    return;
  }

  const newStatus = modalStatus.value;

  saveStatusButton.disabled = true;
  saveStatusButton.textContent = "SAVING...";

  statusMessage.textContent = "";

  try {
    const response = await fetch(
      `/api/orders/${currentOrderId}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          status: newStatus,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Gagal mengubah status.");
    }

    statusMessage.textContent = "Status berhasil diperbarui.";

    // Refresh tabel order
    await loadOrders();
  } catch (error) {
    console.error("ERROR UPDATE STATUS:", error);

    statusMessage.textContent = "Gagal memperbarui status.";
  } finally {
    saveStatusButton.disabled = false;
    saveStatusButton.textContent = "SAVE STATUS";
  }
}

// Render order detail
function renderOrderDetail(order) {
  modalOrderId.textContent = `#${order.id}`;

  // Customer
  modalCustomerName.textContent = `${order.firstName} ${order.lastName}`;

  modalCustomerEmail.textContent = order.email;

  modalCustomerPhone.textContent = order.phone;

  modalCustomerAddress.textContent = order.address;

  // Products
  modalOrderItems.innerHTML = "";

  order.items.forEach((item) => {
    const itemElement = document.createElement("div");

    itemElement.className = "modal-order-item";

    itemElement.innerHTML = `
      <div class="modal-item-info">

        <span class="modal-item-name">
          ${item.name}
        </span>

        <span class="modal-item-quantity">
          Qty ${item.quantity}
          × ${formatPrice(item.price)}
        </span>

      </div>

      <span class="modal-item-price">
        ${formatPrice(item.subtotal)}
      </span>
    `;

    modalOrderItems.appendChild(itemElement);
  });

  // Summary
  modalSubtotal.textContent = formatPrice(order.subtotal);

  modalShippingCost.textContent = formatPrice(order.shippingCost);

  modalTotal.textContent = formatPrice(order.total);

  // Shipping & payment
  modalShippingMethod.textContent = formatMethod(order.shipping);

  modalPaymentMethod.textContent = formatMethod(order.payment);

  modalCity.textContent = order.city;

  modalProvince.textContent = order.province;

  modalPostalCode.textContent = order.postalCode;

  modalStatus.value = order.status;

  currentOrderId = order.id;

  statusMessage.textContent = "";
}

// Close modal
closeModalButton.addEventListener("click", () => {
  orderModal.classList.remove("active");
});

// Klik area gelap di luar modal
orderModal.addEventListener("click", (event) => {
  if (event.target === orderModal) {
    orderModal.classList.remove("active");
  }
});

// Tombol ESC untuk menutup
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && orderModal.classList.contains("active")) {
    orderModal.classList.remove("active");
  }
});

saveStatusButton.addEventListener("click", updateOrderStatus);

refreshButton.addEventListener("click", loadOrders);
loadOrders();
