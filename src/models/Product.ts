import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  hindiName?: string;
  marathiName?: string;
  category: 'Vegetables' | 'Grains' | 'Fruits' | 'Spices' | 'Pulses';
  pricePerKg: number;
  availableQuantity: number;
  minOrderQuantity: number;
  unit: string;
  grade: 'Grade A+' | 'Grade A' | 'Grade B';
  farmLocation: string;
  district: string;
  state: string;
  farmerName: string;
  farmerPhone: string;
  farmerId?: string;
  kisanId: string; // Govt certified Kisan ID
  barcode: string; // Unique anti-fraud batch barcode
  harvestDate: string;
  harvestDateTime?: string;
  sortingScore?: number;
  organic: boolean;
  labCertificateNo?: string;
  labName?: string;
  labTestDate?: string;
  labResidueResult?: string;
  image: string;
  description: string;
  shelfLifeDays: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    hindiName: { type: String },
    marathiName: { type: String },
    category: {
      type: String,
      required: true,
      enum: ['Vegetables', 'Grains', 'Fruits', 'Spices', 'Pulses'],
    },
    pricePerKg: { type: Number, required: true },
    availableQuantity: { type: Number, required: true, default: 100 },
    minOrderQuantity: { type: Number, required: true, default: 10 },
    unit: { type: String, default: 'kg' },
    grade: {
      type: String,
      enum: ['Grade A+', 'Grade A', 'Grade B'],
      default: 'Grade A',
    },
    farmLocation: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, default: 'Maharashtra' },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, default: '+91 98220 12345' },
    farmerId: { type: String },
    kisanId: { type: String, required: true, default: 'MH-KISAN-902148' },
    barcode: { type: String, required: true, unique: true },
    harvestDate: { type: String, default: 'Within 24 hours' },
    harvestDateTime: { type: String },
    sortingScore: { type: Number, default: 92 },
    organic: { type: Boolean, default: false },
    labCertificateNo: { type: String },
    labName: { type: String },
    labTestDate: { type: String },
    labResidueResult: { type: String },
    image: { type: String, required: true },
    description: { type: String, default: '' },
    shelfLifeDays: { type: Number, default: 7 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
