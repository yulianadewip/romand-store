const express = require("express");
const cors = require("cors");
const db = require("./config/database");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ROM&ND backend is running!",
  });
});

// Create order
app.post("/api/orders", async (req, res) => {
  const { customer, shipping, payment, items } = req.body;

  // Validasi data
  if (!customer || !shipping || !payment || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Data order tidak lengkap.",
    });
  }

  const {
    email,
    firstName,
    lastName,
    address,
    city,
    province,
    postalCode,
    phone,
  } = customer;

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
    return res.status(400).json({
      success: false,
      message: "Data customer tidak lengkap.",
    });
  }

  // Shipping cost
  const shippingCost =
    shipping === "express" ? 30000 : shipping === "standard" ? 15000 : null;

  if (shippingCost === null) {
    return res.status(400).json({
      success: false,
      message: "Shipping method tidak valid.",
    });
  }

  let connection;

  try {
    // Ambil koneksi dari MySQL pool
    connection = await db.promise().getConnection();

    // Mulai transaction
    await connection.beginTransaction();

    let subtotal = 0;
    const validatedItems = [];

    // Validasi produk dari database
    for (const item of items) {
      const quantity = Number(item.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantity produk tidak valid.");
      }

      // item.id = product_code
      const [products] = await connection.query(
        `
        SELECT id, product_code, name, price
        FROM products
        WHERE product_code = ?
        `,
        [item.id],
      );

      if (products.length === 0) {
        throw new Error(`Produk ${item.id} tidak ditemukan.`);
      }

      const product = products[0];

      const productPrice = Number(product.price);
      const itemSubtotal = productPrice * quantity;

      subtotal += itemSubtotal;

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        price: productPrice,
        quantity: quantity,
        subtotal: itemSubtotal,
      });
    }

    // Total
    const total = subtotal + shippingCost;

    // Insert into order
    const [orderResult] = await connection.query(
      `
      INSERT INTO orders
      (
        email,
        first_name,
        last_name,
        address,
        city,
        province,
        postal_code,
        phone,
        shipping_method,
        payment_method,
        subtotal,
        shipping_cost,
        total,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        email,
        firstName,
        lastName,
        address,
        city,
        province,
        postalCode,
        phone,
        shipping,
        payment,
        subtotal,
        shippingCost,
        total,
        "pending",
      ],
    );

    const orderId = orderResult.insertId;

    // Insert semua data order item
    for (const item of validatedItems) {
      await connection.query(
        `
        INSERT INTO order_items
        (
          order_id,
          product_id,
          product_name,
          price,
          quantity,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          orderId,
          item.productId,
          item.productName,
          item.price,
          item.quantity,
          item.subtotal,
        ],
      );
    }

    // Commit semua query
    await connection.commit();

    console.log("=================================");
    console.log("ORDER BERHASIL DISIMPAN");
    console.log("Order ID :", orderId);
    console.log("Subtotal :", subtotal);
    console.log("Shipping :", shippingCost);
    console.log("Total    :", total);
    console.log("=================================");

    res.status(201).json({
      success: true,
      message: "Order berhasil disimpan ke database.",
      orderId: orderId,
      subtotal: subtotal,
      shippingCost: shippingCost,
      total: total,
    });
  } catch (error) {
    // Jika terjadi error, batalkan semua query
    if (connection) {
      await connection.rollback();
    }

    console.error("❌ Gagal menyimpan order:", error.message);

    res.status(500).json({
      success: false,
      message: "Gagal menyimpan order ke database.",
    });
  } finally {
    // Kembalikan connection ke pool
    if (connection) {
      connection.release();
    }
  }
});

// Get order detail
app.get("/api/orders/:id", async (req, res) => {
  const orderId = Number(req.params.id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Order ID tidak valid.",
    });
  }

  let connection;

  try {
    connection = await db.promise().getConnection();

    // Ambil informasi order
    const [orders] = await connection.query(
      `
      SELECT
        id,
        email,
        first_name,
        last_name,
        address,
        city,
        province,
        postal_code,
        phone,
        shipping_method,
        payment_method,
        subtotal,
        shipping_cost,
        total,
        status,
        created_at
      FROM orders
      WHERE id = ?
      `,
      [orderId],
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan.",
      });
    }

    // Ambil produk yang ada di order
    const [items] = await connection.query(
      `
      SELECT
        id,
        product_id,
        product_name,
        price,
        quantity,
        subtotal
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC
      `,
      [orderId],
    );

    const order = orders[0];

    res.json({
      success: true,
      order: {
        id: order.id,
        email: order.email,
        firstName: order.first_name,
        lastName: order.last_name,
        address: order.address,
        city: order.city,
        province: order.province,
        postalCode: order.postal_code,
        phone: order.phone,
        shipping: order.shipping_method,
        payment: order.payment_method,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shipping_cost),
        total: Number(order.total),
        status: order.status,
        createdAt: order.created_at,
        items: items.map((item) => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name,
          price: Number(item.price),
          quantity: item.quantity,
          subtotal: Number(item.subtotal),
        })),
      },
    });
  } catch (error) {
    console.error("❌ Gagal mengambil order:", error.message);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil data order.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.get("/api/orders", async (req, res) => {
  let connection;

  try {
    connection = await db.promise().getConnection();

    const [orders] = await connection.query(`
      SELECT
        id,
        email,
        first_name,
        last_name,
        shipping_method,
        payment_method,
        subtotal,
        shipping_cost,
        total,
        status,
        created_at
      FROM orders
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      orders: orders.map((order) => ({
        id: order.id,
        email: order.email,
        firstName: order.first_name,
        lastName: order.last_name,
        shipping: order.shipping_method,
        payment: order.payment_method,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shipping_cost),
        total: Number(order.total),
        status: order.status,
        createdAt: order.created_at,
      })),
    });
  } catch (error) {
    console.error("❌ Gagal mengambil daftar order:", error.message);

    res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar order.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "paid",
    "processing",
    "shipped",
    "completed",
  ];

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Order ID tidak valid.",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status order tidak valid.",
    });
  }

  let connection;

  try {
    connection = await db.promise().getConnection();

    const [result] = await connection.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [status, orderId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Order tidak ditemukan.",
      });
    }

    res.json({
      success: true,
      message: "Status order berhasil diperbarui.",
      orderId: orderId,
      status: status,
    });
  } catch (error) {
    console.error("❌ Gagal mengubah status order:", error.message);

    res.status(500).json({
      success: false,
      message: "Gagal mengubah status order.",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Mulai server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`ROM&ND backend running at http://localhost:${PORT}`);
  });
}

// Untuk Vercel
module.exports = app;
