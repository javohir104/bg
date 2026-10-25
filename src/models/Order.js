const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true, trim: true, maxlength: 80 },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  address: { type: String, trim: true, maxlength: 200, default: "" },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, max: 20 },
    unitPrice: { type: Number, required: true, min: 0 }
  }],
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["new", "confirmed", "completed", "cancelled"], default: "new" }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
