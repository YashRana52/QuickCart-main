import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,

      required: true,
    },
    items: [
      {
        product: {
          type: String,

          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: {
      type: String,

      required: true,
    },
    status: { type: String, default: "Order Placed", required: true },
    date: { type: Number, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;
