import { model, models, Schema, type Model, type Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "awaiting_transport"
  | "in_delivery"
  | "completed";

export type IOrder = {
  productId: Types.ObjectId;
  farmerId: Types.ObjectId;
  wholesalerId: Types.ObjectId;
  transporterId?: Types.ObjectId;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

const orderSchema = new Schema<IOrder>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    wholesalerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transporterId: { type: Schema.Types.ObjectId, ref: "User" },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "awaiting_transport", "in_delivery", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Order: Model<IOrder> = models.Order || model<IOrder>("Order", orderSchema);

export default Order;
