import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITender extends Document {
  tenderId: string;
  title: string;
  hindiTitle?: string;
  authority: string;
  category: string;
  quantityRequired: string;
  budgetEst: string;
  district: string;
  state: string;
  deadline: string;
  status: 'Open' | 'Closing Soon' | 'Under Review';
  sourceUrl: string;
  createdAt: Date;
}

const TenderSchema = new Schema<ITender>(
  {
    tenderId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    hindiTitle: { type: String },
    authority: { type: String, required: true },
    category: { type: String, required: true },
    quantityRequired: { type: String, required: true },
    budgetEst: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, default: 'Maharashtra' },
    deadline: { type: String, required: true },
    status: {
      type: String,
      enum: ['Open', 'Closing Soon', 'Under Review'],
      default: 'Open',
    },
    sourceUrl: { type: String, default: 'https://etenders.gov.in' },
  },
  { timestamps: true }
);

export const Tender: Model<ITender> =
  mongoose.models.Tender || mongoose.model<ITender>('Tender', TenderSchema);
