const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "Avtobozor API" }));
app.get("/", (_req, res) => res.json({ ok: true, service: "Telefon Market API" }));
app.use((err, _req, res, _next) => {
  console.error(err && err.message ? err.message : err);
  if (err && err.code === 11000) return res.status(409).json({ error: "This email is already registered" });
  if (err && err.name === "ValidationError") return res.status(400).json({ error: err.message });
  return res.status(500).json({ error: "Server error. Please try again later." });
});

const port = Number(process.env.PORT) || 3000;
connectDB().then(() => {
  app.listen(port, () => console.log(`Avtobozor running at http://localhost:${port}`));
}).catch((err) => {
  console.error("Failed to connect to MongoDB. Check MONGODB_URI in .env:", err.message);
  process.exit(1);
});
