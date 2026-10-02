import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import { Forecast } from '@/models/Forecast';
import { Tender } from '@/models/Tender';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_FORECASTS, INITIAL_TENDERS } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({
        success: false,
        message: 'Could not connect to MongoDB. Ensure MongoDB is running on mongodb://127.0.0.1:27017 or provide MONGODB_URI in .env.local',
      }, { status: 503 });
    }

    // Seed Products
    await Product.deleteMany({});
    await Product.insertMany(
      INITIAL_PRODUCTS.map((p) => ({
        name: p.name,
        hindiName: p.hindiName,
        marathiName: p.marathiName,
        category: p.category,
        pricePerKg: p.pricePerKg,
        availableQuantity: p.availableQuantity,
        minOrderQuantity: p.minOrderQuantity,
        unit: p.unit,
        grade: p.grade,
        farmLocation: p.farmLocation,
        district: p.district,
        farmerName: p.farmerName,
        farmerPhone: p.farmerPhone,
        harvestDate: p.harvestDate,
        organic: p.organic,
        image: p.image,
        description: p.description,
        shelfLifeDays: p.shelfLifeDays,
        featured: p.isBestSeller ?? false,
      }))
    );

    // Seed Orders
    await Order.deleteMany({});
    await Order.insertMany(INITIAL_ORDERS);

    // Seed Forecasts
    await Forecast.deleteMany({});
    await Forecast.insertMany(INITIAL_FORECASTS);

    // Seed Tenders
    await Tender.deleteMany({});
    await Tender.insertMany(INITIAL_TENDERS);

    return NextResponse.json({
      success: true,
      message: 'MongoDB successfully seeded with CropNex agricultural data!',
      counts: {
        products: INITIAL_PRODUCTS.length,
        orders: INITIAL_ORDERS.length,
        forecasts: INITIAL_FORECASTS.length,
        tenders: INITIAL_TENDERS.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
