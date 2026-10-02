import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  pricePerKg: number;
  quantity: number;
  unit: string;
  total: number;
  image?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  district: string;
  items: IOrderItem[];
  subtotal: number;
  logisticsFee: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Mandi Escrow' | 'Cash on Farm-Gate' | 'Net Banking';
  status: 'Pending' | 'Accepted' | 'Dispatched' | 'Delivered' | 'Cancelled';
  trackingHistory: {
    status: string;
    description: string;
    timestamp: Date;
    location: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  pricePerKg: { type: Number, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  total: { type: Number, required: true },
  image: { type: String },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    buyerName: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    buyerPhone: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    district: { type: String, default: 'Pune' },
    items: [OrderItemSchema],
    subtotal: { type: Number, required: true },
    logisticsFee: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Mandi Escrow', 'Cash on Farm-Gate', 'Net Banking'],
      default: 'Mandi Escrow',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    trackingHistory: [
      {
        status: { type: String, required: true },
        description: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String, default: 'Farm Gate Hub' },
      },
    ],
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
