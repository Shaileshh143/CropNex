import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IForecast extends Document {
  commodity: string;
  mandi: string;
  currentPrice: number;
  projected30DayPrice: number;
  trend: 'up' | 'down' | 'stable';
  confidenceScore: number;
  harvestArrivalStatus: string;
  historicalPrices: { date: string; price: number }[];
  projectedPrices: { date: string; price: number }[];
  recommendation: string;
  updatedAt: Date;
}

const ForecastSchema = new Schema<IForecast>(
  {
    commodity: { type: String, required: true },
    mandi: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    projected30DayPrice: { type: Number, required: true },
    trend: { type: String, enum: ['up', 'down', 'stable'], default: 'up' },
    confidenceScore: { type: Number, default: 85 },
    harvestArrivalStatus: { type: String, default: 'Moderate' },
    historicalPrices: [
      {
        date: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    projectedPrices: [
      {
        date: { type: String, required: true },
        price: { type: Number, required: true },
      },
    ],
    recommendation: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Forecast: Model<IForecast> =
  mongoose.models.Forecast || mongoose.model<IForecast>('Forecast', ForecastSchema);
