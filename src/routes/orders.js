const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");

const router = express.Router();

// POST /orders — guest checkout; operator contacts the customer to confirm.
router.post("/", async (req, res, next) => {
  try {
    const { customerName, phone, address = "", items } = req.body || {};
    if (typeof customerName !== "string" || !customerName.trim() || customerName.trim().length > 80) {
      return res.status(400).json({ error: "Ismni to‘g‘ri kiriting" });
    }
    if (typeof phone !== "string" || !/^\+?[0-9\s()-]{9,24}$/.test(phone.trim())) {
      return res.status(400).json({ error: "Telefon raqamini tekshiring" });
    }
    if (typeof address !== "string" || address.length > 200) return res.status(400).json({ error: "Manzil juda uzun" });
    if (!Array.isArray(items) || !items.length || items.length > 30) return res.status(400).json({ error: "Savat bo‘sh yoki mahsulotlar soni noto‘g‘ri" });
    const quantities = new Map();
    for (const item of items) {
      if (!item || !mongoose.Types.ObjectId.isValid(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        return res.status(400).json({ error: "Savatdagi mahsulot ma’lumotlarini tekshiring" });
      }
      quantities.set(String(item.productId), (quantities.get(String(item.productId)) || 0) + item.quantity);
    }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] } }).lean();
    if (products.length !== quantities.size) return res.status(400).json({ error: "Mahsulotlardan biri endi mavjud emas. Sahifani yangilang." });
    const orderItems = products.map(product => ({
      product: product._id, name: product.name, quantity: quantities.get(String(product._id)), unitPrice: product.price
    }));
    const total = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const order = await Order.create({ customerName: customerName.trim(), phone: phone.trim(), address: address.trim(), items: orderItems, total });
    res.status(201).json({ id: order._id, total: order.total, status: order.status });
  } catch (err) { next(err); }
});

module.exports = router;
