import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  role: 'farmer' | 'buyer' | 'logistics' | 'admin';
  phone?: string;
  mandiLocation?: string;
  district?: string;
  kycVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'logistics', 'admin'],
      default: 'farmer',
    },
    phone: { type: String, default: '+91 98231 45012' },
    mandiLocation: { type: String, default: 'Nashik APMC Mandi' },
    district: { type: String, default: 'Nashik' },
    kycVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
