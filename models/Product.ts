import { model, models, Schema, type Model, type Types } from "mongoose";

export type IProduct = {
  farmerId: Types.ObjectId;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  district: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const productSchema = new Schema<IProduct>(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true },
    district: { type: String, required: true },
  },
  { timestamps: true },
);

const Product: Model<IProduct> =
  models.Product || model<IProduct>("Product", productSchema);

export default Product;
