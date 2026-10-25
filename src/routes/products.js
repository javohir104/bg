const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

function validId(id) { return mongoose.Types.ObjectId.isValid(id); }

// GET /products?q=...&minPrice=...&maxPrice=...&sort=price_asc|price_desc|newest
router.get("/", async (req, res, next) => {
  try {
    const { q, minPrice, maxPrice, sort } = req.query;
    const filter = {};
    if (typeof q === "string" && q.trim()) {
      const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { description: { $regex: escaped, $options: "i" } },
        { brand: { $regex: escaped, $options: "i" } }, 
      ];
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const range = {};
      if (minPrice !== undefined && minPrice !== "") {
        const value = Number(minPrice);
        if (!Number.isFinite(value) || value < 0) return res.status(400).json({ error: "minPrice must be a non-negative number" });
        range.$gte = value;
      }
      if (maxPrice !== undefined && maxPrice !== "") {
        const value = Number(maxPrice);
        if (!Number.isFinite(value) || value < 0) return res.status(400).json({ error: "maxPrice must be a non-negative number" });
        range.$lte = value;
      }
      if (range.$gte !== undefined && range.$lte !== undefined && range.$gte > range.$lte) {
        return res.status(400).json({ error: "minPrice cannot be greater than maxPrice" });
      }
      if (Object.keys(range).length) filter.price = range;
    }
    const sortBy = sort === "price_asc" ? { price: 1 } : sort === "price_desc" ? { price: -1 } : { createdAt: -1 };
    const products = await Product.find(filter).sort(sortBy).limit(200).lean();
    res.json(products);
  } catch (err) { next(err); }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, brand, image, category, price, description } = req.body || {};
    if (typeof name !== "string" || !name.trim() || typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      return res.status(400).json({ error: "name (non-empty string) and price (non-negative number) are required" });
    }
    const product = await Product.create({ name: name.trim(), brand: typeof brand === "string" ? brand.trim() : "", image: typeof image === "string" ? image.trim() : "", category: category === "flagship" ? "flagship" : "budget", price, description: typeof description === "string" ? description.trim() : "", createdBy: req.user.sub || req.user.id });
    res.status(201).json(product);
  } catch (err) { next(err); }
});

router.put("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });
    const ownerId = String(existing.createdBy);
    if (req.user.role !== "admin" && ownerId !== String(req.user.sub)) {
      return res.status(403).json({ error: "You can only edit your own listing" });
    }
    const { name, brand, image, category, price, description } = req.body || {};
    const update = {};
    if (brand !== undefined) {
      if (typeof brand !== "string") return res.status(400).json({ error: "brand must be a string" });
      update.brand = brand.trim();
    }
    if (image !== undefined) {
      if (typeof image !== "string") return res.status(400).json({ error: "image must be a string" });
      update.image = image.trim();
    }
    if (category !== undefined) {
      if (!["flagship", "budget"].includes(category)) return res.status(400).json({ error: "category must be flagship or budget" });
      update.category = category;
    }
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) return res.status(400).json({ error: "name must be a non-empty string" });
      update.name = name.trim();
    }
    if (price !== undefined) {
      if (typeof price !== "number" || !Number.isFinite(price) || price < 0) return res.status(400).json({ error: "price must be a non-negative number" });
      update.price = price;
    }
    if (description !== undefined) {
      if (typeof description !== "string") return res.status(400).json({ error: "description must be a string" });
      update.description = description.trim();
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ error: "Invalid product id" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const ownerId = String(product.createdBy);
    if (req.user.role !== "admin" && ownerId !== String(req.user.sub)) {
      return res.status(403).json({ error: "You can only delete your own listing" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted", id: product._id });
  } catch (err) { next(err); }
});

module.exports = router;
