import { model, models, Schema, type Model } from "mongoose";

export type UserRole = "farmer" | "wholesaler" | "transporter";

export type IUser = {
  role: UserRole;
  name: string;
  phone: string;
  password: string;
  district: string;
  idNumber?: string;
  carPlateNumber?: string;
  companyName?: string;
};

const userSchema = new Schema<IUser>(
  {
    role: {
      type: String,
      enum: ["farmer", "wholesaler", "transporter"],
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    district: { type: String, required: true },
    idNumber: { type: String },
    carPlateNumber: { type: String },
    companyName: { type: String },
  },
  { timestamps: true },
);

const User: Model<IUser> = models.User || model<IUser>("User", userSchema);

export default User;
