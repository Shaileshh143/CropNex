import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Forecast } from '@/models/Forecast';
import { INITIAL_FORECASTS } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const forecasts = await Forecast.find();
      if (forecasts && forecasts.length > 0) {
        return NextResponse.json({ success: true, count: forecasts.length, data: forecasts });
      }
    }
    return NextResponse.json({ success: true, count: INITIAL_FORECASTS.length, data: INITIAL_FORECASTS });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_FORECASTS, fallback: true });
  }
}
