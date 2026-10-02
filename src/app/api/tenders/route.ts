import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Tender } from '@/models/Tender';
import { INITIAL_TENDERS } from '@/lib/initialData';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (db) {
      const tenders = await Tender.find();
      if (tenders && tenders.length > 0) {
        return NextResponse.json({ success: true, count: tenders.length, data: tenders });
      }
    }
    return NextResponse.json({ success: true, count: INITIAL_TENDERS.length, data: INITIAL_TENDERS });
  } catch (error) {
    return NextResponse.json({ success: true, data: INITIAL_TENDERS, fallback: true });
  }
}
