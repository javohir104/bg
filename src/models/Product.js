const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },
    category: { type: String, enum: ["flagship", "budget"], default: "budget" },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
